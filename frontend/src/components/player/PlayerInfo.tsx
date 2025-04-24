export const PlayerInfoSection = () => {
    return (
        <>
        
        <div className="flex flex-col my-8">
          <div className="relative flex items-start">
            {/* Player Avatar */}
            <div className="w-[90px] h-[90px] bg-[#2b2b2b] rounded-[45px] mr-4"></div>
        
            <div className="flex flex-col">
              {/* Player Name */}
              <div className="bg-white rounded-sm p-2 mb-2 w-40">
                <span className="font-bold text-2xl text-[#191919]">
                  PlayerName
                </span>
              </div>
        
              {/* Player ID */}
              <span className="text-[#b3b3b3] text-sm">
                #136243
              </span>
            </div>
          </div>
        </div>
        </>
    )
}
