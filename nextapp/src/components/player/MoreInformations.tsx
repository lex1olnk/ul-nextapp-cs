import { Card, CardContent } from "./Card";

export const MoreInformations = ({
  player: {
    firstKills,
    firstDeaths,
    flashes,
    exchanged,
    nades,
    maps,
    clutches,
  }
}: {
  player: {
    firstKills: string;
    firstDeaths: string;
    flashes: number;
    exchanged: number;
    nades: number;
    maps: number;
    clutches: number[];
  }
}) => {
  const stats = [
    {
      key: "FKills",
      value: firstKills,
    },
    {
      key: "FDeaths",
      value: firstDeaths,
    },
    {
      key: "FlashK",
      value: flashes,
    },
    {
      key: "Trade",
      value: exchanged,
    },
    {
      key: "GrDmg",
      value: nades,
    },
    {
      key: "Matches",
      value: maps,
    },
  ];
  const cstats = [
    {
      key: "1 v 1",
      value: clutches["1v1"],
    },
    {
      key: "1 v 1",
      value: clutches["1v2"],
    },
    {
      key: "1 v 1",
      value: clutches["1v3"],
    },
    {
      key: "1 v 1",
      value: clutches["1v4"],
    },
    {
      key: "1 v 1",
      value: clutches["1v5"],
    },
  ];
  console.log(clutches)
  return (
    <>
      <div className="flex flex-col my-8">
        <div className="relative flex justify-between">
          {stats.map((stat) => (
            <Card
              key={stat.key}
              className="w-[80px] h-[60px] bg-[#2b2b2b] shadow-[0px_4px_4px_#00000040] rounded-none border-0"
            >
              <CardContent className="p-0 h-full">
                <div className="relative w-full h-full p-2.5">
                  <div className="font-normal text-[#c7c7c7] text-sm">
                    {stat.key}
                  </div>
                  <div className="font-normal text-white text-sm">
                    {stat.value}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {cstats.map((item, index) => (
            <Card
              key={item.key + index}
              className="w-[80px] h-[60px] bg-[#2b2b2b] shadow-[0px_4px_4px_#00000040] rounded-none border-0"
            >
              <CardContent className="p-0 h-full">
                <div className="relative w-full h-full p-2.5">
                  <div className="font-normal text-[#c7c7c7] text-sm">
                    {`1 v ${index + 1}`}
                  </div>
                  <div className="font-normal text-white text-sm">{item.value}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
};
