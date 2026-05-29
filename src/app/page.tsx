import { SearchComponent } from "@/components/SearchComponent";
import { api } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";

interface Player {
  id: string;
  nickname: string;
}

export const revalidate = 3600;

async function getPlayers() {
  try {
    const response = await api.get<{ data: { players: Player[] } }>("/api/players");
    return response.data.data.players;
  } catch {
    return [];
  }
}

export default async function Home() {
  const players = await getPlayers();

  return (
    <section
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* operators key art */}
      <div
        style={{
          position: "absolute",
          inset: "-8% -6%",
          zIndex: 0,
          backgroundImage: "url(/bg-operators.jpg)",
          backgroundPosition: "center right",
          backgroundSize: "cover",
          transform: "scale(1.12)",
          filter: "brightness(1.1) contrast(1.05)",
        }}
      />
      {/* left protection gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          background:
            "linear-gradient(90deg,#0a0a0a 20%,rgba(10,10,10,.78) 45%,rgba(10,10,10,.15) 70%,transparent 100%)",
        }}
      />
      {/* bottom fade */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          background: "linear-gradient(0deg,#0a0a0a 0%,transparent 30%)",
        }}
      />

      {/* watermark */}
      <div
        className="watermark"
        style={{ right: "2vw", top: "8vh", fontSize: "22vw", zIndex: 1 }}
      >
        UL
      </div>

      {/* content */}
      <div className="cs-container" style={{ zIndex: 2, paddingTop: 120, paddingBottom: 80 }}>
        {/* system tag */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <span className="cap">// SYSTEM_LOG</span>
          <div className="hr-cs" style={{ width: 64 }} />
          <span className="cap cap--meta">DATA_EXTRACT // PLAYERS_STAT</span>
        </div>

        {/* heading */}
        <div style={{ marginBottom: 48 }}>
          <h1 className="h1" style={{ marginBottom: 8 }}>
            Top_<span className="ghost">Performers</span>
          </h1>
          <h1 className="h1">
            <span className="ghost">[ </span>ULMIX<span className="ghost"> ]</span>
          </h1>
        </div>

        {/* search */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ marginBottom: 10 }}>
            <span className="cap cap--xs" style={{ color: "var(--zinc-700)" }}>
              SEARCH_PLAYER // {players.length}_ENTRIES
            </span>
          </div>
          {players.length > 0
            ? <SearchComponent allPlayers={players} />
            : (
              <div
                style={{
                  border: "1px dashed var(--zinc-800)",
                  padding: "24px 32px",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--zinc-700)",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}
              >
                NO_DATA_FOR_TOURNAMENT
              </div>
            )
          }
        </div>

        {/* CTA */}
        <Link
          href="/matches"
          className="btn-cs"
          style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}
        >
          <span className="lbl">Player_Standings →</span>
          <span className="fill" />
        </Link>
      </div>
    </section>
  );
}
