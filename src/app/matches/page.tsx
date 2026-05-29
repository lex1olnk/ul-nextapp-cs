import PlayersTable from "@/components/matches/PlayersTable";
import { getTournaments } from "../upload/api";
import { getMatches } from "./api";

export const revalidate = 3600;

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

      <div className="cs-container">
        {/* page header */}
        <header className="pagehead">
          <div className="tagrow">
            <span className="cap">DATA_EXTRACT // PLAYERS_STAT</span>
            <div className="hr-line" />
          </div>
          <h1 className="h1">
            Top_<span className="ghost">Performers</span>
          </h1>
        </header>

        {players.length > 0 && tournaments ? (
          <PlayersTable players={players} ulTournaments={tournaments} />
        ) : (
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
        )}
      </div>
    </section>
  );
}
