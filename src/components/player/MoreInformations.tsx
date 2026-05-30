import WindroseChart from "./WindRose";
import { MapStat } from "@/types/types";

/* Объединённая секция: Map Winrate (радар) + Clutch 1vX в одном блоке. */
export const MoreInformations = ({
  player: { clutches },
  maps,
}: {
  player: {
    firstKills: string;
    firstDeaths: string;
    flashes: number;
    exchanged: number;
    nades: number;
    maps: number;
    clutches: number[];
  };
  maps: MapStat[];
}) => {
  const clutchTotal = Object.values(clutches || {}).reduce((a: number, b) => a + Number(b), 0);
  const clutchItems = [
    { k: "1v1", v: clutches?.["1v1"] ?? 0 },
    { k: "1v2", v: clutches?.["1v2"] ?? 0 },
    { k: "1v3", v: clutches?.["1v3"] ?? 0 },
    { k: "1v4", v: clutches?.["1v4"] ?? 0 },
    { k: "1v5", v: clutches?.["1v5"] ?? 0 },
  ];

  return (
    <div style={{ marginBottom: 48 }}>
      {/* section header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10 }}>
        <span className="cap cap--xs">// MAP_WINRATE &amp; CLUTCH</span>
        <div className="zebra" style={{ flex: 1 }} />
      </div>

      <div style={{ display: "flex", border: "1px solid var(--zinc-900)", flexWrap: "wrap" }}>
        {/* left — map winrate radar */}
        <div style={{ flex: "1 1 320px", minWidth: 280, padding: 24, borderRight: "1px solid var(--zinc-900)" }}>
          <span className="cap cap--xs" style={{ display: "block", marginBottom: 16 }}>// MAP_WINRATE</span>
          <WindroseChart maps={maps} />
        </div>

        {/* right — clutch 1vX */}
        <div style={{ flex: "1 1 320px", minWidth: 280, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <span className="cap cap--xs">// CLUTCH_1vX</span>
            <span className="cap cap--xs" style={{ color: "var(--zinc-600)" }}>TOTAL {clutchTotal}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {clutchItems.map((c, i) => {
              const pct = clutchTotal > 0 ? (Number(c.v) / clutchTotal) * 100 : 0;
              return (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "36px 1fr 32px", alignItems: "center", gap: 12 }}>
                  <span className="cap cap--xs" style={{ color: "var(--zinc-500)" }}>{c.k}</span>
                  <div style={{ height: 4, background: "var(--zinc-900)", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: pct + "%",
                        background: i === 0 ? "#fff" : i === 1 ? "var(--zinc-400)" : i === 2 ? "var(--zinc-600)" : "var(--zinc-700)",
                        transition: "width 1s cubic-bezier(0,.6,.3,1)",
                      }}
                    />
                  </div>
                  <div className="num" style={{ fontSize: 18, textAlign: "right" }}>{c.v}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
