// CS2 Parser Stats — PLAYER card view
function PlayerView({ go, playerId }) {
  const { PLAYERS } = window.CS2DATA;
  const p = PLAYERS.find(x => x.id === playerId) || PLAYERS[0];
  const clutchTotal = p.clutchW + p.clutchL;
  const stats = [
    { cap: "// ADR", val: p.adr.toFixed(1), det: ["AVG", "71.0"], top: p.top },
    { cap: "// KAST", val: p.kast + "%", det: ["AVG", "70%"], top: null },
    { cap: "// HEADSHOT", val: p.hs + "%", det: ["AVG", "44%"], top: null },
    { cap: "// RATING_2.1", val: p.rating.toFixed(2), det: ["PEAK", (p.rating + 0.4).toFixed(2)], top: p.top },
  ];
  return (
    <section style={{ position: "relative", paddingTop: 130, paddingBottom: 120, minHeight: "100vh" }}>
      <Watermark style={{ top: "8vh", right: "-2vw", fontSize: "24vw" }}>{p.name.slice(0, 4)}</Watermark>
      <div className="container">
        <button className="btn" style={{ marginBottom: 40 }} onClick={() => go("leaderboard")}>
          <span className="lbl">← Back</span><span className="fill"></span>
        </button>

        {/* player header card */}
        <Fade>
          <div className="card ticks" style={{ padding: 40, marginBottom: 48, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24 }}>
            <div>
              <Cap className="cap--xs" style={{ display: "block", marginBottom: 14 }}>// PLAYER_PROFILE</Cap>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <Chip>{p.team}</Chip><Badge>TOP {p.top}</Badge>
              </div>
              <h1 className="h1" style={{ fontSize: "clamp(48px,7vw,88px)" }}>{p.name}</h1>
            </div>
            <div style={{ textAlign: "right" }}>
              <Cap className="cap--xs" style={{ display: "block", marginBottom: 6 }}>RATING_2.1</Cap>
              <div className="num" style={{ fontSize: 64, lineHeight: 1 }}>{p.rating.toFixed(2)}</div>
            </div>
          </div>
        </Fade>

        {/* stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 16 }}>
          {stats.map((s, i) => (
            <Fade key={i} delay={i * 90}>
              <div className="card" style={{ padding: 20, position: "relative", minHeight: 150 }}>
                {s.top && <span className="badge" style={{ position: "absolute", top: 16, right: 16 }}>TOP {s.top}</span>}
                <Cap className="cap--xs">{s.cap}</Cap>
                <div className="num" style={{ fontSize: 40, marginTop: 16 }}>{s.val}</div>
                <div style={{ borderTop: "1px solid var(--zinc900)", marginTop: 18, paddingTop: 10, fontFamily: "var(--mono)", fontSize: 10, color: "var(--zinc500)", display: "flex", justifyContent: "space-between" }}>
                  <span>{s.det[0]}</span><span>{s.det[1]}</span>
                </div>
              </div>
            </Fade>
          ))}
        </div>

        {/* clutch + entry gauge row */}
        <div className="grid12" style={{ alignItems: "stretch" }}>
          <Fade delay={120} className="grid12-cell" style={{ gridColumn: "span 8" }}>
            <div className="card" style={{ padding: 24, height: "100%" }}>
              <Cap className="cap--xs" style={{ display: "block", marginBottom: 16 }}>// CLUTCH_1vX</Cap>
              <div style={{ display: "flex", height: 44, border: "1px solid var(--zinc900)" }}>
                <div style={{ width: (p.clutchW / clutchTotal * 100) + "%", background: "#fff", color: "#000", display: "flex", alignItems: "center", padding: "0 14px", fontWeight: 900, fontStyle: "italic", fontSize: 15 }}>{`WON ${p.clutchW}`}</div>
                <div style={{ flex: 1, background: "var(--zinc900)", color: "var(--zinc500)", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 14px", fontWeight: 900, fontStyle: "italic", fontSize: 15 }}>{`${p.clutchL} LOST`}</div>
              </div>
              <div style={{ marginTop: 18 }}>
                <Cap className="cap--xs" style={{ display: "block", marginBottom: 8 }}>// OPENING_DUELS</Cap>
                <ProgressBar value={p.entry} accent="var(--orange)" />
              </div>
            </div>
          </Fade>
          <Fade delay={200} style={{ gridColumn: "span 4" }}>
            <div className="card" style={{ padding: 24, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <Cap className="cap--xs" style={{ alignSelf: "flex-start" }}>// ENTRY_SUCCESS</Cap>
              <div style={{ flex: 1, display: "flex", alignItems: "center" }}><Gauge value={p.entry} /></div>
            </div>
          </Fade>
        </div>
      </div>
    </section>
  );
}
window.PlayerView = PlayerView;
