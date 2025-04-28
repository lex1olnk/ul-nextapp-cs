'use client'

import { Radar } from 'react-chartjs-2';
import { 
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  PointElement,
  LineElement
} from 'chart.js';
import { MapStat } from '@/types/types';

// Регистрируем необходимые компоненты
ChartJS.register(
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  PointElement,
  LineElement
);

function prepareRadarData(mapsStats: MapStat[]) {
  // Создаем карту сыгранных карт для быстрого доступа
  const playedMaps = new Map(mapsStats.map(map => [map.map, map]));
  const mapsNames = [
    'Dust II',
    'Mirage',
    'Inferno',
    'Anubis',
    'Nuke',
    'Vertigo',
    'Ancient'
  ];
  // Формируем данные для всех 7 карт
  return mapsNames.map(mapName => {
    const mapData = playedMaps.get(mapName);
    return {
      map: mapName,
      avg_rating: mapData?.avgRating || 0,
      matches: mapData?.matches || 0,
      winrate: mapData?.winrate || 0,
      wins: mapData?.wins || 0
    };
  });
}

export const WindroseChart = ({ maps }: { maps: MapStat[] }) => {
  // Пример данных для 7 категорий CS2
  const normalizedData = prepareRadarData(maps);
  const labels = normalizedData.map(map => `${map.map}`)
  const playedMaps = new Map(normalizedData.map(map => [map.map, map]));
  console.log(playedMaps)
  const data = {
    labels: labels,
    datasets: [{
      label: 'Успешность на карте (%)',
      data: normalizedData.map(map => map.winrate), // Пример процентов успеха
      backgroundColor: 'rgba(255, 255, 255, 1)',
      borderColor: 'rgba(255, 99, 132, 1)',
      fill: true,
      pointBackgroundColor: 'rgba(255, 99, 132, 1)',
      pointBorderColor: '#fff',
    }]
  };

  const options = {
    responsive: true,
    scales: {
      r: {
        angleLines: {
          display: true,
          color: 'rgba(255, 255, 255, 0.1)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.2)'
        },
        ticks: {
          display: false,
          backdropColor: 'transparent'
        },
        suggestedMin: 10,
        suggestedMax: 100,
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#fff',
          font: {
            size: 14
          }
        }
      },
      title: {
        display: true,
        text: 'Статистика по картам CS2',
        color: '#fff',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => `Сыграно ${playedMaps.get(context.label)?.matches} матчей WR: ${context.raw}%`
        }
      }
    }
  };


  return (
    <div style={{ 
      width: '330px', 
      height: '357px',
      padding: '4px',
    }} className='bg-light-dark/90 relative'>
      <Radar 
        data={data} 
        options={options}
      />
    </div>
  );
};

export default WindroseChart;