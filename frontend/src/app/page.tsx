import { SearchComponent } from "@/components/SearchComponent";
import axios from "axios";
import Image from "next/image";

interface Player {
  id: string;
  nickname: string;
}

export default async function Home() {
  const response = await axios.get<{players: Player[]}>('https://vercel-fastcup.vercel.app/api/players');
  const data = response.data.players
  return (
    <div className="grid grid-rows-[10px_1fr_20px] items-center justify-items-center p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="mx-auto"
          src="/ul2.png"
          alt="ul logo"
          width={180}
          height={180}
          priority
        />
        <SearchComponent allPlayers={data}/>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
      </footer>
    </div>
  );
}
