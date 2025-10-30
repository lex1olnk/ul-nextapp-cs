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
    <div className="p-6 bg-gray-900 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        Clutch Situations
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {clutchSituations.map((situation) => (
          <div
            key={situation.amount}
            className="bg-gray-800 rounded-lg p-4 border border-gray-700"
          >
            {/* Заголовок */}
            <div className="text-lg font-bold text-white text-center mb-4">
              {situation.label}
            </div>

            {/* Процент побед на белом фоне */}
            <div className="bg-white rounded-lg p-3 mb-2 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {situation.winRate}%
              </div>
              <div className="text-sm text-gray-600">Won</div>
            </div>

            {/* Процент поражений на черном фоне */}
            <div className="bg-black rounded-lg p-3 mb-3 text-center border border-gray-700">
              <div className="text-2xl font-bold text-white">
                {situation.loseRate}%
              </div>
              <div className="text-sm text-gray-400">Lost</div>
            </div>

            {/* Количество клатчей */}
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">Total Clutches</div>
              <div className="text-xl font-bold text-gray-300">
                {situation.total}
              </div>
            </div>

            {/* Детальная статистика */}
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>W: {situation.won}</span>
              <span>L: {situation.lost}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
