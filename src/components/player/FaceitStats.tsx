import Image from 'next/image';
import { FaCrosshairs, FaHeadSideVirus, FaSkull } from 'react-icons/fa';
import FaceitLevelIcon from './FaceitLogo';

const MatchStatsSummary = ({ items, faceit }) => {
  if (!items || items.length === 0) return <></>;

  // Расчет средней статистики
  const calculateAverages = () => {
    const totals = items.reduce((acc, { stats }) => ({
      kills: acc.kills + parseInt(stats.Kills),
      deaths: acc.deaths + parseInt(stats.Deaths),
      kdRatio: acc.kdRatio + parseFloat(stats['K/D Ratio']),
      adr: acc.adr + parseFloat(stats.ADR),
      hsPercentage: acc.hsPercentage + parseFloat(stats['Headshots %']),
      mvps: acc.mvps + parseInt(stats.MVPs),
      matches: acc.matches + 1
    }), {
      kills: 0, deaths: 0, kdRatio: 0, adr: 0, 
      hsPercentage: 0, mvps: 0, matches: 0
    });

    return {
      avgKills: (totals.kills / totals.matches).toFixed(1),
      avgDeaths: (totals.deaths / totals.matches).toFixed(1),
      avgKd: (totals.kdRatio / totals.matches).toFixed(2),
      avgAdr: (totals.adr / totals.matches).toFixed(1),
      avgHs: (totals.hsPercentage / totals.matches).toFixed(1),
      totalMvps: totals.mvps
    };
  };

  const averages = calculateAverages();

  return (
    <div className="w-full mt-6">
    <h1 className=' font-bold text-xl'>FaceitStats</h1>
    <div className='flex flex-row my-4'>
      <Image
        className='border-2 rounded-md border-white'
        src={faceit.avatar} 
        alt="faceit-logo"
        width={60}
        height={60}
      />
      <FaceitLevelIcon 
        className="my-auto mx-4 "
        elo={faceit.games.cs2.faceit_elo}
        height={40}
        width={40}
      />
      <div className='flex flex-col my-auto'>
        <h1>{faceit.nickname}</h1>
        <p className='text-sm'>{faceit.games.cs2.faceit_elo}</p>
      </div>
      
    </div>


      {/* Общая статистика */}
      <div className="mb-8 bg-light-dark/90 p-6 rounded-sm">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FaCrosshairs className="text-white" /> 
          Average Stats ({items.length} Matches)
        </h2>
        
        <div className="grid grid-flow-col gap-4">
          <StatCard 
            icon={<FaSkull className="text-red" />}
            title="Avg Kills" 
            value={averages.avgKills}
          />
          <StatCard 
            icon={<FaSkull className="text-white" />}
            title="Avg Deaths" 
            value={averages.avgDeaths}
          />
          <StatCard 
            icon={<FaCrosshairs className="text-white" />}
            title="Avg K/D" 
            value={averages.avgKd}
          />
          <StatCard 
            icon={<FaHeadSideVirus className="text-white" />}
            title="HS %" 
            value={`${averages.avgHs}%`}
          />
          <StatCard 
            icon="🔥"
            title="Avg ADR" 
            value={averages.avgAdr}
          />
          <StatCard 
            icon="🏆"
            title="Total MVPs" 
            value={averages.totalMvps}
          />
        </div>
      </div>
    </div>
  );
};

// Вспомогательные компоненты
const StatCard = ({ icon, title, value }) => (
  <div className="bg-my-gray p-2 rounded-xs flex items-center gap-3">
    <div className="text-2xl ml-1.5">{icon}</div>
    <div>
      <div className="text-sm text-gray-400">{title}</div>
      <div className="text-md font-bold">{value}</div>
    </div>
  </div>
);

export default MatchStatsSummary;