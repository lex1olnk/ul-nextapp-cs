import { parseEvent, parsePlayerInfo, parseTicks } from "@laihoe/demoparser2";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type PrismaTransactionalClient = Parameters<
  Parameters<PrismaClient["$transaction"]>[0]
>[0];

// Интерфейсы для данных из демо-файла
interface MatchStartEvent {
  map_name?: string;
}

interface PlayerState {
  health: number;
  currentRound: number; // <-- Новое поле
}

interface PlayerSpawnEvent {
  name: string;
  steamid: string;
  team_number: number;
}

interface RoundEndEvent {
  winner?: string;
  reason?: string;
  round: number;
  tick: number;
  round_start_time: number;
  game_phase: number;
}

interface AggregatedDamage {
  hitboxGroup: string;
  hits: number;
  damageReal: number;
  damageNormalized: number;
  remainingHealth: number;
  // Доп. поля, если нужны
  gameId?: string;
  killerId: string;
  victimId: string;
  weaponId: number;
}

interface KillEvent {
  attacker_steamid: string;
  user_steamid: string;
  assister_steamid?: string;
  weapon?: string;
  headshot?: boolean;
  is_warmup_period: boolean;
  total_rounds_played: number;
  round_time?: number;
  attacker_x?: number;
  attacker_y?: number;
  victim_x?: number;
  victim_y?: number;
  assistedflash?: boolean;
  assister_name?: string;
  attacker_name?: string;
  attackerblind?: boolean;
  attackerinair?: boolean;
  distance?: number;
  dmg_armor?: number;
  dmg_health?: number;
  dominated?: number;
  round_start_time: number;
  event_name?: string;
  hitgroup?: string;
  noreplay?: boolean;
  noscope?: boolean;
  penetrated?: number;
  revenge?: number;
  thrusmoke?: boolean;
  tick: number;
  user_name?: string;
  weapon_fauxitemid?: string;
  weapon_itemid?: string;
  weapon_originalowner_xuid?: string;
  wipe?: number;
  game_phase: number;
}

interface DamageEvent {
  attacker_steamid: string;
  user_steamid: string;
  weapon: string;
  dmg_health: number;
  health: number;
  hitgroup: string;
  round_start_time: number;
  total_rounds_played: number;
  game_phase: number;
}

interface GrenadeEvent {
  user_steamid?: string;
  grenade_type?: string;
  x?: number;
  y?: number;
  total_rounds_played: number;
  round_time?: number;
}

class DemoToDatabase {
  private demoPath: string;
  private matchId: string | null = null;
  private matchMapId: string | null = null;
  private playersMap: Map<string, number> = new Map(); // steamId -> userId
  private teamsMap: Map<number, string> = new Map(); // team_num -> teamId
  private roundsMap: Map<
    number,
    { id: string; tick: number; round_time: number }
  > = new Map(); // round_num -> roundId
  constructor(demoPath: string) {
    this.demoPath = demoPath;
  }

  async processDemo(): Promise<void> {
    try {
      console.log("🔄 Начинаем обработку демо-файла...");

      await prisma.$transaction(
        async (tx) => {
          // Проверяем, не обработан ли уже этот демо-файл
          const existingMatch = await tx.match.findUnique({
            where: {
              demoPath: this.demoPath,
            },
          });

          if (existingMatch) {
            console.log("⚠️ Этот демо-файл уже обработан");
            return;
          }

          // Шаг 1: Создаем матч
          await this.createMatch(tx);

          // Шаг 2: Создаем команды
          await this.createTeams(tx);

          // Шаг 3: Обрабатываем игроков
          await this.processPlayers(tx);

          // Шаг 4: Создаем карту матча
          await this.createMatchMap(tx);

          // Шаг 5: Обрабатываем раунды
          await this.processRounds(tx);

          // Шаг 6: Обрабатываем убийства
          await this.processKills(tx);

          // Шаг 7: Обрабатываем урон
          await this.processDamages(tx);

          // Шаг 8: Обрабатываем гранаты
          await this.processGrenades(tx);

          console.log("✅ Обработка завершена успешно!");
        },
        {
          maxWait: 60000, // максимальное время ожидания - 60 секунд
          timeout: 60000, // таймаут транзакции - 60 секунд
        }
      );
    } catch (error) {
      console.error("❌ Ошибка при обработке демо-файла:", error);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }

  private async createMatch(tx: any): Promise<void> {
    const matchInfo = parseEvent(this.demoPath, "match_start", [
      "map_name",
    ]) as MatchStartEvent[];
    const firstMatchInfo = matchInfo[0] || {};

    const match = await tx.match.create({
      data: {
        type: "competitive",
        status: "finished",
        demoPath: this.demoPath,
        bestOf: 1,
        hasWinner: true,
        startedAt: new Date(),
        finishedAt: new Date(),
        maxRoundsCount: 30,
        serverInstanceId: "demo_parser",
        isFinal: false,
        createdAt: new Date(),
      },
    });

    this.matchId = match.id;
    console.log(`📊 Создан матч ID: ${this.matchId}`);
  }

  private async createTeams(tx: any): Promise<void> {
    const teams = [
      { name: "Team A", score: 0, teamNum: 2 },
      { name: "Team B", score: 0, teamNum: 3 },
    ];

    for (const teamData of teams) {
      const team = await tx.matchTeam.create({
        data: {
          name: teamData.name,
          size: 0,
          score: teamData.score,
          teamNum: teamData.teamNum,
          isWinner: false,
          captainId: 1, // Временное значение
          matchId: this.matchId!,
        },
      });
      this.teamsMap.set(teamData.teamNum, team.id);
    }

    console.log(`🏆 Созданы команды для матча`);
  }

  private async processPlayers(tx: PrismaTransactionalClient): Promise<void> {
    const playerInfo: PlayerSpawnEvent[] = parsePlayerInfo(this.demoPath);

    // Сначала создаем всех пользователей
    for (const player of playerInfo) {
      if (!player.steamid) continue;

      const user = await tx.user.upsert({
        where: {
          steamId: player.steamid,
        },
        update: {
          nickName: player.name || `Player_${player.steamid}`,
        },
        create: {
          nickName: player.name || `Player_${player.steamid}`,
          steamId: player.steamid,
        },
      });
      console.log(
        `👤 Создан новый пользователь: ${user.nickName} (SteamID: ${user.steamId})`
      );

      this.playersMap.set(player.steamid, user.id);
    }

    // Затем создаем участников матча
    for (const spawn of playerInfo) {
      if (!spawn.steamid) continue;

      const userId = this.playersMap.get(spawn.steamid);
      if (!userId) continue;

      const teamId = this.teamsMap.get(spawn.team_number || 0);

      await tx.matchMember.create({
        data: {
          hash: `${this.matchId}_${userId}`,
          role: "player",
          ready: true,
          connected: true,
          isLeaver: false,
          matchId: this.matchId!,
          userId: userId,
          matchTeamId: teamId || undefined,
        },
      });
    }

    console.log(`👥 Обработано игроков: ${this.playersMap.size}`);
  }

  private async createMatchMap(tx: any): Promise<void> {
    const matchInfo = parseEvent(this.demoPath, "match_start", [
      "map_name",
    ]) as MatchStartEvent[];
    const firstMatchInfo = matchInfo[0] || {};
    const mapName = firstMatchInfo.map_name || "de_dust2";

    let map = await tx.map.findFirst({
      where: { name: mapName },
    });

    if (!map) {
      const newMapId = await this.generateMapId(tx);
      map = await tx.map.create({
        data: {
          id: newMapId,
          name: mapName,
          preview: `${mapName}_preview.jpg`,
          topview: `${mapName}_topview.jpg`,
        },
      });
    }

    const matchMap = await tx.matchMap.create({
      data: {
        number: 1,
        mapId: map.id,
        startedAt: new Date(),
        finishedAt: new Date(),
        gameStatus: "finished",
        matchId: this.matchId!,
      },
    });

    this.matchMapId = matchMap.id;
    console.log(`🗺️ Создана карта матча: ${mapName}`);
  }

  private async processRounds(tx: any): Promise<void> {
    const roundEnds = parseEvent(
      this.demoPath,
      "round_end",
      ["winner", "reason", "round_num", "mvps"],
      ["round_start_time", "game_phase"]
    ) as RoundEndEvent[];

    for (const roundEnd of roundEnds) {
      if (roundEnd.game_phase === 5) break;
      const roundNum = (roundEnd.round || 0) - 1;

      let winMatchTeamId = this.teamsMap.get(roundEnd.winner === "T" ? 2 : 3);
      if (!winMatchTeamId) {
        console.log(`⚠️ Не найдена команда-победитель для раунда ${roundNum}`);
        continue;
      }

      const round = await tx.round.create({
        data: {
          winReason: roundEnd.reason || "unknown",
          startedAt: new Date(Date.now() - roundNum * 120000),
          finishedAt: new Date(),
          tick: roundEnd.tick,
          winMatchTeamId: winMatchTeamId,
          matchId: this.matchId!,
          matchMapId: this.matchMapId!,
          roundNumber: roundNum,
          endReason: this.mapEndReason(roundEnd.reason),
        },
      });

      this.roundsMap.set(roundNum, {
        id: round.id,
        tick: round.tick,
        round_time: roundEnd.round_start_time,
      });
      console.log(`🔵 Создан раунд ${round.roundNumber}`);
    }

    console.log(`🔄 Обработано раундов: ${roundEnds.length}`);
  }

  private async processKills(tx: PrismaTransactionalClient): Promise<void> {
    console.log(this.roundsMap);
    const kills = parseEvent(
      this.demoPath,
      "player_death",
      ["X", "Y", "Z"],
      ["total_rounds_played", "round_start_time", "game_phase"]
    ) as KillEvent[];

    const zeroRounds = kills.filter((item) => item.total_rounds_played === 0);
    const nonZeroRounds = kills.filter((item) => item.total_rounds_played > 0);

    const maxRoundTime = Math.max(
      ...zeroRounds.map((item) => item.round_start_time)
    );
    const maxTimeZeroRounds = zeroRounds.filter(
      (item) => item.round_start_time === maxRoundTime
    );

    const data = [...maxTimeZeroRounds, ...nonZeroRounds];
    //console.log(knifesRound);
    let killCount = 0;
    let rounds = 0;
    for (const kill of data) {
      if (kill.game_phase === 5) {
        break;
      }

      const killerId = this.playersMap.get(kill.attacker_steamid);
      const victimId = this.playersMap.get(kill.user_steamid);
      const assisterId = kill.assister_steamid
        ? this.playersMap.get(kill.assister_steamid)
        : undefined;
      rounds = kill.total_rounds_played;
      let roundId = this.roundsMap.get(rounds)?.id;
      if (!victimId || !kill.weapon) continue;

      const weaponId = await this.getWeaponId(tx, kill.weapon);

      if (!roundId) {
        console.log(`⚠️ Раунд ${rounds} не найден, пропускаем убийство`);
        continue;
      }

      const isTeamkill = await this.isTeamKill(
        tx,
        kill.attacker_steamid,
        kill.user_steamid
      );

      try {
        await tx.matchKill.create({
          data: {
            createdAt: new Date(),
            killerId: killerId,
            victimId: victimId,
            assistantId: assisterId,
            weaponId: weaponId,
            isHeadshot: kill.headshot || false,
            isWallbang: kill.penetrated ? kill.penetrated > 0 : false,
            isAirshot: kill.attackerinair || false,
            isNoscope: kill.noscope || false,
            isTeamkill: isTeamkill,
            isScoreboardKill:
              kill.hitgroup === "head" && kill.headshot === false
                ? false
                : true,
            matchId: this.matchId!,
            roundId: roundId,
            tick: kill.tick,
            roundTime: kill.round_time || 0,
            killerPositionX: kill.attacker_x || 0,
            killerPositionY: kill.attacker_y || 0,
            victimPositionX: kill.victim_x || 0,
            victimPositionY: kill.victim_y || 0,
            distance: kill.distance || 0,
            isThroughSmoke: kill.thrusmoke || false,
          },
        });

        killCount++;
      } catch (error) {
        console.log(`⚠️ Ошибка при создании убийства: ${error}`);
      }
    }

    console.log(`🔫 Обработано убийств: ${killCount}`);
  }

  private async processDamages(tx: any) {
    // 1. Получаем события урона и игроков
    const damages = parseEvent(
      this.demoPath,
      "player_hurt",
      [],
      ["total_rounds_played", "round_start_time", "game_phase"]
    ) as DamageEvent[];

    const zeroRounds = damages.filter((item) => item.total_rounds_played === 0);
    const nonZeroRounds = damages.filter(
      (item) => item.total_rounds_played > 0
    );

    const maxRoundTime = Math.max(
      ...zeroRounds.map((item) => item.round_start_time)
    );
    const maxTimeZeroRounds = zeroRounds.filter(
      (item) => item.round_start_time === maxRoundTime
    );

    const data = [...maxTimeZeroRounds, ...nonZeroRounds];

    const playerInfo = parsePlayerInfo(this.demoPath);
    const playerHealth: Map<string, PlayerState> = new Map();
    // 2. Имитация состояния здоровья (ваша логика)
    playerInfo.forEach((p: { steamid: string }) => {
      playerHealth.set(p.steamid, { health: 100, currentRound: 0 });
    });

    // 3. Агрегация с расчетом нормализованного урона
    const aggregatedMap = new Map<
      string,
      {
        damageReal: number;
        damageNormalized: number;
        hitboxGroup: string;
        hits: number;
        inflictorId: number;
        victimId: number;
        weaponId: number;
        roundId: string;
      }
    >();

    for (const d of data) {
      if (d.game_phase === 5) {
        break;
      }
      // Обновляем текущее здоровье жертвы (ваша логика)
      const virtualRound = d.total_rounds_played;

      // Получаем состояние игрока
      const victimState = playerHealth.get(d.user_steamid) || {
        health: 100,
        currentRound: virtualRound,
      };

      // 🔥 Если раунд изменился — сбрасываем здоровье
      if (victimState.currentRound !== virtualRound) {
        victimState.health = 100;
        victimState.currentRound = virtualRound;
      }

      // Нормализация урона
      const currentVictimHealth = victimState.health;
      const normalizedDamage = Math.min(d.dmg_health, currentVictimHealth);

      // Обновляем состояние
      victimState.health = d.health;
      playerHealth.set(d.user_steamid, victimState);

      const killerId = this.playersMap.get(d.attacker_steamid)!;
      const victimId = this.playersMap.get(d.user_steamid)!;
      const weaponId = await this.getWeaponId(tx, d.weapon);
      if (!killerId || !weaponId) continue;

      let roundId = this.roundsMap.get(virtualRound)?.id;

      if (!roundId) {
        console.log(`⚠️ Раунд ${virtualRound} не найден, пропускаем урон`);
        continue;
      }
      const key = `${d.attacker_steamid}-${d.user_steamid}-${d.weapon}-${d.hitgroup}-${roundId}`;
      if (!aggregatedMap.has(key)) {
        aggregatedMap.set(key, {
          damageReal: 0,
          damageNormalized: 0,
          hitboxGroup: d.hitgroup,
          hits: 0,
          inflictorId: killerId,
          victimId: victimId,
          weaponId: weaponId,
          roundId: roundId,
        });
      }

      const entry = aggregatedMap.get(key)!;
      entry.hits += 1;
      entry.damageReal += d.dmg_health;
      entry.damageNormalized += normalizedDamage; // Используем рассчитанный урон
    }

    // 4. Сохранение в Prisma

    await tx.matchDamage.createMany({
      data: Array.from(aggregatedMap.values()).map((d) => ({
        ...d,
        matchId: this.matchId!,
      })),
      skipDuplicates: true,
    });
  }

  private async processGrenades(tx: any): Promise<void> {
    try {
      // Определяем типы гранат и их события
      const grenadeEvents = [
        { event: "flashbang_detonate", type: "flashbang" },
        { event: "hegrenade_detonate", type: "hegrenade" },
        { event: "smokegrenade_detonate", type: "smokegrenade" },
        { event: "inferno_startburn", type: "molotov" }, // Заменяем molotov_detonate на inferno_startburn
        { event: "decoy_detonate", type: "decoy" },
      ];

      const allGrenades = [];
      const processedEntities = new Set<number>(); // Для устранения дубликатов по entityid

      // Собираем все гранаты из разных событий
      for (const grenadeEvent of grenadeEvents) {
        const grenades = parseEvent(
          this.demoPath,
          grenadeEvent.event,
          ["user_steamid", "x", "y", "z", "tick", "entityid"],
          ["total_rounds_played"]
        ) as any[];

        console.log(
          `💣 Найдено ${grenades.length} гранат типа ${grenadeEvent.type}`
        );

        for (const grenade of grenades) {
          if (!grenade.user_steamid) continue;

          // Пропускаем дубликаты по entityid
          if (grenade.entityid && processedEntities.has(grenade.entityid)) {
            continue;
          }

          const userId = this.playersMap.get(grenade.user_steamid);
          if (!userId) continue;

          const rounds =
            grenade.total_rounds_played +
            (grenade.round_start_time !== this.roundsMap.get(0)?.round_time
              ? 1
              : 0);
          let roundId = this.roundsMap.get(rounds)?.id;
          if (!roundId) {
            console.log(
              `⚠️ Не найден раунд для гранаты на тике ${grenade.tick}, пропускаем`
            );
            continue;
          }

          allGrenades.push({
            userId: userId,
            matchId: this.matchId!,
            roundId: roundId,
            grenadeType: this.mapGrenadeType(grenadeEvent.type),
            detonatePositionX: grenade.x || 0,
            detonatePositionY: grenade.y || 0,
            detonatePositionZ: grenade.z || 0,
            entityId: grenade.entityid || null,
            tick: grenade.tick,
            roundTime: 0,
          });

          if (grenade.entityid) {
            processedEntities.add(grenade.entityid);
          }
        }
      }

      // Сохраняем все гранаты одним запросом
      if (allGrenades.length > 0) {
        await tx.matchGrenade.createMany({
          data: allGrenades,
        });
        console.log(`💣 Сохранено гранат: ${allGrenades.length}`);
      } else {
        console.log(`💣 Гранаты не найдены`);
      }
    } catch (error) {
      console.error(`❌ Ошибка при обработке гранат: ${error}`);
      throw error;
    }
  }

  // Обновленный метод для маппинга типов гранат
  private mapGrenadeType(type: string): number {
    const grenadeMap: { [key: string]: number } = {
      smokegrenade: 0,
      flashbang: 1,
      hegrenade: 2,
      molotov: 3,
      decoy: 4,
      smokegrenade_detonate: 0,
      flashbang_detonate: 1,
      hegrenade_detonate: 2,
      molotov_detonate: 3,
      decoy_detonate: 4,
    };
    return grenadeMap[type] || 0;
  }

  // Вспомогательные методы с передачей транзакции
  private async generateUserId(tx: any): Promise<number> {
    const lastUser = await tx.user.findFirst({
      orderBy: { id: "desc" },
    });
    return (lastUser?.id || 0) + 1;
  }

  private async generateMapId(tx: any): Promise<number> {
    const lastMap = await tx.map.findFirst({
      orderBy: { id: "desc" },
    });
    return (lastMap?.id || 0) + 1;
  }

  private async getWeaponId(tx: any, weaponName: string): Promise<number> {
    let weapon = await tx.weapon.findFirst({
      where: {
        OR: [{ name: weaponName }, { internalName: weaponName }],
      },
    });

    if (!weapon) {
      const newWeaponId = await this.generateWeaponId(tx);
      weapon = await tx.weapon.create({
        data: {
          id: newWeaponId,
          name: weaponName,
          internalName: weaponName,
          type: this.mapWeaponType(weaponName),
        },
      });
    }

    return weapon.id;
  }

  private async generateWeaponId(tx: any): Promise<number> {
    const lastWeapon = await tx.weapon.findFirst({
      orderBy: { id: "desc" },
    });
    return (lastWeapon?.id || 0) + 1;
  }

  private async isTeamKill(
    tx: any,
    attackerSteamId?: string,
    victimSteamId?: string
  ): Promise<boolean> {
    if (!attackerSteamId || !victimSteamId) return false;

    try {
      const attackerMember = await tx.matchMember.findFirst({
        where: {
          userId: this.playersMap.get(attackerSteamId),
          matchId: this.matchId!,
        },
      });

      const victimMember = await tx.matchMember.findFirst({
        where: {
          userId: this.playersMap.get(victimSteamId),
          matchId: this.matchId!,
        },
      });

      return attackerMember?.matchTeamId === victimMember?.matchTeamId;
    } catch (error) {
      return false;
    }
  }

  private mapEndReason(reason?: string): number {
    const reasonMap: { [key: string]: number } = {
      bomb_exploded: 1,
      bomb_defused: 2,
      t_killed: 3,
      ct_killed: 4,
    };
    return reasonMap[reason || ""] || 0;
  }

  private mapWeaponType(weaponName?: string): string {
    if (!weaponName) return "Other";
    if (weaponName.includes("knife")) return "Melee";
    if (weaponName.includes("pistol")) return "Pistol";
    if (weaponName.includes("rifle")) return "Rifle";
    if (weaponName.includes("smg")) return "SMG";
    if (weaponName.includes("shotgun")) return "Shotgun";
    if (weaponName.includes("sniper")) return "Sniper";
    return "Other";
  }
}

// Использование
async function main(): Promise<void> {
  const parser = new DemoToDatabase("./demos/match_2595054.dem");
  await parser.processDemo();
}

main().catch(console.error);
