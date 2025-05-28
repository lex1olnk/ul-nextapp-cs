"use client";

import { getPlayerMatches } from '@/app/player/[id]/api';
import { useActionState, useCallback, useEffect, useState, useTransition } from 'react';

interface Tournament {
  id: string;
  name: string;
}

export const RatingStatisticsSection = ({ playerId, ulTournaments }: { playerId: string, ulTournaments: Tournament[] }) => {
  const [ulTournament, setUlTournament] = useState<string>("")
  const [isPending, startTransition] = useTransition();
  const [state, action] = useActionState(
    async () => {
      console.log(ulTournament)
      return getPlayerMatches(playerId, ulTournament, 0);
    },
    { data: null } // can be null
  );


  const extractNumber = (name) => {
    const numbers = name.match(/\d+/g); // Находим все числа в строке
    return numbers ? parseInt(numbers[0]) : 0; // Берем первое число
  };

  const sortedTournaments = ulTournaments.sort((a, b) => {
    const numA = extractNumber(a.name);
    const numB = extractNumber(b.name);
    return numB - numA; // Сортировка по убыванию
  });

  const stableAction = useCallback(() => {
    return action();
  }, [ulTournament, action]);
  
  useEffect(() => {
    startTransition(() => {
      stableAction();
    });
  }, [stableAction]); // Зависимость от стабильной функции

  return (
    <>
      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select an option</label>
      <select 
        key={ulTournament}
        id="tournament" 
        defaultValue={ulTournament}
        className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-light-dark dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        onChange={e => 
          {
            setUlTournament(e.target.value)
            // Programmatically submit the form when the value changes
            console.log(ulTournament)
          }}
      >
        <option value="" key={""}>MIX</option>
        {sortedTournaments.map(tournament => 
            <option value={tournament.id} key={tournament.name}>{tournament.name}</option>
        )}
      </select>
      {isPending && <div>...LOADING</div>}
      <table className="border-spacing-y-3 border-separate w-full bg-light-dark/90 text-left pl-8 py-2.5 pr-4">
        <thead>
          <tr className=" *:font-extralight text-gray-300">
            <th className="font-extralight w-3/24">Date</th>
            <th className="w-9/24">Map</th>
            <th className=" w-5/24">K / D / A</th>
            <th className="w-7/24">Rating</th>
          </tr>
        </thead>
        <tbody className="">
        {state.data && state.data.map((match, index) => {
          const date = new Date(match.finishedAt);
          const dateShow = `${date.toLocaleDateString("en-US", { day: "numeric" })} ${date.toLocaleDateString("en-US", { month: "short" })} `;
          return (
            <tr
              key={index}
              className=" hover:cursor-pointer border-b-2 hover:bg-my-gray hover:translate-x-1 hover:scale-x-[1.01] transition-all"
              onClick={() =>
                (window.location.href = `https://cs2.fastcup.net/matches/${match.matchId}`)
              }
            >
              <td>{dateShow}</td>
              <td><div className={"px-3 flex w-fit rounded-md " + (match.isWinner ? "bg-green-800/30 text-green-200" : "bg-red-800/30 text-red")}>{match.map}</div></td>
              <td>{match.kills + " " + match.deaths + " " + match.assists} </td>
              <td>{match.rating.toFixed(2)}</td>
            </tr>
          );
        })}
        </tbody>
      </table>
    </>

  );
};
