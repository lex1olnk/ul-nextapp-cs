"use client";

import { getPlayerMatches } from '@/app/player/[id]/api';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface Tournament {
  id: string;
  name: string;
}

interface MatchData {
  matchId: string;
  finishedAt: string; // ISO строка даты
  map: string;
  kills: number;
  deaths: number;
  assists: number;
  rating: number;
  isWinner: boolean;
}

export const RatingStatisticsSection = ({ playerId, ulTournaments }: { playerId: string, ulTournaments: Tournament[] }) => {
  const [ulTournament, setUlTournament] = useState<string>("");
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Мемоизируем сортировку турниров
  const sortedTournaments = useMemo(() => {
    const extractNumber = (name: string) => {
      const numbers = name.match(/\d+/g);
      return numbers ? parseInt(numbers[0]) : 0;
    };

    return [...ulTournaments].sort((a, b) => {
      const numA = extractNumber(a.name);
      const numB = extractNumber(b.name);
      return numB - numA;
    });
  }, [ulTournaments]);

  // Функция загрузки данных
  const loadMatches = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getPlayerMatches(playerId, ulTournament, 0);

      setMatches(res.data);
    } catch (error) {
      console.error("Failed to load matches", error);
    } finally {
      setIsLoading(false);
    }
  }, [playerId, ulTournament]);

  // Загружаем данные при изменении турнира
  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  return (
    <>
      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select an option</label>
      <select 
        id="tournament" 
        value={ulTournament}
        className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-light-dark dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        onChange={e => setUlTournament(e.target.value)}
      >
        <option value="">MIX</option>
        {sortedTournaments.map(tournament => 
          <option value={tournament.id} key={tournament.id}>{tournament.name}</option>
        )}
      </select>
      
      {isLoading && <div>...LOADING</div>}
      
      <table className="border-spacing-y-3 border-separate w-full bg-light-dark/90 text-left pl-8 py-2.5 pr-4">
        <thead>
          <tr className=" *:font-extralight text-gray-300">
            <th className="font-extralight w-3/24">Date</th>
            <th className="w-9/24">Map</th>
            <th className=" w-5/24">K / D / A</th>
            <th className="w-7/24">Rating</th>
          </tr>
        </thead>
        <tbody>
          {matches && matches.map((match, index) => {
            const date = new Date(match.finishedAt);
            const dateShow = `${date.toLocaleDateString("en-US", { day: "numeric" })} ${date.toLocaleDateString("en-US", { month: "short" })} `;
            return (
              <tr
                key={match.matchId || index}
                className=" hover:cursor-pointer border-b-2 hover:bg-my-gray hover:translate-x-1 hover:scale-x-[1.01] transition-all"
                onClick={() => window.location.href = `https://cs2.fastcup.net/matches/${match.matchId}`}
              >
                <td>{dateShow}</td>
                <td>
                  <div className={`px-3 flex w-fit rounded-md ${match.isWinner ? "bg-green-800/30 text-green-200" : "bg-red-800/30 text-red"}`}>
                    {match.map}
                  </div>
                </td>
                <td>{match.kills} / {match.deaths} / {match.assists}</td>
                <td>{match.rating?.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};