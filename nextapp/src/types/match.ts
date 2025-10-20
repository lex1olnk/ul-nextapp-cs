export interface MatchNew {
  id: string;
  url: string;
  tournamentId?: string;
  tournament?: {
    id: string;
    name: string;
    status: string;
  };
  platform: "fastcup" | "cybershoke";
  isFinal: boolean;
  bestOf: string;
  type?: string;
  status: "pending" | "downloading" | "parsing" | "completed" | "error";
  startedAt: string;
  updatedAt: string;
  text: string;
  teams: string[];
}

export interface MatchesResponse {
  matches: MatchNew[];
  total: number;
  skip: number;
  take: number;
}

export interface MatchQueryParams {
  skip?: number;
  take?: number;
  include?: string; // JSON string
  where?: string; // JSON string
  orderBy?: string; // JSON string
}

export interface MatchTeam {
  id: number;
  name: string;
  size: number;
  score: number;
  isWinner: boolean;
  captainId: number;
  isDisqualified: boolean;
  matchId: number;
}

export interface MatchMember {
  hash: string;
  role: string;
  ready: boolean;
  impact?: number;
  connected: boolean;
  isLeaver: boolean;
  ratingDiff?: number;
  matchId?: number;
  matchTeamId?: number;
  userId?: number;
}
