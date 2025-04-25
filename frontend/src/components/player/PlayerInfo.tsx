export const PlayerInfoSection = ({ nickname, userId }: { nickname: string, userId: number }) => {
    return (
        <>
        
        <div className="flex flex-col my-8">
          <div className="relative flex items-start">
            {/* Player Avatar */}
            <div className="w-[90px] h-[90px] bg-[#2b2b2b] rounded-[45px] mr-4"></div>
        
            <div className="flex flex-col my-auto">
              {/* Player Name */}
              <div className="bg-white rounded-sm py-1 px-4 mb-2">
                <span className="font-bold text-2xl text-[#191919]">
                  {nickname}
                </span>
              </div>
        
              {/* Player ID */}
              <span className="text-[#b3b3b3] text-sm">
                #{userId}
              </span>
            </div>
          </div>
        </div>
        </>
    )
}
