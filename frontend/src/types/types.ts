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

export interface Match {
  Kills: number;
  Deaths: number;
  Assists: number;
  Headshots: number;
  KASTScore: number;
  Damage: number;
  Rounds: number;
  MatchID: number;
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

export interface PlayerComparison {
  playerID: number;
  nickname: string;
  uLRating: number;
  kills: number;
  deaths: number;
  assists: number;
  firstKills: number;
  firstDeaths: number;
  kast: number;
  TargetWinrate: number;
  TargetKD: number;
  TargetHSRatio: number;
  TargetAvg: number;
  winrateAdv: number;
  kdAdv: number;
  hsAdv: number;
  avgAdv: number;
}


export interface PlayerData {
  player_stats: PlayerComparison;
  recent_matches: Match[];
}