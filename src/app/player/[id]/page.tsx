import { StatsChart } from "@/components/player/Chart";
import MatchStatsSummary from "@/components/player/FaceitStats";
import { MoreInformations } from "@/components/player/MoreInformations";
import { PlayerStatsSection } from "@/components/player/PlayerStatsSection";
import { RatingStatisticsSection } from "@/components/player/RatingStatisticsSection";
import WindroseChart from "@/components/player/WindRose";
import { api } from "@/lib/api";
import axios from "axios";
import Image from "next/image";

export const dynamic = "force-dynamic";

async function getPlayerData(id: string) {
  try {
    const response = await api.get(`/api/player/${id}`);
    return response.data.data;
  } catch {
    return null;
  }
}

async function getFaceitData(nickname: string) {
  if (!nickname) return {};
  try {
    const response = await axios.get(`https://open.faceit.com/data/v4/players?nickname=${nickname}`, {
      headers: { Authorization: `Bearer ${process.env.FACEIT_CLIENT_ID}`, "Accept-Encoding": "application/json" },
    });
    return response.data;
  } catch {
    return {};
  }
}

async function getFaceitPlayerStats(id: string) {
  if (!id) return {};
  try {
    const response = await axios.get(`https://open.faceit.com/data/v4/players/${id}/games/cs2/stats`, {
      headers: { Authorization: `Bearer ${process.env.FACEIT_CLIENT_ID}`, "Accept-Encoding": "application/json" },
    });
    return response.data;
  } catch {
    return {};
  }
}

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getPlayerData(id);

  if (!data) {
    return (
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="card ticks" style={{ padding: "48px 64px", textAlign: "center" }}>
          <span className="cap cap--xs" style={{ display: "block", marginBottom: 16 }}>ERROR // PLAYER_NOT_FOUND</span>
          <div className="h1" style={{ fontSize: 48, color: "var(--zinc-700)" }}>404</div>
        </div>
      </section>
    );
  }

  const p = data.player_stats;
  const faceit = await getFaceitData(p.faceit);
  const stats = await getFaceitPlayerStats(faceit.player_id);

  return (
    <section style={{ minHeight: "100vh", position: "relative", paddingTop: 100, paddingBottom: 100 }}>

      {/* watermarks */}
      <div className="watermark" style={{ top: "4vh", right: "-2vw", fontSize: "22vw" }}>
        {p.nickname?.slice(0, 4)?.toUpperCase()}
      </div>
      <div className="watermark" style={{ bottom: "8vh", left: "-1vw", fontSize: "10vw", opacity: 0.5 }}>
        HIST.EXE
      </div>

      <div className="cs-container">


        {/* page header */}
        <div className="pagehead">
          <div className="tagrow">
            <span className="cap cap--xs" style={{ color: "var(--zinc-600)" }}>DATA_EXTRACT // PLAYER_PROFILE</span>
            <div style={{ height: 1, width: 96, background: "var(--zinc-800)" }} />
            <span className="cap cap--xs" style={{ color: "var(--zinc-700)" }}>NODE_{p.playerID}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <Image
              src={`https://cdn.fastcup.net/avatars/users/${p.img}`}
              alt="player avatar"
              width={90}
              height={90}
              style={{ borderRadius: 45, border: "2px solid #fff", background: "#2b2b2b", flexShrink: 0 }}
            />
            <div className="h1" style={{ fontSize: "clamp(52px,9vw,110px)" }}>
              {p.nickname}
              <span style={{ color: "var(--zinc-800)", marginLeft: 16 }}>[#{p.playerID}]</span>
            </div>
          </div>
        </div>
        {/* stats + windrose */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "start", marginBottom: 8 }}>
          <PlayerStatsSection playerStats={p} />
          <WindroseChart maps={data.maps_stats} />
        </div>

        <MoreInformations player={p} />

        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10 }}>
            <span className="cap cap--xs">// MATCH_HISTORY</span>
            <div className="hr-cs" style={{ flex: 1 }} />
          </div>
          <div className="relative">
            <RatingStatisticsSection playerId={id} ulTournaments={data.tournaments} />
          </div>
        </div>

        {stats?.items && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "32px 0 10px" }}>
              <span className="cap cap--xs">// FACEIT_STATS</span>
              <div className="hr-cs" style={{ flex: 1 }} />
            </div>
            <MatchStatsSummary items={stats.items} faceit={faceit} />
            <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "32px 0 10px" }}>
              <span className="cap cap--xs">// PERFORMANCE_CHART</span>
              <div className="hr-cs" style={{ flex: 1 }} />
            </div>
            <StatsChart items={stats.items} />
          </>
        )}

        {/* footer */}
        <div style={{
          borderTop: "1px solid var(--zinc-900)", marginTop: 64, paddingTop: 24,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span className="cap cap--xs" style={{ color: "var(--zinc-700)" }}>CS2_PARSER // PLAYER_STATS_MODULE</span>
          <span className="cap cap--xs" style={{ color: "var(--zinc-700)" }}>NET_LINK_ESTABLISHED // NODE_01</span>
        </div>

      </div>
    </section>
  );
}
