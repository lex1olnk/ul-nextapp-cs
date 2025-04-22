// Типы для данных игрока
export interface PlayerStats {
  kd: number;
  kdTrend: number;
  kdHistory: TimeSeriesData;
  winRate: number;
  winRateTrend: number;
  winRateHistory: TimeSeriesData;
  headshotPercentage: number;
  hsTrend: number;
  matchHistory: MatchHistoryEntry[];
}

export interface TimeSeriesData {
  labels: string[];
  data: number[];
}

export interface MatchHistoryEntry {
  date: string;
  map: string;
  kills: number;
  deaths: number;
  assists: number;
  adr: number;
  
  won: boolean;
}

// Типы для пропсов компонентов
export type TimeRange = '24h' | '7d' | '30d' | 'all';

export interface StatCardProps {
  title: string;
  value: string | number;
  trend: number;
  isPercentage?: boolean;
}

export interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
}