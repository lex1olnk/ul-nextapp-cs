import { Card, CardContent } from '@/components/player/Card';
import { PlayerInfoSection } from '@/components/player/PlayerInfo';
import { PlayerStatsSection } from '@/components/player/PlayerStatsSection';
import { RatingStatisticsSection } from '@/components/player/RatingStatisticsSection';
import WindroseChart from '@/components/player/WindRose';
import { PlayerData } from '@/types/types';
import axios from 'axios';
import Image from 'next/image';

async function getPlayerData(id: string): Promise<PlayerData> {
  try {
    const response = await axios.get(`https://vercel-fastcup.vercel.app/api/player/${id}`);
    return response.data.data;
  } catch {
    throw new Error('Failed to fetch player data');
  }
}

export default async function PlayerPage({ params }: { params: Promise<{ id: string }>}) {
  const { id } = await params
  const data = await getPlayerData(id);
  console.log(data)
  if (!data) {
    return (
      <div className=" bg-[--light-dark] text-gray-100 min-h-screen p-8 flex items-center justify-center">
        <p>Данные игрока не найдены</p>
      </div>
    );
  } 

  return (
    <div className='flex flex-col max-w-[1080px] mx-auto pt-4'>
      <div className='flex lg:flex-row md:flex-col sm:flex-col justify-between'>
        <div className="flex flex-col max-w-[717px]">
          <PlayerInfoSection nickname={"user"} userId={data.player_id}/>
          <div className="relative">
              <div className="absolute w-3 h-[45px] -top-[20px] left-[24px] bg-white rounded-sm" />
              <PlayerStatsSection />
            </div>
        </div>
        <WindroseChart />
      </div>
      <div className="mt-6">
          <Card className="bg-transparent">
            <CardContent className="p-0">
              <div className="relative">
                <RatingStatisticsSection />
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
            </CardContent>
          </Card>
        </div>
    </div>
  )
}
