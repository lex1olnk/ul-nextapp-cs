import Image from "next/image";
import PlayersTable from "@/components/matches/PlayersTable";
import { getTournaments } from "../upload/api";
import { getMatches } from "./api";

export default async function PlayersStatsPage() {
  const players     = await getMatches();
  const tournaments = await getTournaments();

  if (players.length > 0) {
    players.forEach(p => {
      p.headshots = (p.headshots / p.kills) * 100;
      p.kast      = (p.kast / p.rounds) * 100;
    });
    players.sort((a, b) => b.rating - a.rating);
  }

  return (
    <section style={{ position: "relative", minHeight: "100vh", paddingTop: 80 }}>
      {/* watermark */}
      <div
        className="watermark"
        style={{ bottom: "-2vw", right: "-1vw", fontSize: "20vw" }}
      >
        RANK
      </div>

      {/* header shares the table's wide container so their left edges line up */}
      <div style={{ maxWidth: 1600, margin: "0 auto", padding: "0 48px" }}>
        <header className="pagehead">
          <div className="tagrow">
            <Image src="/logo.png" alt="UL" width={28} height={28} style={{ display: "block" }} />
            <span className="cap">DATA_EXTRACT // PLAYERS_STAT</span>
            <div className="hr-line" />
          </div>
          <h1 className="h1">
            UL_<span className="ghost">STATS</span>
          </h1>
        </header>
      </div>

      {/* table lives outside .cs-container so its wider container can breathe */}
      {players.length > 0 && tournaments ? (
        <PlayersTable players={players} ulTournaments={tournaments} />
      ) : (
        <div style={{ maxWidth: 1600, margin: "0 auto", padding: "0 48px" }}>
          <div
            style={{
              border: "1px dashed var(--zinc-800)",
              padding: "48px",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--zinc-700)",
              textAlign: "center",
            }}
          >
            NO_DATA_FOR_TOURNAMENT
          </div>
        </div>
      )}
    </section>
  );
}
