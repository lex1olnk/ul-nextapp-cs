// CS2 Parser Stats — mock data (fake, CS2-authentic)
const TOURNAMENTS = [
  { id: "major", name: "Major", full: "PGL_Major_2026", status: "ONGOING", maps: "BO3", node: "0x1A3F2B" },
  { id: "blast", name: "Blast", full: "BLAST_Premier", status: "STANDBY", maps: "BO3", node: "0x77C0E1" },
  { id: "iem", name: "IEM", full: "IEM_Katowice", status: "ENDED", maps: "BO5", node: "0x0042AF" },
];

const PLAYERS = [
  { id: "zywoo", name: "ZywOo", team: "VITALITY", rating: 1.34, adr: 92.1, kast: 76, hs: 51, entry: 0.71, clutchW: 16, clutchL: 9, top: "0.1%" },
  { id: "donk",  name: "donk",  team: "SPIRIT",   rating: 1.31, adr: 95.7, kast: 74, hs: 58, entry: 0.69, clutchW: 14, clutchL: 8, top: "0.2%" },
  { id: "m0nesy",name: "m0NESY",team: "G2",       rating: 1.22, adr: 84.0, kast: 73, hs: 49, entry: 0.62, clutchW: 11, clutchL: 10, top: "1%" },
  { id: "ropz",  name: "ropz",  team: "FAZE",     rating: 1.18, adr: 80.4, kast: 75, hs: 44, entry: 0.55, clutchW: 12, clutchL: 11, top: "2%" },
  { id: "sh1ro", name: "sh1ro", team: "SPIRIT",   rating: 1.16, adr: 76.2, kast: 77, hs: 41, entry: 0.40, clutchW: 18, clutchL: 7, top: "2%" },
  { id: "jl",    name: "jL",    team: "VITALITY", rating: 1.12, adr: 78.9, kast: 72, hs: 47, entry: 0.58, clutchW: 9,  clutchL: 9, top: "5%" },
  { id: "frozen",name: "broky", team: "FAZE",     rating: 1.09, adr: 74.1, kast: 71, hs: 46, entry: 0.44, clutchW: 10, clutchL: 12, top: "5%" },
  { id: "magisk",name: "Magisk",team: "FALCONS",  rating: 1.05, adr: 71.6, kast: 70, hs: 42, entry: 0.39, clutchW: 8,  clutchL: 11, top: "8%" },
];

const MATCHES = [
  { id: "m01", a: "VITALITY", b: "SPIRIT",  sa: 2, sb: 1, map: "INFERNO",  status: "ONGOING", time: "LIVE" },
  { id: "m02", a: "G2",       b: "FAZE",    sa: 0, sb: 0, map: "MIRAGE",   status: "STANDBY", time: "20:00" },
  { id: "m03", a: "FALCONS",  b: "NAVI",    sa: 16, sb: 12, map: "NUKE",   status: "ENDED",   time: "FT" },
  { id: "m04", a: "MOUZ",     b: "LIQUID",  sa: 13, sb: 16, map: "ANCIENT", status: "ENDED",  time: "FT" },
  { id: "m05", a: "ASTRALIS", b: "HEROIC",  sa: 16, sb: 9,  map: "ANUBIS",  status: "ENDED",  time: "FT" },
];

const TEAMS = [
  { id: "vit", name: "VITALITY", region: "EU", rating: 1.18, win: 0.74, seed: 1 },
  { id: "spi", name: "SPIRIT",   region: "CIS", rating: 1.21, win: 0.78, seed: 2 },
  { id: "g2",  name: "G2",       region: "EU", rating: 1.09, win: 0.66, seed: 3 },
  { id: "faze",name: "FAZE",     region: "INT", rating: 1.07, win: 0.62, seed: 4 },
  { id: "fal", name: "FALCONS",  region: "INT", rating: 1.04, win: 0.59, seed: 5 },
  { id: "navi",name: "NAVI",     region: "CIS", rating: 1.02, win: 0.57, seed: 6 },
  { id: "mouz",name: "MOUZ",     region: "EU", rating: 1.01, win: 0.55, seed: 7 },
  { id: "liq", name: "LIQUID",   region: "NA", rating: 0.98, win: 0.51, seed: 8 },
];
window.CS2DATA = { TOURNAMENTS, PLAYERS, MATCHES, TEAMS };
