import { PlayerData } from "@/types/types";
import { RatingChart } from "./RatingChart";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function PlayerCard ({ data } : { data: PlayerData}) {
    const { recent_matches, average_stats} = data
    const chartData = recent_matches
    .slice(0, 10)
    .map((match, index) => ({
      matchNumber: index + 1,
      rating: match.KASTScore || 0, // Используйте реальное поле с рейтингом
    }));
    
    return (<div className="bg-lightdark text-gray-100 min-h-screen max-w-7xl p-8 mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Игрок #{data.player_id}</h1>
        </div>
        
        {/* Основные показатели */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Рейтинг" 
            value={average_stats.rating || 'N/A'}
            trend="neutral"
          />
          <StatCard
            title="K/D"
            value={`${average_stats.kills.toFixed(1)}/${average_stats.deaths.toFixed(1)}`}
            trend={average_stats.kills / average_stats.deaths > 1 ? 'positive' : 'negative'}
          />
          <StatCard
            title="HS%"
            value={`${(average_stats.headshots * 100).toFixed(1)}%`}
            progress={average_stats.headshots}
          />
          <StatCard
            title="KAST"
            value={`${(average_stats.kast_score * 100).toFixed(1)}%`}
            progress={average_stats.kast_score}
          />
        </div>
        
        {/* Детальная статистика */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Средние показатели</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatItem title="Урон за раунд" value={average_stats.damage.toFixed(1)} />
            <StatItem title="Убийств за раунд" value={average_stats.kills.toFixed(2)} />
            <StatItem title="Смертей за раунд" value={average_stats.deaths.toFixed(2)} />
            <StatItem title="Ассистов за раунд" value={average_stats.assists.toFixed(2)} />
            <StatItem title="Сыграно раундов" value={average_stats.rounds} />
          </div>
        </div>
        
        {/* Последние матчи */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Динамика рейтинга (последние 10 матчей)</h2>
          <RatingChart matches={chartData} />
        </div>
    </div>
        )
}

// Компоненты остаются такими же, как в предыдущем примере
const StatCard = ({ title, value, trend }: any) => (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-gray-400 text-sm mb-2">{title}</h3>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold">{value}</span>
        {trend && (
          <span className={`text-sm ${trend === 'positive' ? 'text-green-400' : 'text-red-400'}`}>
            {trend === 'positive' ? '↑' : '↓'}
          </span>
        )}
      </div>
    
    </div>
  );
  
  const StatItem = ({ title, value }: any) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-700">
      <span className="text-gray-400">{title}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
  
