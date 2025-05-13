import { StatsChart } from "@/components/player/Chart";
import MatchStatsSummary from "@/components/player/FaceitStats";
import { MoreInformations } from "@/components/player/MoreInformations";
import { PlayerInfoSection } from "@/components/player/PlayerInfo";
import { PlayerStatsSection } from "@/components/player/PlayerStatsSection";
import { RatingStatisticsSection } from "@/components/player/RatingStatisticsSection";
import WindroseChart from "@/components/player/WindRose";
import api from "@/lib/api";
import axios from "axios";
import Image from "next/image";

async function getPlayerData(id: string) {
  try {
    const response = await api.get(`/api/player/${id}`);
    return response.data.data;
  } catch (error) {
    console.error("API Error:", error);
    return []; // Возвращаем пустые данные вместо исключения
  }
}

async function getFaceitData(nickname: string) {
  if (!nickname) {
    return {}
  }

  try {
    const response = await axios.get(`https://open.faceit.com/data/v4/players?nickname=${nickname}`, {
      headers: {
        Authorization: `Bearer ${process.env.FACEIT_CLIENT_ID}`,
        'Accept-Encoding': 'application/json',
      },
    });

    return response.data
  } catch (error) {
    console.error("API Error:", error);
    return {}
  }
}

async function getFaceitPlayerStats(id: string) {
  if (!id) {
    return {}
  }

  try {
    const response = await axios.get(`https://open.faceit.com/data/v4/players/${id}/games/cs2/stats`, {
      headers: {
        Authorization: `Bearer ${process.env.FACEIT_CLIENT_ID}`,
        'Accept-Encoding': 'application/json',
      },
    });

    return response.data
  } catch (error) {
    console.error("API Error:", error);
    return {}
  }
}

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getPlayerData(id);
  const faceit = await getFaceitData(data.player_stats.faceit);
  const stats = await getFaceitPlayerStats(faceit.player_id)
  console.log(stats)
  //const { firstKills, firstDeaths,  }

  if (!data) {
    return (
      <div className=" bg-[--light-dark] text-gray-100 min-h-screen p-8 flex items-center justify-center">
        <p>Данные игрока не найдены</p>
      </div>
    );
  }
  
  return (
    <div className="h-screen flex flex-col max-w-[1080px] mx-auto pt-4">
      <div className="flex lg:flex-row md:flex-col sm:flex-col justify-between">
        <div className="flex flex-col max-w-[717px]">
          <PlayerInfoSection
            nickname={data?.player_stats.nickname}
            userId={data?.player_stats.playerID}
            src={data?.player_stats.img}
          />
          <div className="relative">
            <PlayerStatsSection playerStats={data.player_stats} />
          </div>
        </div>
        <WindroseChart maps={data?.maps_stats} />
      </div>

      <MoreInformations 
        player={data?.player_stats}
      />
      <div className="relative">
        <RatingStatisticsSection matches={data.recent_matches} />
        <Image
          className="absolute top-4 left-5"
          width={1044}
          height={34}
          alt="Vector"
          src="https://c.animaapp.com/m9uwos437IZJ3W/img/vector-2.svg"
        />
        <div className="absolute w-5 h-5 top-6 left-[1037px] rounded-sm border border-solid border-white" />
        <div className="absolute top-[25px] left-[955px] font-normal text-white text-sm">
          match_stats
        </div>
      </div>
      
      {stats && <MatchStatsSummary
        items={stats.items}
        faceit={faceit} 
      />}
      {stats && <StatsChart items={stats.items}/>}
      
    </div>
  );
}
