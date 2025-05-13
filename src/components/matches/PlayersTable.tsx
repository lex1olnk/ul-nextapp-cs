"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

//import { getRatingColor } from "@/lib/utils"

import logo from "@/components/player/top.gif";

import { getRatingColor } from "@/lib/utils";
import { DataTableControls } from "./DataTableControls";
import "./style.css";

const ratingTier = (uLRating: number) => {
  if (uLRating == 0) {
    return { rank: "?", color: "#AAAAAA" };
  }
  if (uLRating >= 90) {
    return { rank: "SSS", color: "#881616" };
  }
  if (uLRating >= 85) {
    return { rank: "SS", color: "#C73A3A" };
  }
  if (uLRating >= 80) {
    return { rank: "S", color: "#E5992D" };
  }
  if (uLRating >= 70) {
    return { rank: "A", color: "#E3E35D" };
  }
  if (uLRating >= 60) {
    return { rank: "B", color: "#6AE87D" };
  }
  return { rank: "C", color: "#4BEDC7" };
};

interface PlayerStats {
  playerID: number;
  nickname: string;
  uLRating: number;
  img: string;
  matches: number;
  kills: number;
  deaths: number;
  assists: number;
  headshots: number;
  kast: number;
  damage: number;
  exchanged: number;
  firstDeath: number;
  kirstKill: number;
  multiKills: number[];
  clutches: number[];
  rounds: number;
  teamID: number;
  ul_id: string | null;
  kpr: number;
  dpr: number;
  impact: number;
  clutchScore: number;
  rating: number;
  matchID: number;
  isWinner: boolean;
  date: string;
}

type SortableColumn =
  | "Kills"
  | "Deaths"
  | "Assists"
  | "HS%"
  | "ADR"
  | "KAST"
  | "IMP"
  | "Maps"
  | "Rating";

type SortDirection = "asc" | "desc" | null;

interface FilterState {
  sortColumn: SortableColumn | null;
  sortDirection: SortDirection;
}

interface RangeState {
  ratingRange: [number, number];
}

// Добавим маппинг столбцов на поля данных
const columnMapping: Record<
  SortableColumn,
  keyof PlayerStats | ((player: PlayerStats) => number)
> = {
  Kills: "kills",
  Deaths: "deaths",
  Assists: "assists",
  "HS%": (player) => player.headshots || 0,
  ADR: (player) => player.damage / player.rounds,
  KAST: (player) => player.kast,
  IMP: (player) => player.impact,
  Maps: "matches",
  Rating: (player) => player.rating,
};

interface Tournament {
  id: string;
  name: string;
}

export default function PlayersTable(props: { players: PlayerStats[], ulTournaments: Tournament[] }) {
  const { players, ulTournaments } = props;
  const [ulTournament, setUlTournament] = useState<string>("")
  const [filters, setFilters] = useState<FilterState>({
    sortColumn: null,
    sortDirection: null,
  });
  const [range, setRange] = useState<RangeState>({
    ratingRange: [0, 100],
  });

  const filteredData = useMemo(() => {
    const ulFilter = players.filter(
      (player) =>
        player.uLRating >= range.ratingRange[0] &&
        player.uLRating <= range.ratingRange[1],
    );

    let result = ulFilter.filter(
      (player) => player.ul_id == ulTournament
    )

    
    if (filters.sortColumn) {
      result = [...result].sort((a, b) => {
        const columnKey = columnMapping[filters.sortColumn!];

        const getValue = (player: PlayerStats): number => {
          if (typeof columnKey === "function") return columnKey(player);
          return player[columnKey] as number;
        };

        const valueA = getValue(a);
        const valueB = getValue(b);

        return filters.sortDirection === "desc"
          ? valueA - valueB
          : valueB - valueA;
      });
    }

    return result;
  }, [players, filters, ulTournament, range]);

  // Функция для отображения значения ячейки
  const renderCellValue = (player: PlayerStats, column: SortableColumn) => {
    const value = columnMapping[column];

    if (typeof value === "function") {
      const result = value(player);
      switch (column) {
        case "HS%":
          return `${result.toFixed(0)}%`;
        case "ADR":
          return result.toFixed(0);
        case "KAST":
          return result.toFixed(0);
        case "IMP":
          return (result * 1.75 + 0.1).toFixed(2);
        default:
          return result.toFixed(2);
      }
    }

    return player[value];
  };

  const handleSortChange = (column: SortableColumn) => {
    setFilters((prev) => {
      if (prev.sortColumn === column) {
        return {
          ...prev,
          sortDirection: prev.sortDirection === "asc" ? "desc" : "asc",
        };
      }
      return {
        ...prev,
        sortColumn: column,
        sortDirection: "asc",
      };
    });
  };

  return (
    <div>
      <div className="flex flex-row justify-between">
        <div>
          <h1 className="my-2">Players Statistics</h1>
          <p className="text-xs">Нажатие на имя столба проводит сортировку по его значениям.</p>
        </div>
        
        <div className="flex flex-row mb-2 align-bottom">
          <DataTableControls
            className="" 
            onFilterChange={setRange}
            minRating={0}
            maxRating={100}
          />
          <form className="max-w-sm mx-auto">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select an option</label>
            <select 
              id="countries" 
              className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-light-dark dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onChange={e => setUlTournament(e.target.value)}
            >
              <option value="" defaultValue="">MIX</option>
              {ulTournaments.map(tournament => 
                  <option value={tournament.id} key={tournament.name}>{tournament.name}</option>
              )}
            </select>
          </form>
        </div>
      </div>



      <div className="stats-table-wrapper">
        <div className="stats-grid">
          {/* Заголовки */}
          <div className="grid-header">№</div>
          <div className="grid-header">Nickname</div>
          {Object.keys(columnMapping).map((column) => (
            <div
              key={column}
              className="grid-header cursor-pointer hover:bg-slate-500"
              onClick={() => handleSortChange(column as SortableColumn)}
            >
              {column}
              {filters.sortColumn === column && (
                <span className="ml-2">
                  {filters.sortDirection === "asc" ? "↑" : "↓"}
                </span>
              )}
            </div>
          ))}

          {/* Данные */}
          {filteredData.map((player, index) => {
            const { color } = ratingTier(player.uLRating);
            return (
              <Link
                href={`/player/${player.playerID}`}
                key={player.playerID + (player.ul_id ? player.ul_id : "")}
                className="grid-row hover:translate-x-1 hover:scale-x-[1.01] transition-all"
              >
                <div className="grid-item">
                  {index == 0 && (
                    <Image
                      className="flex absolute w-24 mix-blend-screen -translate-x-4 -translate-y-4"
                      src={logo}
                      alt="loading..."
                    />
                  )}
                  <span className="m-auto">{index + 1}</span>
                </div>

                <div className="grid-item flex flex-row">
                  {player.img ? (
                    <Image
                      width={40}
                      height={40}
                      alt="profile img"
                      src={`https://cdn.fastcup.net/avatars/users/${player.img}`}
                      style={{ borderColor: color }}
                      className="rounded-full w-10 h-10 my-auto border-2"
                    />
                  ) : (
                    <div
                      className="rounded-full w-10 h-10 my-auto border-2"
                      style={{ borderColor: color }}
                    ></div>
                  )}

                  <div className="flex flex-col">
                    <span className="ml-4">{player.nickname}</span>
                    <span className="ml-4 text-xs">{player.uLRating}</span>
                  </div>
                </div>

                {Object.keys(columnMapping).map((column) => (
                  <div
                    key={column}
                    className="grid-item"
                    style={{
                      color:
                        column == "Rating"
                          ? getRatingColor(
                              Number(
                                renderCellValue(
                                  player,
                                  column as SortableColumn,
                                ),
                              ),
                              0.3,
                              1.5,
                            )
                          : "#fff",
                    }}
                  >
                    {renderCellValue(player, column as SortableColumn)}
                  </div>
                ))}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
