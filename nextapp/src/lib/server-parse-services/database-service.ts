// services/database-service.ts
import { PrismaClient } from "@prisma/client";

type PrismaTransactionalClient = Parameters<
  Parameters<PrismaClient["$transaction"]>[0]
>[0];

const prisma = new PrismaClient();

export class DatabaseService {
  async saveParsedData(
    sessionId: string,
    matchUrl: string,
    tournamentId: string | null,
    parsedData: any
  ) {
    return await prisma.$transaction(async (tx) => {
      console.log("💾 Saving parsed data to database...");

      // 1. Создаем матч
      const match = await this.createMatch(
        tx,
        sessionId,
        matchUrl,
        tournamentId,
        parsedData.matchInfo
      );

      // 2. Создаем команды
      const teamsMap = await this.createTeams(tx, match.id, parsedData.teams);

      // 3. Сохраняем игроков
      const playersMap = await this.processPlayers(
        tx,
        match.id,
        parsedData.players,
        teamsMap
      );

      // 4. Создаем карту матча
      const matchMap = await this.createMatchMap(
        tx,
        match.id,
        parsedData.matchInfo
      );

      // 5. Сохраняем раунды
      const roundsMap = await this.processRounds(
        tx,
        match.id,
        matchMap.id,
        parsedData.rounds,
        teamsMap
      );

      // 6. Сохраняем убийства
      await this.processKills(
        tx,
        match.id,
        parsedData.kills,
        playersMap,
        roundsMap
      );

      // 7. Сохраняем урон
      await this.processDamages(
        tx,
        match.id,
        parsedData.damages,
        playersMap,
        roundsMap
      );

      // 8. Сохраняем гранаты
      await this.processGrenades(
        tx,
        match.id,
        parsedData.grenades,
        playersMap,
        roundsMap
      );

      await this.processClutches(
        tx,
        match.id,
        parsedData.clutches,
        playersMap,
        roundsMap
      );

      console.log("✅ All data saved to database successfully");
      return match.id;
    });
  }

  private async createMatch(
    tx: PrismaTransactionalClient,
    sessionId: string,
    matchUrl: string,
    tournamentId: string | null,
    matchInfo: any
  ) {
    return await tx.match.create({
      data: {
        type: "competitive",
        status: "finished",
        demoPath: matchUrl, // или можно сохранить оригинальный demoPath
        bestOf: 1,
        hasWinner: true,
        startedAt: new Date(),
        finishedAt: new Date(),
        tournamentId,
        maxRoundsCount: 30,
        serverInstanceId: "demo_parser",
        isFinal: false,
        createdAt: new Date(),
      },
    });
  }

  private async createTeams(
    tx: PrismaTransactionalClient,
    matchId: string,
    teams: any[]
  ) {
    const teamsMap = new Map();

    for (const teamData of teams) {
      const team = await tx.matchTeam.create({
        data: {
          name: teamData.name,
          size: teamData.players?.length || 0,
          score: 0,
          teamNum: teamData.teamNumber,
          isWinner: false,
          captainId: 1, // или определить капитана
          matchId: matchId,
        },
      });
      teamsMap.set(teamData.teamNumber, team.id);
    }

    return teamsMap;
  }

  private async processPlayers(
    tx: PrismaTransactionalClient,
    matchId: string,
    players: any[],
    teamsMap: Map<any, any>
  ) {
    const playersMap = new Map();

    for (const player of players) {
      // Создаем/обновляем пользователя
      const user = await tx.user.upsert({
        where: { steamId: player.steamId },
        update: { nickName: player.name },
        create: {
          nickName: player.name,
          steamId: player.steamId,
        },
      });

      playersMap.set(player.steamId, user.id);

      // Создаем запись участника матча
      const teamId = teamsMap.get(player.teamNumber);
      await tx.matchMember.create({
        data: {
          hash: `${matchId}_${user.id}`,
          role: "player",
          ready: true,
          connected: true,
          isLeaver: false,
          matchId: matchId,
          userId: user.id,
          matchTeamId: teamId,
        },
      });
    }

    return playersMap;
  }

  private async createMatchMap(
    tx: PrismaTransactionalClient,
    matchId: string,
    matchInfo: any
  ) {
    let map = await tx.map.findFirst({
      where: { name: matchInfo.mapName },
    });

    if (!map) {
      map = await tx.map.create({
        data: {
          name: matchInfo.mapName,
          preview: `${matchInfo.mapName}_preview.jpg`,
          topview: `${matchInfo.mapName}_topview.jpg`,
        },
      });
    }

    return await tx.matchMap.create({
      data: {
        number: 1,
        mapId: map.id,
        startedAt: new Date(),
        finishedAt: new Date(),
        gameStatus: "finished",
        matchId: matchId,
      },
    });
  }

  private async processRounds(
    tx: PrismaTransactionalClient,
    matchId: string,
    matchMapId: string,
    rounds: any[],
    teamsMap: Map<any, any>
  ) {
    const roundsMap = new Map();

    for (const round of rounds) {
      const winMatchTeamId = teamsMap.get(round.winner === "T" ? 2 : 3);

      const roundRecord = await tx.round.create({
        data: {
          winReason: round.reason || "unknown",
          startedAt: new Date(Date.now() - round.roundNumber * 120000),
          finishedAt: new Date(),
          tick: round.tick || 0,
          winMatchTeamId: winMatchTeamId,
          matchId: matchId,
          matchMapId: matchMapId,
          roundNumber: round.roundNumber - 1,
          endReason: this.mapEndReason(round.reason),
        },
      });

      roundsMap.set(roundRecord.roundNumber, roundRecord.id);
    }

    return roundsMap;
  }

  private async processKills(
    tx: PrismaTransactionalClient,
    matchId: string,
    kills: any[],
    playersMap: Map<any, any>,
    roundsMap: Map<any, any>
  ) {
    for (const kill of kills) {
      const killerId = playersMap.get(kill.attackerSteamId);
      const victimId = playersMap.get(kill.victimSteamId);
      const assisterId = kill.assisterSteamId
        ? playersMap.get(kill.assisterSteamId)
        : undefined;
      const roundId = roundsMap.get(kill.round);

      if (!victimId || !roundId) continue;

      const weaponId = await this.getOrCreateWeapon(tx, kill.weapon);

      const isTeamkill = await this.isTeamKill(tx, killerId, victimId, matchId);

      await tx.matchKill.create({
        data: {
          createdAt: new Date(),
          killerId: killerId,
          victimId: victimId,
          assistantId: assisterId,
          weaponId: weaponId,
          isHeadshot: kill.headshot || false,
          isWallbang: kill.wallbang || false,
          isAirshot: kill.airshot || false,
          isNoscope: kill.noscope || false,
          isTeamkill: isTeamkill,
          matchId: matchId,
          roundId: roundId,
          tick: kill.tick || 0,
          roundTime: kill.roundTime || 0,
          killerPositionX: kill.attackerX || 0,
          killerPositionY: kill.attackerY || 0,
          victimPositionX: kill.victimX || 0,
          victimPositionY: kill.victimY || 0,
          distance: kill.distance || 0,
          isThroughSmoke: kill.throughSmoke || false,
        },
      });
    }
  }

  private async processDamages(
    tx: PrismaTransactionalClient,
    matchId: string,
    damages: any[],
    playersMap: Map<any, any>,
    roundsMap: Map<any, any>
  ) {
    for (const damage of damages) {
      const inflictorId = playersMap.get(damage.inflictorId);
      const victimId = playersMap.get(damage.victimId);
      const roundId = roundsMap.get(damage.round);

      if (!inflictorId || !victimId || !roundId) continue;

      const weaponId = await this.getOrCreateWeapon(tx, damage.weapon);
      await tx.matchDamage.create({
        data: {
          inflictorId,
          victimId,
          weaponId,
          hitboxGroup: damage.hitboxGroup,
          hits: damage.hits,
          damageNormalized: damage.damageNormalized,
          damageReal: damage.damageReal,
          roundId,
          matchId: matchId,
        },
      });
    }
  }

  private async processGrenades(
    tx: PrismaTransactionalClient,
    matchId: string,
    grenades: any[],
    playersMap: Map<any, any>,
    roundsMap: Map<any, any>
  ) {
    for (const grenade of grenades) {
      const userId = playersMap.get(grenade.userSteamId);
      const roundId = roundsMap.get(grenade.round);

      if (!userId || !roundId) continue;

      await tx.matchGrenade.create({
        data: {
          userId: userId,
          matchId: matchId,
          roundId: roundId,
          grenadeType: this.mapGrenadeType(grenade.type),
          detonatePositionX: grenade.x || 0,
          detonatePositionY: grenade.y || 0,
          detonatePositionZ: grenade.z || 0,
          entityId: grenade.entityId,
          tick: grenade.tick || 0,
          roundTime: 0,
        },
      });
    }
  }

  private async processClutches(
    tx: PrismaTransactionalClient,
    matchId: string,
    clutches: any[],
    playersMap: Map<any, any>,
    roundsMap: Map<any, any>
  ) {
    for (const clutch of clutches) {
      const userId = playersMap.get(clutch.steamId);
      const roundId = roundsMap.get(clutch.round - 1);

      if (!userId || !roundId) continue;

      await tx.matchClutch.create({
        data: {
          userId: userId,
          matchId: matchId,
          roundId: roundId,
          success: clutch.success,
          amount: clutch.amount,
          createdAt: new Date(),
        },
      });
    }
  }

  private async getOrCreateWeapon(
    tx: PrismaTransactionalClient,
    weaponName: string
  ): Promise<number> {
    try {
      const weapon = await tx.weapon.upsert({
        where: {
          name: weaponName, // Если name уникален
          // или используйте internalName если он уникален
        },
        update: {}, // Ничего не обновляем если существует
        create: {
          name: weaponName,
          internalName: weaponName,
        },
      });

      return weapon.id;
    } catch (error) {
      throw new Error(`weapon doesn't created, ${error}`);
    }
  }

  private async isTeamKill(
    tx: PrismaTransactionalClient,
    attackerId: number,
    victimId: number,
    matchId: string
  ): Promise<boolean> {
    try {
      const attacker = await tx.matchMember.findFirst({
        where: { userId: attackerId, matchId },
      });
      const victim = await tx.matchMember.findFirst({
        where: { userId: victimId, matchId },
      });
      return attacker?.matchTeamId === victim?.matchTeamId;
    } catch {
      return false;
    }
  }

  private mapGrenadeType(type: string): number {
    const grenadeMap: { [key: string]: number } = {
      smokegrenade: 0,
      flashbang: 1,
      hegrenade: 2,
      molotov: 3,
      decoy: 4,
    };
    return grenadeMap[type] || 0;
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

export const databaseService = new DatabaseService();
