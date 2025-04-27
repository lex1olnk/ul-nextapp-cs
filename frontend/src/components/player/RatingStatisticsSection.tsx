'use client'
import { Match } from "@/types/types";
import React from "react";

export const RatingStatisticsSection = ({ matches }: { matches: Match[]}) => {
  console.log(matches)
  
  matches.sort((a, b) => new Date(b.finishedAt).getDate() - new Date(a.finishedAt).getDate())
  return (
    <table className="border-spacing-y-3 border-separate w-full bg-light-dark text-left pl-8 py-2.5 pr-4">
      <thead>
        <tr className=" *:font-extralight text-gray-300">
          <th className="font-extralight w-3/24">Date</th>
          <th className="w-9/24">Map</th>
          <th className=" w-5/24">K / D / A</th>
          <th className="w-7/24">Rating</th>
        </tr>
      </thead>
      <tbody className="">
        {matches.map(((match, index) => {
          const date = new Date(match.finishedAt)
          const dateShow = `${date.toLocaleDateString("en-US", { day: 'numeric' })} ${date.toLocaleDateString("en-US", { month: 'short' })} `
          return <tr key={index} className=' hover:cursor-pointer border-b-2 hover:bg-my-gray hover:translate-x-1 hover:scale-x-[1.01] transition-all' onClick={() => window.location.href = `https://cs2.fastcup.net/matches/${match.matchId}`}>
              <td>{dateShow}</td>
              <td>{match.map}</td>
              <td>{match.kills + ' ' + match.deaths + ' ' + match.assists} </td>
              <td>{match.rating.toFixed(2)}</td>
            </tr>
        }))}
      </tbody>
    </table>

  );
};
