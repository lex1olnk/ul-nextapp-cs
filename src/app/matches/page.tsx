import PlayersTable from "@/components/matches/PlayersTable";
import api from "@/lib/api";
import { getTournaments } from "../upload/api";

interface PlayerStats {
  playerID: number;
  nickname: string;
  uLRating: number;
  img: string;
  matches: number;
  kills: number;
  deaths: number;
  assists: number;
  headshots: number;
  kast: number;
  damage: number;
  exchanged: number;
  firstDeath: number;
  kirstKill: number;
  multiKills: number[];
  clutches: number[];
  rounds: number;
  ul_id: string | null;
  teamID: number;
  kpr: number;
  dpr: number;
  impact: number;
  clutchScore: number;
  rating: number;
  matchID: number;
  isWinner: boolean;
  date: string;
}

export const revalidate = 3600;

async function getMatches() {
  try {
    const response = await api.get<{ Players: PlayerStats[] }>("/api/matches");
    return response.data.Players;
  } catch (error) {
    console.error("API Error:", error);
    return []; // Возвращаем пустые данные вместо исключения
  }
}

export default async function PlayersStatsPage() {
  const players = await getMatches();
  const tournaments = await getTournaments();

  if (players.length > 0) {
    players.map((player) => {
      player.headshots = (player.headshots / player.kills) * 100;
      player.kast = (player.kast / player.rounds) * 100;
    });
    players.sort((a, b) => b.rating - a.rating);
  }

  return (
    <div>
      <div className="players-stats-container">
        <h1 className="my-8 text-center text-5xl">ULMIX STATS</h1>

        {players && tournaments && <PlayersTable players={players} ulTournaments={tournaments}/>}
      </div>
    </div>
  );
}
