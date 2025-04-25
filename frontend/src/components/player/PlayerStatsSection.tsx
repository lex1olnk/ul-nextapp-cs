import React from "react";
import { Card, CardContent } from "./Card";
import Image from "next/image";

export const PlayerStatsSection = ({ 
  playerStats 
}: { 
  playerStats: {
    kill: number
  }
}) => {
  console.log(playerStats)
  // Data for main stats cards
  const mainStats = [
    {
      title: "Damage/Round",
      value: "145.2",
      percentile: "Top 0.1%",
    },
    {
      title: "K/D Ratio",
      value: "2.3",
      percentile: "Top 0.1%",
    },
    {
      title: "Headshot %",
      value: "77%",
      percentile: "Top 0.1%",
    },
    {
      title: "Winrate",
      value: "100%",
      percentile: "Top 0.1%",
    },
  ];

  // Data for secondary stats cards
  const secondaryStats = [
    {
      title: "Kills",
      value: "3",
    },
    {
      title: "Deaths",
      value: "3",
    },
    {
      title: "Assists",
      value: "3",
    },
    {
      title: "KAST",
      value: "73%",
    },
    {
      title: "FK/FD",
      value: "13/2",
    },
    {
      title: "UL Rating",
      value: "84.2",
    },
  ];

  return (
    <section className="relative w-[737px] h-[203px] bg-light-dark">
        <Image
          className="absolute top-[8px] left-[8px]"
          width={12}
          height={12}
          alt="Line"
          src="https://c.animaapp.com/m9uwos437IZJ3W/img/line-8.svg"
        />
        <Image
          width={12}
          height={12}
          className="absolute bottom-[8px] left-[8px]"
          alt="Line"
          src="https://c.animaapp.com/m9uwos437IZJ3W/img/line-10.svg"
        />
        <Image
          width={12}
          height={12}
          className="absolute bottom-[8px] right-[8px]"
          alt="Line"
          src="https://c.animaapp.com/m9uwos437IZJ3W/img/line-9.svg"
        />
        <Image
          width={12}
          height={12}
          className="absolute top-[8px] right-[8px]"
          alt="Line"
          src="https://c.animaapp.com/m9uwos437IZJ3W/img/line-8-1.svg"
        />
      <div className="relative w-full top-1/2 -translate-y-1/2 py-8 px-5">
        <Image
          width={172}
          height={172}
          className="absolute top-[24px] left-[16px] -z-10"
          alt="Intersect"
          src="https://c.animaapp.com/m9uwos437IZJ3W/img/intersect.svg"
        />
        <div className="flex justify-between">
          {mainStats.map((stat, index) => (
            <Card
              key={index}
              className="w-40 h-[81px] bg-light-dark shadow-[0px_4px_4px_#00000040] rounded-none border-0"
            >
              <CardContent className="p-0 h-full">
                <div className="relative h-full">
                  <div className="relative w-1 h-[59px] top-[11px] left-[9px] bg-neutral-900">
                    <div className="relative h-[53px] top-1.5 bg-[#ffbaba]" />
                  </div>
                  <div className="absolute w-auto h-[51px] top-[13px] left-[25px]">
                    <div className="font-normal text-[#c7c7c7] text-sm">
                      {stat.title}
                    </div>
                    <div className="font-medium text-white text-base">
                      {stat.value}
                    </div>
                    <div className="font-normal text-[#c7c7c7] text-[11px]">
                      {stat.percentile}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Secondary stats row */}
        <div className="flex justify-between mt-4">
          {secondaryStats.map((stat, index) => (
            <Card
              key={index}
              className="w-[96px] h-[60px] bg-[#2b2b2b] shadow-[0px_4px_4px_#00000040] rounded-none border-0"
            >
              <CardContent className="p-0 h-full">
                <div className="relative w-full h-full p-2.5">
                  <div className="font-normal text-[#c7c7c7] text-sm">
                    {stat.title}
                  </div>
                  <div className="font-normal text-white text-sm">
                    {stat.value}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
