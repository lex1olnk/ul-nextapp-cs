// demo-server/parser-functions.js
const demoparser = require("@laihoe/demoparser2");

// Основная функция парсинга всех данных
function parseAllData(demoPath) {
  console.log(`🔄 Starting full demo parsing: ${demoPath}`);

  try {
    const matchInfo = parseMatchInfo(demoPath);
    const players = parsePlayersInfo(demoPath);
    const rounds = parseRoundsInfo(demoPath);
    const kills = parseKillsInfo(demoPath);
    const damages = parseDamagesInfo(demoPath, players);
    const grenades = parseGrenadesInfo(demoPath);
    const teams = parseTeamsInfo(players);

    console.log(`✅ Demo parsing completed successfully`);

    return {
      matchInfo,
      players,
      rounds,
      kills,
      damages,
      grenades,
      teams,
    };
  } catch (error) {
    console.error(`❌ Demo parsing failed: ${error.message}`);
    throw error;
  }
}

// 1. Информация о матче
function parseMatchInfo(demoPath) {
  console.log("📊 Parsing match info...");

  const matchStart = demoparser.parseEvent(demoPath, "match_start", [
    "map_name",
  ]);
  const firstMatch = matchStart[0] || {};

  return {
    mapName: firstMatch.map_name || "de_dust2",
    demoPath: demoPath,
    type: "competitive",
    status: "finished",
  };
}

// 2. Информация об игроках
function parsePlayersInfo(demoPath) {
  console.log("👥 Parsing players...");

  const playerInfo = demoparser.parsePlayerInfo(demoPath);
  return playerInfo
    .map((player) => ({
      steamId: player.steamid,
      name: player.name,
      teamNumber: player.team_number,
    }))
    .filter((player) => player.steamId); // фильтруем игроков без steamId
}

// 3. Раунды
function parseRoundsInfo(demoPath) {
  console.log("🔄 Parsing rounds...");

  const roundEnds = demoparser.parseEvent(
    demoPath,
    "round_end",
    ["winner", "reason", "round_num", "mvps"],
    ["round_start_time", "game_phase", "tick"]
  );

  return roundEnds
    .filter((round) => round.game_phase !== 5) // Исключаем warmup
    .map((round) => ({
      roundNumber: (round.round || 0) - 1,
      winner: round.winner,
      reason: round.reason,
      tick: round.tick,
      roundStartTime: round.round_start_time,
    }));
}

// 4. Убийства
function parseKillsInfo(demoPath) {
  console.log("🔫 Parsing kills...");

  const kills = demoparser.parseEvent(
    demoPath,
    "player_death",
    ["X", "Y", "Z"],
    ["total_rounds_played", "round_start_time", "game_phase"]
  );
  const zeroRounds = kills.filter((item) => item.total_rounds_played === 0);
  const nonZeroRounds = kills.filter((item) => item.total_rounds_played > 0);

  const maxRoundTime = Math.max(
    ...zeroRounds.map((item) => item.round_start_time)
  );
  const maxTimeZeroRounds = zeroRounds.filter(
    (item) => item.round_start_time === maxRoundTime
  );

  const data = [...maxTimeZeroRounds, ...nonZeroRounds];

  return data
    .filter((kill) => kill.game_phase !== 5)
    .map((kill) => ({
      attackerSteamId: kill.attacker_steamid,
      victimSteamId: kill.user_steamid,
      assisterSteamId: kill.assister_steamid,
      weapon: kill.weapon,
      headshot: kill.headshot || false,
      wallbang: kill.penetrated ? kill.penetrated > 0 : false,
      airshot: kill.attackerinair || false,
      noscope: kill.noscope || false,
      round: kill.total_rounds_played,
      tick: kill.tick,
      roundTime: kill.round_time || 0,
      attackerX: kill.attacker_x || 0,
      attackerY: kill.attacker_y || 0,
      victimX: kill.victim_x || 0,
      victimY: kill.victim_y || 0,
      distance: kill.distance || 0,
      throughSmoke: kill.thrusmoke || false,
      hitgroup: kill.hitgroup,
    }));
}

// 5. Урон
function parseDamagesInfo(demoPath) {
  console.log("💥 Parsing damages...");

  const damages = demoparser.parseEvent(
    demoPath,
    "player_hurt",
    [],
    ["total_rounds_played", "round_start_time", "game_phase"]
  );
  // Остальной код без изменений...
  const zeroRounds = damages.filter((item) => item.total_rounds_played === 0);
  const nonZeroRounds = damages.filter((item) => item.total_rounds_played > 0);

  const maxRoundTime = Math.max(
    ...zeroRounds.map((item) => item.round_start_time)
  );
  const maxTimeZeroRounds = zeroRounds.filter(
    (item) => item.round_start_time === maxRoundTime
  );

  const data = [...maxTimeZeroRounds, ...nonZeroRounds];

  const playerInfo = demoparser.parsePlayerInfo(demoPath); // Используем this.parsePlayerInfo
  const playerHealth = new Map();

  playerInfo.forEach((p) => {
    if (p.steamid) {
      playerHealth.set(p.steamid, { health: 100, currentRound: 0 });
    }
  });

  const aggregatedMap = new Map();
  for (const d of data) {
    if (d.game_phase === 5) break;

    const virtualRound = d.total_rounds_played;
    const victimState = playerHealth.get(d.user_steamid) || {
      health: 100,
      currentRound: virtualRound,
    };

    if (victimState.currentRound !== virtualRound) {
      victimState.health = 100;
      victimState.currentRound = virtualRound;
    }

    const currentVictimHealth = victimState.health;
    const normalizedDamage = Math.min(d.dmg_health, currentVictimHealth);
    victimState.health = d.health;
    playerHealth.set(d.user_steamid, victimState);

    const key = `${d.attacker_steamid}-${d.user_steamid}-${d.weapon}-${d.hitgroup}-${d.total_rounds_played}`;
    if (aggregatedMap.get(key) == null) {
      aggregatedMap.set(key, {
        damageReal: 0,
        damageNormalized: 0,
        hitboxGroup: d.hitgroup,
        hits: 0,
        inflictorId: d.attacker_steamid,
        victimId: d.user_steamid,
        weapon: d.weapon,
        round: d.total_rounds_played,
      });
    }

    const entry = aggregatedMap.get(key);
    entry.hits += 1;
    entry.damageReal += d.dmg_health;
    entry.damageNormalized += normalizedDamage;
  }

  return Array.from(aggregatedMap.values()).map((damage) => ({
    ...damage,
  }));
}

// 6. Гранаты
function parseGrenadesInfo(demoPath) {
  console.log("💣 Parsing grenades...");

  const grenadeEvents = [
    { event: "flashbang_detonate", type: "flashbang" },
    { event: "hegrenade_detonate", type: "hegrenade" },
    { event: "smokegrenade_detonate", type: "smokegrenade" },
    { event: "inferno_startburn", type: "molotov" },
    { event: "decoy_detonate", type: "decoy" },
  ];

  const allGrenades = [];
  const processedEntities = new Set();

  grenadeEvents.forEach((grenadeEvent) => {
    const grenades = demoparser.parseEvent(
      demoPath,
      grenadeEvent.event,
      ["user_steamid", "x", "y", "z", "tick", "entityid"],
      ["total_rounds_played"]
    );

    grenades.forEach((grenade) => {
      if (grenade.entityid && processedEntities.has(grenade.entityid)) {
        return;
      }

      allGrenades.push({
        userSteamId: grenade.user_steamid,
        type: grenadeEvent.type,
        x: grenade.x || 0,
        y: grenade.y || 0,
        z: grenade.z || 0,
        tick: grenade.tick,
        round: grenade.total_rounds_played,
        entityId: grenade.entityid || null,
      });

      if (grenade.entityid) {
        processedEntities.add(grenade.entityid);
      }
    });
  });

  return allGrenades;
}

// 7. Команды (на основе игроков)
function parseTeamsInfo(players) {
  console.log("🏆 Parsing teams...");

  const teams = {};

  players.forEach((player) => {
    if (player.teamNumber) {
      if (!teams[player.teamNumber]) {
        teams[player.teamNumber] = {
          teamNumber: player.teamNumber,
          name: `Team ${player.teamNumber === 2 ? "A" : "B"}`,
          players: [],
        };
      }
      teams[player.teamNumber].players.push(player.steamId);
    }
  });

  return Object.values(teams);
}

// Функции для маппинга (как в твоем классе)
function mapGrenadeType(type) {
  const grenadeMap = {
    smokegrenade: 0,
    flashbang: 1,
    hegrenade: 2,
    molotov: 3,
    decoy: 4,
  };
  return grenadeMap[type] || 0;
}

function mapEndReason(reason) {
  const reasonMap = {
    bomb_exploded: 1,
    bomb_defused: 2,
    t_killed: 3,
    ct_killed: 4,
  };
  return reasonMap[reason || ""] || 0;
}

function mapWeaponType(weaponName) {
  if (!weaponName) return "Other";
  if (weaponName.includes("knife")) return "Melee";
  if (weaponName.includes("pistol")) return "Pistol";
  if (weaponName.includes("rifle")) return "Rifle";
  if (weaponName.includes("smg")) return "SMG";
  if (weaponName.includes("shotgun")) return "Shotgun";
  if (weaponName.includes("sniper")) return "Sniper";
  return "Other";
}

module.exports = {
  parseAllData,
  parseMatchInfo,
  parsePlayersInfo,
  parseRoundsInfo,
  parseKillsInfo,
  parseDamagesInfo,
  parseGrenadesInfo,
  parseTeamsInfo,
  mapGrenadeType,
  mapEndReason,
  mapWeaponType,
};
