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

export const WindroseChart = () => {
  // Пример данных для 7 категорий CS2
  const maps = [
    'Dust II',
    'Mirage',
    'Inferno',
    'Overpass',
    'Nuke',
    'Vertigo',
    'Ancient'
  ];

  const data = {
    labels: maps,
    datasets: [{
      label: 'Успешность на карте (%)',
      data: [85, 72, 68, 60, 55, 78, 63], // Пример процентов успеха
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 2,
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
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          display: false,
          backdropColor: 'transparent'
        },
        suggestedMin: 0,
        suggestedMax: 100,
        beginAtZero: true
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
          label: (context) => `${context.dataset.label}: ${context.raw}%`
        }
      }
    }
  };


  return (
    <div style={{ 
      width: '330px', 
      height: '357px',
      padding: '4px',
    }} className=' bg-light-dark'>
      <Radar 
        data={data} 
        options={options}
      />
    </div>
  );
};

export default WindroseChart;