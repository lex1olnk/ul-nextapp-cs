const {
  parseEvent,
  parseTicks,
  parseGrenades,
  listGameEvents,
  parsePlayerInfo,
} = require("@laihoe/demoparser2");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const demoPath =
  "./demos/19163994_17894657_2508301705-de_dust2.dem" ||
  "./demos/match_2595054.dem";

const damages = parseEvent(
  demoPath,
  "player_hurt",
  [],
  ["total_rounds_played", "round_start_time"]
);

console.log("🔍 Анализ клатчевых ситуаций...");

const playerInfo = parsePlayerInfo(demoPath);

const kills = parseEvent(
  demoPath,
  "player_death",
  ["team_num", "team_name"],
  ["total_rounds_played", "round_start_time"]
);

const roundEnds = parseEvent(
  demoPath,
  "round_end",
  ["winner", "reason", "mvps"],
  ["total_rounds_played", "round_start_time", "game_phase"]
);

const filterData = (data) => {
  const zeroRounds = data.filter((item) => item.total_rounds_played === 0);
  const nonZeroRounds = data.filter((item) => item.total_rounds_played > 0);

  const maxRoundTime = Math.max(
    ...zeroRounds.map((item) => item.round_start_time)
  );

  const maxTimeZeroRounds = zeroRounds.filter(
    (item) => item.round_start_time === maxRoundTime
  );
  return [...maxTimeZeroRounds, ...nonZeroRounds];
};

const finalResult = filterData(kills);
const grKills = Object.groupBy(
  finalResult,
  (finalResult) => finalResult.total_rounds_played
);
//filteredKills.filter((k) => k.total_rounds == 0);
//console.log(finalResult.filter((k) => k.total_rounds_played > 22));

const filteredRound = roundEnds;
roundEnds.map(
  (r) =>
    (r.kills = finalResult.filter(
      (kill) => kill.total_rounds_played + 1 == r.round
    ))
);
playerInfo.map((p) => ((p.isAlive = true), (p.team_name = "")));

//console.log(filteredRound.filter((r) => r.round == 1));
let clutches = [];

for (let i = 0; i < grKills[0].length; i++) {
  const k = grKills[0][i];
}
console.log(clutches);
