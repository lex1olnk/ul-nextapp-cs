"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { getRatingColor } from "@/lib/utils";
import { DataTableControls } from "./DataTableControls";
import "./style.css";

import Pick1 from "@/img/pick1.svg";
import Pick2 from "@/img/pick2.svg";
import Pick3 from "@/img/pick3.svg";
import Pick4 from "@/img/pick4.svg";
import Pick5 from "@/img/pick5.svg";

const picks = [Pick1, Pick2, Pick3, Pick4, Pick5];

const TIERS = [
  { rank: "?",   color: "#71717a" },
  { rank: "SSS", color: "#881616" },
  { rank: "SS",  color: "#C73A3A" },
  { rank: "S",   color: "#E5992D" },
  { rank: "A",   color: "#E3E35D" },
  { rank: "B",   color: "#6AE87D" },
  { rank: "C",   color: "#4BEDC7" },
];

const ratingTier = (r: number) => {
  if (r === 0)   return TIERS[0];
  if (r >= 90)   return TIERS[1];
  if (r >= 85)   return TIERS[2];
  if (r >= 80)   return TIERS[3];
  if (r >= 70)   return TIERS[4];
  if (r >= 60)   return TIERS[5];
  return TIERS[6];
};

interface PlayerStats {
  playerID: number;
  nickname: string;
  uLRating: number;
  pick_number: number;
  img: string;
  matches: number;
  kills: number;
  deaths: number;
  assists: number;
  headshots: number;
  kast: number;
  damage: number;
  exchanged: number;
  firstDeaths: number;
  firstKills: number;
  multiKills: number[];
  clutches: number[];
  rounds: number;
  teamID: number;
  ul_id: string | null;
  kpr: number;
  dpr: number;
  impact: number;
  clutchExp: number;
  rating: number;
  matchID: number;
  is_winner: boolean;
  date: string;
}

type SortableColumn =
  | "K" | "D" | "A" | "K/D" | "+/-" | "HS%" | "ADR"
  | "FK" | "FD" | "CExp" | "KAST" | "IMP" | "Maps" | "KPR" | "DPR" | "Rating";

type SortDirection = "asc" | "desc" | null;

interface Tournament { id: string; name: string; }

const columnMapping: Record<SortableColumn, keyof PlayerStats | ((p: PlayerStats) => number)> = {
  K:    "kills",
  D:    "deaths",
  A:    "assists",
  "K/D":  p => p.kills / p.deaths,
  "+/-":  p => p.kills - p.deaths,
  ADR:    p => p.damage / p.rounds,
  "HS%":  p => p.headshots || 0,
  FK:   "firstKills",
  FD:   "firstDeaths",
  CExp: "clutchExp",
  KAST:   p => p.kast,
  IMP:    p => p.impact,
  Maps: "matches",
  KPR:    p => p.kills / p.rounds,
  DPR:    p => p.deaths / p.rounds,
  Rating: p => p.rating,
};

const renderCell = (player: PlayerStats, col: SortableColumn) => {
  const v = columnMapping[col];
  if (typeof v === "function") {
    const n = v(player);
    switch (col) {
      case "HS%":  return `${n.toFixed(0)}%`;
      case "ADR":
      case "+/-":
      case "KAST": return n.toFixed(0);
      case "IMP":  return (n * 1.75 + 0.1).toFixed(2);
      default:     return n.toFixed(2);
    }
  }
  return player[v];
};

export default function PlayersTable({
  players,
  ulTournaments,
}: {
  players: PlayerStats[];
  ulTournaments: Tournament[];
}) {
  const [selectedPicks,   setSelectedPicks]   = useState<number[]>([]);
  const [showBestByPicks, setShowBestByPicks] = useState(false);
  const [showWinners,     setShowWinners]     = useState(false);
  const [ulTournament,    setUlTournament]    = useState<string>("");
  const [matchesFilter,   setMatchesFilter]   = useState<"all"|"enough"|"low">("all");
  const [filters, setFilters] = useState<{ sortColumn: SortableColumn|null; sortDirection: SortDirection }>({
    sortColumn: null, sortDirection: null,
  });
  const [range, setRange] = useState<{ ratingRange: [number, number] }>({ ratingRange: [0, 100] });

  const extractNumber = (name: string) => { const m = name.match(/\d+/g); return m ? parseInt(m[0]) : 0; };
  const sortedTournaments = [...ulTournaments].sort((a, b) => extractNumber(b.name) - extractNumber(a.name));

  const filteredData = useMemo(() => {
    let result = players.filter(p =>
      p.uLRating >= range.ratingRange[0] &&
      p.uLRating <= range.ratingRange[1] &&
      p.ul_id == ulTournament
    );

    if (selectedPicks.length > 0)
      result = result.filter(p => selectedPicks.includes(p.pick_number));

    switch (matchesFilter) {
      case "enough": result = result.filter(p => p.matches >= 10); break;
      case "low":    result = result.filter(p => p.matches < 10);  break;
    }

    if (filters.sortColumn) {
      const key = columnMapping[filters.sortColumn];
      const getValue = (p: PlayerStats): number =>
        typeof key === "function" ? key(p) : (p[key] as number);
      result = [...result].sort((a, b) =>
        filters.sortDirection === "desc"
          ? getValue(a) - getValue(b)
          : getValue(b) - getValue(a)
      );
    }

    if (showBestByPicks) {
      const map = new Map<number, PlayerStats>();
      result.forEach(p => { if (!map.has(p.pick_number)) map.set(p.pick_number, p); });
      result = [...map.values()];
    }

    if (showWinners) result = result.filter(p => p.is_winner);

    const enough = result.filter(p => p.matches >= 10);
    const low    = result.filter(p => p.matches < 10);
    return [...enough, ...low];
  }, [players, filters, ulTournament, range, matchesFilter, selectedPicks, showBestByPicks, showWinners]);

  const handleSort = (col: SortableColumn) =>
    setFilters(prev => ({
      sortColumn: col,
      sortDirection: prev.sortColumn === col
        ? prev.sortDirection === "asc" ? "desc" : "asc"
        : "asc",
    }));

  const cols = Object.keys(columnMapping) as SortableColumn[];

  return (
    <div className="players-stats-container">

      {/* ── controls ────────────────────────────────────────── */}
      <div className="controls-bar">

        {ulTournament ? (
          /* tournament-mode controls */
          <>
            <button
              className={`btn${showBestByPicks ? " btn-active" : ""}`}
              onClick={() => setShowBestByPicks(!showBestByPicks)}
            >
              {showBestByPicks ? "Reset" : "Best by picks"}
            </button>
            <button
              className={`btn${showWinners ? " btn-active" : ""}`}
              onClick={() => setShowWinners(!showWinners)}
            >
              {showWinners ? "Reset" : "Winners"}
            </button>
            <div className="picks-filter">
              {[1,2,3,4,5].map(n => (
                <label key={n}>
                  <input
                    type="checkbox"
                    checked={selectedPicks.includes(n)}
                    onChange={e => setSelectedPicks(
                      e.target.checked
                        ? [...selectedPicks, n]
                        : selectedPicks.filter(p => p !== n)
                    )}
                  />
                  PICK_{n}
                </label>
              ))}
            </div>
          </>
        ) : (
          /* mix-mode controls */
          <div className="btn-group">
            {(["all","enough","low"] as const).map(f => (
              <button
                key={f}
                className={`btn${matchesFilter === f ? " btn-active" : ""}`}
                onClick={() => setMatchesFilter(f)}
              >
                {f === "all" ? "ALL" : f === "enough" ? "10+ MAPS" : "< 10"}
              </button>
            ))}
          </div>
        )}

        <DataTableControls
          className=""
          onFilterChange={setRange}
          minRating={0}
          maxRating={100}
        />

        <select
          className="tournament-select"
          value={ulTournament}
          onChange={e => setUlTournament(e.target.value)}
        >
          <option value="">MIX</option>
          {sortedTournaments.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        {/* row count */}
        <span className="cap cap--xs" style={{ marginLeft: "auto" }}>
          {filteredData.length}_PLAYERS
        </span>
      </div>

      {/* ── table ───────────────────────────────────────────── */}
      <div className="stats-table-wrapper">
        <div className="stats-grid">

          {/* headers */}
          <div className="grid-header">#</div>
          <div className="grid-header">NICKNAME</div>
          {cols.map(col => (
            <div
              key={col}
              className="grid-header"
              onClick={() => handleSort(col)}
              style={{ cursor: "pointer" }}
            >
              {col}
              {filters.sortColumn === col && (
                <span style={{ marginLeft: 4, color: "#fff" }}>
                  {filters.sortDirection === "asc" ? "↑" : "↓"}
                </span>
              )}
            </div>
          ))}

          {/* rows */}
          {filteredData.map((player, idx) => {
            const { color } = ratingTier(player.uLRating);
            const isDim = player.matches < 10 && !player.ul_id;

            return (
              <Link
                href={`/player/${player.playerID}`}
                key={`${player.playerID}-${player.ul_id ?? ""}`}
                className={`grid-row${isDim ? " dim" : ""}`}
                style={{ display: "contents", textDecoration: "none" }}
              >
                {/* rank cell */}
                <div className="grid-item" style={{ position: "relative", justifyContent: "center" }}>
                  {player.pick_number ? (
                    <Image
                      src={picks[player.pick_number - 1]}
                      alt={`pick ${player.pick_number}`}
                      width={72}
                      height={48}
                      style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 72, height: 48 }}
                    />
                  ) : (
                    <span
                      className="num ghost"
                      style={{ fontSize: 18 }}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  )}
                </div>

                {/* nickname cell */}
                <div className="grid-item" style={{ gap: 10 }}>
                  {player.img ? (
                    <Image
                      width={30} height={30}
                      alt="avatar"
                      src={`https://cdn.fastcup.net/avatars/users/${player.img}`}
                      style={{ borderRadius: "50%", border: `2px solid ${color}`, flexShrink: 0 }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 30, height: 30, borderRadius: "50%",
                        border: `2px solid ${color}`, flexShrink: 0,
                        background: "var(--zinc-900)",
                      }}
                    />
                  )}
                  <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    <span style={{ fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: "-0.02em", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {player.nickname}
                    </span>
                    <span className="sub cap cap--xs" style={{ marginTop: 1 }}>
                      ULR: {player.uLRating}
                    </span>
                  </div>
                </div>

                {/* stat cells */}
                {cols.map(col => (
                  <div
                    key={col}
                    className="grid-item"
                    style={{
                      justifyContent: "flex-end",
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      color: col === "Rating" || col === "K/D" || col === "IMP"
                        ? getRatingColor(Number(renderCell(player, col)), 0.4, 1.4)
                        : undefined,
                    }}
                  >
                    <span className="rating-color">
                      {renderCell(player, col) as string}
                    </span>
                  </div>
                ))}
              </Link>
            );
          })}

          {filteredData.length === 0 && (
            <div className="loading">NO_DATA_FOR_TOURNAMENT</div>
          )}
        </div>
      </div>
    </div>
  );
}
