// components/ClutchStats.tsx
"use client";

interface ClutchStats {
  amount: number;
  success: boolean;
  count: number;
}

interface ClutchStatsProps {
  data: ClutchStats[];
}

export const ClutchStats = ({ data }: ClutchStatsProps) => {
  // Группируем данные по количеству противников (1v1, 1v2, ..., 1v5)
  const groupedData = data.reduce(
    (acc, item) => {
      if (!acc[item.amount]) {
        acc[item.amount] = { won: 0, lost: 0 };
      }
      if (item.success) {
        acc[item.amount].won += item.count;
      } else {
        acc[item.amount].lost += item.count;
      }
      return acc;
    },
    {} as Record<number, { won: number; lost: number }>
  );

  // Создаем массив для всех возможных ситуаций от 1v1 до 1v5
  const clutchSituationsTotalCount = data.reduce((acc, item) => {
    return acc + item.count;
  }, 0);
  const clutchSituations = [1, 2, 3, 4, 5].map((amount) => {
    const situation = groupedData[amount] || { won: 0, lost: 0 };
    const total = situation.won + situation.lost;
    const winRate = total > 0 ? Math.round((situation.won / total) * 100) : 0;
    const loseRate = 100 - winRate;

    return {
      amount,
      label: `1 vs ${amount}`,
      won: situation.won,
      lost: situation.lost,
      total,
      winRate,
      loseRate,
    };
  });

  return (
    <div className="w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        Clutch Situations
      </h2>

      <div className="flex flex-row">
        {clutchSituations.map((situation) => (
          <div
            key={situation.amount}
            style={{
              flex: `${situation.total} 1 150px`,
            }}
          >
            {/* Заголовок */}
            <div className="text-lg font-bold text-white">
              {situation.label}
            </div>

            {/* Процент побед на белом фоне */}
            <div className="flex-row flex border-white border-[1px]">
              <div
                className="bg-white p-3"
                style={{
                  flex: `${situation.won} 1 75px`,
                }}
              >
                <div className="text-xl font-bold text-gray-900">
                  {situation.winRate}%
                </div>
              </div>

              {/* Процент поражений на черном фоне */}
              <div
                className="bg-black p-3"
                style={{
                  flex: `${situation.lost} 1 75px`,
                }}
              >
                <div className="text-xl font-bold text-white">
                  {situation.loseRate}%
                </div>
              </div>
            </div>

            {/* Количество клатчей */}

            <div className="text-lg text-gray-300">
              {situation.total} rounds
            </div>

            {/* 
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>W: {situation.won}</span>
              <span>L: {situation.lost}</span>
            </div>
            Детальная статистика */}
          </div>
        ))}
      </div>
    </div>
  );
};
