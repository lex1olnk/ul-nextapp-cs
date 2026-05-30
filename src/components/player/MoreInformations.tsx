export const MoreInformations = ({
  player: { firstKills, firstDeaths, flashes, exchanged, nades, maps, clutches },
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
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10 }}>
        <span className="cap cap--xs">// ADVANCED_STATS</span>
        <div className="hr-cs" style={{ flex: 1 }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(12,1fr)", gap: 8 }}>
        {/* left block — misc stats */}
        <div style={{ gridColumn: "span 7", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {[
            { cap: "FIRST_KILLS",    val: firstKills },
            { cap: "FIRST_DEATHS",   val: firstDeaths },
            { cap: "FLASH_KILLS",    val: flashes },
            { cap: "TRADE_KILLS",    val: exchanged },
            { cap: "GRENADE_DMG",    val: nades },
            { cap: "MAPS_PLAYED",    val: maps },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: "16px 20px" }}>
              <span className="cap cap--xs" style={{ display: "block", marginBottom: 8 }}>{s.cap}</span>
              <div className="num" style={{ fontSize: 28 }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* right block — clutches */}
        <div className="card ticks" style={{ gridColumn: "span 5", padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span className="cap cap--xs">// CLUTCH_1vX</span>
            <span className="cap cap--xs" style={{ color: "var(--zinc-600)" }}>TOTAL {clutchTotal}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {clutchItems.map((c, i) => {
              const pct = clutchTotal > 0 ? (Number(c.v) / clutchTotal) * 100 : 0;
              return (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "32px 1fr 28px", alignItems: "center", gap: 10 }}>
                  <span className="cap cap--xs" style={{ color: "var(--zinc-500)" }}>{c.k}</span>
                  <div style={{ height: 4, background: "var(--zinc-900)", overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: pct + "%",
                      background: i === 0 ? "#fff" : i === 1 ? "var(--zinc-400)" : i === 2 ? "var(--zinc-600)" : "var(--zinc-700)",
                      transition: "width 1s cubic-bezier(0,.6,.3,1)",
                    }} />
                  </div>
                  <div className="num" style={{ fontSize: 16, textAlign: "right" }}>{c.v}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
