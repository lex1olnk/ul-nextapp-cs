"use client";

import { PlayerCardDetailed } from "../ui/PlayerCard";

interface EntryCircleProps {
  percent: number;
  wins: number;
  loses: number;
}

const EntryCircle = ({ percent, wins, loses }: EntryCircleProps) => {
  return (
    <div className="mx-auto flex flex-col justify-center items-center rounded-full w-64 h-64 border-2 border-white text-white">
      <div className="flex-1 flex items-end">
        <p className="text-7xl">{percent}</p>
      </div>
      <div className="flex-1">
        <div className="text-center">
          <p>entry success</p>
        </div>

        <div className="flex flex-row gap-4 text-4xl">
          <p>{wins}</p>|<p>{loses}</p>
        </div>
      </div>
    </div>
  );
};

export const EntrySection = () => {
  return (
    <div>
      <EntryCircle percent={50} wins={30} loses={30} />
      <PlayerCardDetailed />
    </div>
  );
};
