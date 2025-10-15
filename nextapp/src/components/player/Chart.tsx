'use client'

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export const StatsChart = ({ items }) => {
  if (!items || items.length === 0) return <div>Faceit Link не найден</div>;

  // Подготовка данных для графика
  const chartData = items.map(({ stats }) => ({
    date: new Date(stats['Match Finished At']).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short'
    }),
    kdRatio: parseFloat(stats['K/D Ratio']),
    krRatio: parseFloat(stats['K/R Ratio']),
    map: stats.Map.replace('de_', '')
  })).reverse();

  return (
    <div className="bg-my-gray">
      {/* График */}
      <div className=" p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          Faceit Performance History
        </h2>
        
        <div className="h-64 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF' }}
              />
              <YAxis
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px'
                }}
                itemStyle={{ color: '#E5E7EB' }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '10px' }}
                formatter={(value) => (
                  <span className="text-gray-300">{value}</span>
                )}
              />
              <Line
                type="monotone"
                dataKey="kdRatio"
                name="K/D Ratio"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: '#10B981', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="krRatio"
                name="K/R Ratio"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Остальной код остается без изменений... */}
    </div>
  );
};

// Остальные компоненты (StatCard, MultiKillsStats, MultiKillItem) остаются без изменений...