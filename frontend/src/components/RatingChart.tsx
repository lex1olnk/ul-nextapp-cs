'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MatchRating {
  matchNumber: number;
  rating: number;
}

export function RatingChart({ matches }: { matches: MatchRating[] }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={matches}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="matchNumber" 
            stroke="#9CA3AF"
            tickFormatter={(value) => `Матч ${value}`}
          />
          <YAxis 
            stroke="#9CA3AF"
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }}
            itemStyle={{ color: '#F3F4F6' }}
            formatter={(value: number, name: string) => {
              if (name === 'rating') return [value.toFixed(2), 'Рейтинг'];
              if (name === 'kills') return [value, 'Убийства'];
              return [value, 'Смерти'];
            }}
          />
          <Line
            type="monotone"
            dataKey="rating"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="Рейтинг"
          />
          <Line
            type="monotone"
            dataKey="kills"
            stroke="#10B981"
            strokeWidth={1}
            dot={{ r: 3 }}
            name="Убийства"
          />
          <Line
            type="monotone"
            dataKey="deaths"
            stroke="#EF4444"
            strokeWidth={1}
            dot={{ r: 3 }}
            name="Смерти"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}