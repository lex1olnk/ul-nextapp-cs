// CS2 Parser Stats — LEADERBOARD view (tournament/players)
function LeaderboardView({ go }) {
  const { PLAYERS } = window.CS2DATA;
  const maxRating = Math.max(...PLAYERS.map(p => p.rating));
  return (
    <section style={{ position: "relative", paddingTop: 130, paddingBottom: 120, minHeight: "100vh" }}>
      <Watermark style={{ bottom: "-2vw", right: "-1vw", fontSize: "20vw" }}>RANK</Watermark>
      <div className="container">
        <header className="pagehead">
          <div className="tagrow"><Cap>DATA_EXTRACT // PLAYERS_STAT</Cap><div className="hr"></div></div>
          <h1 className="h1">Top_Performers <span className="ghost">[ MAJOR ]</span></h1>
        </header>

        {/* table head */}
        <div style={{ display: "grid", gridTemplateColumns: "56px 1fr 90px 90px 90px 150px", gap: 16, padding: "0 18px 12px" }}>
          {["#", "Player", "ADR", "KAST", "HS%", "Rating"].map((h, i) => (
            <span key={i} className="cap cap--xs" style={{ textAlign: i > 1 ? "right" : "left" }}>{h}</span>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {PLAYERS.map((p, i) => (
            <Fade key={p.id} kind="slidein" delay={i * 70}>
              <div className="card invert" style={{ display: "grid", gridTemplateColumns: "56px 1fr 90px 90px 90px 150px", gap: 16, alignItems: "center", padding: "14px 18px", background: "#000" }}
                onClick={() => go("player", p.id)}>
                <span className="wipe"></span>
                <span className="num ghost" style={{ fontSize: 24 }}>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, textTransform: "uppercase", letterSpacing: "-.02em" }}>{p.name}</div>
                  <div className="cap cap--xs sub" style={{ marginTop: 3 }}>{p.team}</div>
                </div>
                <span className="mono sub" style={{ fontFamily: "var(--mono)", fontSize: 13, textAlign: "right" }}>{p.adr}</span>
                <span className="mono sub" style={{ fontFamily: "var(--mono)", fontSize: 13, textAlign: "right" }}>{p.kast}</span>
                <span className="mono sub" style={{ fontFamily: "var(--mono)", fontSize: 13, textAlign: "right" }}>{p.hs}</span>
                <div>
                  <div className="num" style={{ fontSize: 20, textAlign: "right" }}>{p.rating.toFixed(2)}</div>
                  <ProgressBar value={p.rating} max={maxRating} />
                </div>
              </div>
            </Fade>
          ))}
        </div>
      </div>
    </section>
  );
}
window.LeaderboardView = LeaderboardView;
