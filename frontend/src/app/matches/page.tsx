import axios from 'axios';
import './style.css';
import logo from '@/components/player/top.gif'
import polygon from '@/components/player/polygon.png'
import polygon1 from '@/components/player/polygon1.png'
import polygon2 from '@/components/player/polygon2.png'
import Image from 'next/image';
import Link from 'next/link';

interface PlayerStats {
  playerID: number;
  nickname: string;
  uLRating: number;
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
const colors = [
  {
    color: "#FFEF3D",
    img: polygon
  },
  {
    color: "#DEDEDE",
    img: polygon1
  },
  {
    color: "#FFB44C",
    img: polygon2
  }
]


const PlayersStatsPage: React.FC = async () => {
  const response = await axios.get<{"Players": PlayerStats[]}>('https://vercel-fastcup.vercel.app/api/matches');
  const players = response.data.Players
  players.map(player => {
    player.headshots = player.headshots / player.kills * 100
    player.kast = player.kast / player.rounds * 100
  })
  players.sort((a, b) => b.rating / b.matches -  a.rating / a.matches)
  const getRatingColor = (rating: number) => {
    // Нормализуем рейтинг в диапазон 0-1 (предполагаем, что рейтинг 0-2)
    const normalized = Math.min(Math.max(rating / 1.6, 0), 1);
    
    // Если рейтинг меньше 1 (0-1 диапазон)
    if (normalized <= 0.5) {
      const intensity = Math.floor(255 * (normalized * 2));
      return `rgb(255, ${intensity}, ${intensity})`;
    }
    
    // Если рейтинг больше 1 (1-2 диапазон)
    const intensity = Math.floor(255 * ((1 - normalized) * 2));
    return `rgb(${intensity}, 255, ${intensity})`;
  };

  return (
    <div className="players-stats-container">
      <h1 className='my-8 text-center text-5xl'>ULMIX STATS</h1>
      <h1 className='my-2'>Players Statistics (Last 15 Matches)</h1>
      
      <div className="stats-table-wrapper">
        <table className="stats-table border-spacing-y-2 border-separate">
          <thead>
            <tr>
              <th >№</th>
              <th className='text-left w-1/4'>Nickname</th>
              <th>Kills</th>
              <th>Deaths</th>
              <th>Assists</th>
              <th>HS%</th>
              <th>KAST</th>
              <th>Matches</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {players.map(((player, index) => {
              player.rating /= player.matches
              return <tr key={player.playerID} className='my-4'>
                <td>{index < 3 && <Image className="flex absolute translate-x-1 -translate-y-2" src={colors[index].img} alt="top" />}{index == 0 && <Image className='flex absolute w-24 mix-blend-screen -translate-x-6 -translate-y-4' src={logo} alt="loading..." />}<span className='text-center'>{index + 1}</span></td>
                <td>
                  <Link href={`/player/${player.playerID}`} className='flex flex-row absolute -translate-y-3 '>
                    <span className='flex'>{player.nickname}</span>
                  </Link>
                </td>
                <td>{player.kills}</td>
                <td>{player.deaths}</td>
                <td>{player.assists}</td>
                <td>{(player.headshots || 0).toFixed(0)}%</td>
                <td>{player.kast.toFixed(0)}%</td>
                <td>{player.matches}</td>
                <td className="rating"     
                  style={{ 
                    color: getRatingColor(player.rating),
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
                  }}
                >
                    {player.rating.toFixed(2)}
                </td>
              </tr>
            }))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlayersStatsPage;