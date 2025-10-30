"use client";

import { useState } from "react";

interface PlayerStats {
  kills: {
    win: number;
    lose: number;
  };
  Cap: {
    win: number;
    lose: number;
  };
  First: {
    win: number;
    lose: number;
  };
  Second: {
    win: number;
    lose: number;
  };
  Third: {
    win: number;
    lose: number;
  };
  Last: {
    win: number;
    lose: number;
  };
}

interface Player {
  id: string;
  name: string;
  playerStats: PlayerStats;
}

export const PlayersComparison = () => {
  const [playerOne, setPlayerOne] = useState<Player | null>(null);
  const [playerTwo, setPlayerTwo] = useState<Player | null>(null);

  // Mock data for demonstration
  const mockPlayers: Player[] = [
    {
      id: "1",
      name: "Player One",
      playerStats: {
        kills: { win: 150, lose: 50 },
        Cap: { win: 45, lose: 15 },
        First: { win: 30, lose: 20 },
        Second: { win: 25, lose: 25 },
        Third: { win: 20, lose: 30 },
        Last: { win: 15, lose: 35 },
      },
    },
    {
      id: "2",
      name: "Player Two",
      playerStats: {
        kills: { win: 120, lose: 80 },
        Cap: { win: 35, lose: 25 },
        First: { win: 25, lose: 25 },
        Second: { win: 30, lose: 20 },
        Third: { win: 25, lose: 25 },
        Last: { win: 20, lose: 30 },
      },
    },
    {
      id: "3",
      name: "Player Three",
      playerStats: {
        kills: { win: 180, lose: 20 },
        Cap: { win: 50, lose: 10 },
        First: { win: 40, lose: 10 },
        Second: { win: 35, lose: 15 },
        Third: { win: 25, lose: 25 },
        Last: { win: 10, lose: 40 },
      },
    },
  ];

  const stats = [
    { key: "kills", title: "Total Kills" },
    { key: "Cap", title: "Capture Points" },
    { key: "First", title: "First Blood" },
    { key: "Second", title: "Second Place" },
    { key: "Third", title: "Third Place" },
    { key: "Last", title: "Last Stand" },
  ];

  const getStatValue = (
    player: Player | null,
    statKey: keyof PlayerStats,
    type: "win" | "lose"
  ) => {
    if (!player) return 0;
    return player.playerStats[statKey][type];
  };

  const calculatePercentage = (win: number, lose: number) => {
    const total = win + lose;
    return total > 0 ? Math.round((win / total) * 100) : 0;
  };

  return (
    <div className="flex flex-col bg-gray-900 text-white p-6 rounded-lg max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold font-mono">PLAYER VS PLAYER</h2>
        <p className="text-gray-400 mt-2">
          Compare player statistics head-to-head
        </p>
      </div>

      {/* Player Selection */}
      <div className="flex justify-between gap-6 mb-8">
        {/* Player One Selection */}
        <div className="flex-1">
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400 mb-2 font-mono">
              SELECT PLAYER 1
            </div>
            <select
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white font-mono"
              value={playerOne?.id || ""}
              onChange={(e) => {
                const player = mockPlayers.find((p) => p.id === e.target.value);
                setPlayerOne(player || null);
              }}
            >
              <option value="">Choose Player</option>
              {mockPlayers.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
            {playerOne && (
              <div className="mt-3 p-3 bg-gray-750 rounded border border-green-500/30">
                <div className="font-mono font-bold text-green-400">
                  {playerOne.name}
                </div>
                <div className="text-xs text-gray-400 mt-1">Selected</div>
              </div>
            )}
          </div>
        </div>

        {/* VS Separator */}
        <div className="flex items-center justify-center">
          <div className="bg-red-500 text-white px-4 py-2 rounded-full font-mono font-bold text-sm">
            VS
          </div>
        </div>

        {/* Player Two Selection */}
        <div className="flex-1">
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400 mb-2 font-mono">
              SELECT PLAYER 2
            </div>
            <select
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white font-mono"
              value={playerTwo?.id || ""}
              onChange={(e) => {
                const player = mockPlayers.find((p) => p.id === e.target.value);
                setPlayerTwo(player || null);
              }}
            >
              <option value="">Choose Player</option>
              {mockPlayers.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
            {playerTwo && (
              <div className="mt-3 p-3 bg-gray-750 rounded border border-blue-500/30">
                <div className="font-mono font-bold text-blue-400">
                  {playerTwo.name}
                </div>
                <div className="text-xs text-gray-400 mt-1">Selected</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Comparison */}
      {(playerOne || playerTwo) && (
        <div className="space-y-4">
          {stats.map((stat) => {
            const player1Win = getStatValue(
              playerOne,
              stat.key as keyof PlayerStats,
              "win"
            );
            const player1Lose = getStatValue(
              playerOne,
              stat.key as keyof PlayerStats,
              "lose"
            );
            const player2Win = getStatValue(
              playerTwo,
              stat.key as keyof PlayerStats,
              "win"
            );
            const player2Lose = getStatValue(
              playerTwo,
              stat.key as keyof PlayerStats,
              "lose"
            );

            const player1Percentage = calculatePercentage(
              player1Win,
              player1Lose
            );
            const player2Percentage = calculatePercentage(
              player2Win,
              player2Lose
            );

            return (
              <div
                key={stat.key}
                className="bg-gray-800 p-4 rounded-lg border border-gray-700"
              >
                {/* Stat Title */}
                <div className="text-center mb-4">
                  <h3 className="font-mono font-bold text-lg text-gray-200">
                    {stat.title}
                  </h3>
                </div>

                {/* Comparison Row */}
                <div className="flex items-center justify-between">
                  {/* Player One Stats */}
                  <div className="flex-1 text-center">
                    {playerOne ? (
                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-green-400 font-mono">
                          {player1Win}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          WINS
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1">
                          <div
                            className="bg-green-500 h-1 rounded-full transition-all duration-500"
                            style={{ width: `${player1Percentage}%` }}
                          ></div>
                        </div>
                        <div className="text-lg font-bold text-red-400 font-mono">
                          {player1Lose}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          LOSSES
                        </div>
                        <div className="text-sm text-green-400 font-mono mt-1">
                          {player1Percentage}%
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-500 font-mono">No Player</div>
                    )}
                  </div>

                  {/* Three Lines Separator */}
                  <div className="flex flex-col items-center mx-6">
                    <div className="w-px h-8 bg-gray-600 mb-1"></div>
                    <div className="w-px h-8 bg-gray-600 mb-1"></div>
                    <div className="w-px h-8 bg-gray-600"></div>
                  </div>

                  {/* Player Two Stats */}
                  <div className="flex-1 text-center">
                    {playerTwo ? (
                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-blue-400 font-mono">
                          {player2Win}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          WINS
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1">
                          <div
                            className="bg-blue-500 h-1 rounded-full transition-all duration-500"
                            style={{ width: `${player2Percentage}%` }}
                          ></div>
                        </div>
                        <div className="text-lg font-bold text-red-400 font-mono">
                          {player2Lose}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          LOSSES
                        </div>
                        <div className="text-sm text-blue-400 font-mono mt-1">
                          {player2Percentage}%
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-500 font-mono">No Player</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!playerOne && !playerTwo && (
        <div className="text-center py-12 text-gray-500 font-mono">
          Select players to compare statistics
        </div>
      )}
    </div>
  );
};
