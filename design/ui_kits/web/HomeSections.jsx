// CS2 Parser Stats — full homepage: teams, players preview, matches, cinematic, footer
function SectionHead({ tag, title }) {
  return (
    <header className="pagehead" style={{ marginBottom: 44 }}>
      <div className="tagrow"><Cap>{tag}</Cap><div className="hr"></div></div>
      <SplitTitle text={title} className="h2" />
    </header>
  );
}

function TeamDraft() {
  const { TEAMS } = window.CS2DATA;
  return (
    <section id="teams" style={{ position: "relative", padding: "96px 0" }}>
      <Watermark style={{ top: "-2vw", right: "-1vw", fontSize: "18vw" }}>SEEDS</Watermark>
      <div className="container">
        <SectionHead tag="// SYSTEM_LOG // TEAM_ENTITY" title="Team_Assembly" />
        <div className="teamgrid">
          {TEAMS.map((tm, i) => (
            <Fade key={tm.id} delay={i * 60}>
              <div className="card invert teamcard">
                <span className="wipe"></span>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span className="num ghost" style={{ fontSize: 28 }}>{String(tm.seed).padStart(2, "0")}</span>
                  <span className="cap cap--xs sub">{tm.region}</span>
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 900, fontStyle: "italic", letterSpacing: "-.04em", textTransform: "uppercase" }}>{tm.name}</div>
                  <div className="sub" style={{ fontFamily: "var(--mono)", fontSize: 10, marginTop: 6, display: "flex", justifyContent: "space-between" }}>
                    <span>RTG {tm.rating.toFixed(2)}</span><span>WIN {Math.round(tm.win * 100)}%</span>
                  </div>
                  <div className="bar-track" style={{ marginTop: 6 }}><div className="bar-fill" style={{ width: (tm.win * 100) + "%" }}></div></div>
                </div>
              </div>
            </Fade>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlayersPreview() {
  const { PLAYERS } = window.CS2DATA;
  const top = PLAYERS.slice(0, 5);
  const max = Math.max(...PLAYERS.map(p => p.rating));
  return (
    <section id="players" style={{ position: "relative", padding: "96px 0", borderTop: "1px solid var(--zinc900)" }}>
      <Watermark style={{ bottom: "-2vw", left: "-1vw", fontSize: "20vw" }}>RANK</Watermark>
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
          <SectionHead tag="DATA_EXTRACT // PLAYERS_STAT" title="Top_Performers" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "56px 1fr 90px 90px 150px", gap: 16, padding: "0 18px 12px" }}>
          {["#", "Player", "ADR", "KAST", "Rating"].map((h, i) => <span key={i} className="cap cap--xs" style={{ textAlign: i > 1 ? "right" : "left" }}>{h}</span>)}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {top.map((p, i) => (
            <Fade key={p.id} kind="slidein" delay={i * 70}>
              <div className="card invert" style={{ display: "grid", gridTemplateColumns: "56px 1fr 90px 90px 150px", gap: 16, alignItems: "center", padding: "14px 18px", background: "#000" }}>
                <span className="wipe"></span>
                <span className="num ghost" style={{ fontSize: 24 }}>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 17, fontWeight: 700, textTransform: "uppercase", letterSpacing: "-.02em" }}>{p.name}</span>
                    <img className="rankbadge rankbadge--sm" src={"assets/rank" + (5 - i) + ".svg"} alt={"TIER " + (5 - i)} />
                  </div>
                  <div className="cap cap--xs sub" style={{ marginTop: 3 }}>{p.team}</div>
                </div>
                <span className="sub" style={{ fontFamily: "var(--mono)", fontSize: 13, textAlign: "right" }}>{p.adr}</span>
                <span className="sub" style={{ fontFamily: "var(--mono)", fontSize: 13, textAlign: "right" }}>{p.kast}</span>
                <div>
                  <div className="num" style={{ fontSize: 20, textAlign: "right" }}>{p.rating.toFixed(2)}</div>
                  <ProgressBar value={p.rating} max={max} />
                </div>
              </div>
            </Fade>
          ))}
        </div>
        <div style={{ marginTop: 24 }}><Button>View_Full_Leaderboard →</Button></div>
      </div>
    </section>
  );
}

function MatchFeed() {
  const { MATCHES } = window.CS2DATA;
  return (
    <section id="matches" style={{ position: "relative", padding: "96px 0", borderTop: "1px solid var(--zinc900)" }}>
      <Watermark style={{ top: "-3vw", right: "-1vw", fontSize: "16vw" }}>LIVE</Watermark>
      <div className="container">
        <SectionHead tag="// SYSTEM_LOG // MATCH_ENTRIES" title="History.exe" />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {MATCHES.map((m, i) => (
            <Fade key={m.id} kind="slidein" delay={i * 70}>
              <div className="card invert" style={{ padding: "18px 22px", display: "grid", gridTemplateColumns: "120px 1fr auto 120px", gap: 18, alignItems: "center" }}>
                <span className="wipe"></span>
                <span className="cap cap--xs sub">{m.map}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 20, fontWeight: 700, textTransform: "uppercase", letterSpacing: "-.02em" }}>
                  <span style={{ minWidth: 110 }}>{m.a}</span>
                  <span className="num" style={{ fontSize: 24 }}>{m.sa}</span>
                  <span className="sub" style={{ fontSize: 12 }}>:</span>
                  <span className="num" style={{ fontSize: 24 }}>{m.sb}</span>
                  <span style={{ minWidth: 110 }}>{m.b}</span>
                </div>
                <Status state={m.status} />
                <span className="cap cap--xs sub" style={{ textAlign: "right" }}>{m.time}</span>
              </div>
            </Fade>
          ))}
        </div>
      </div>
    </section>
  );
}

function Cinematic() {
  return (
    <section style={{ padding: "40px 0 96px" }}>
      <div className="container">
        <Fade>
          <div className="cinematic">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>
              <div>
                <Cap className="cap--xs" style={{ display: "block", marginBottom: 18 }}>// DATA_EXTRACT // CORE</Cap>
                <div className="num" style={{ fontSize: "clamp(56px,9vw,128px)", lineHeight: .9 }}>0x1A3F2B</div>
                <p className="mono" style={{ fontFamily: "var(--mono)", color: "var(--zinc500)", fontSize: 12, marginTop: 20, maxWidth: 480, lineHeight: 1.7 }}>
                  [ ENGINE ]: demo bytes → structured events. Every kill, flash, smoke &amp; economy state, indexed and queryable.
                </p>
                <div className="zebra" style={{ marginTop: 28, maxWidth: 320 }}></div>
              </div>
              <div className="crosses" style={{ fontSize: 26 }}>{Array.from({ length: 6 }).map((_, i) => <span key={i}>✕</span>)}</div>
            </div>
          </div>
        </Fade>
      </div>
    </section>
  );
}

function Footer() {
  const cols = [
    { h: "// PRODUCT", links: ["Parser", "Leaderboards", "Match_Center", "API_Access"] },
    { h: "// EVENTS", links: ["Majors", "BLAST", "IEM", "Archive"] },
    { h: "// SYSTEM", links: ["Status", "Changelog", "Docs", "0x_Nodes"] },
  ];
  return (
    <footer className="footer">
      <Watermark style={{ bottom: "-3vw", left: "-1vw", fontSize: "20vw" }}>CS2</Watermark>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <span className="logo-lockup">
              <img className="logo-mark" src="assets/logo.png" alt="UL" />
              <span className="brand" style={{ fontSize: 22 }}>CS2_<span className="ghost">PARSER</span></span>
            </span>
            <p className="mono" style={{ fontFamily: "var(--mono)", color: "var(--zinc600)", fontSize: 11, marginTop: 14, lineHeight: 1.7, maxWidth: 260 }}>
              Demo parsing &amp; tournament statistics.<br />NET_LINK_ESTABLISHED // NODE_01
            </p>
            <div style={{ marginTop: 18 }}><Status state="ONGOING" /></div>
          </div>
          {cols.map((c, i) => (
            <div key={i} className="footer-col">
              <h4>{c.h}</h4>
              {c.links.map((l, j) => <a key={j} href="#">{l}</a>)}
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span>© 2026 CS2_PARSER // ALL_NODES_RESERVED</span>
          <span>BUILD 0x77C0E1 // v2.1</span>
        </div>
      </div>
    </footer>
  );
}

function HomePage() {
  return (
    <div className="app">
      <div className="dotgrid"></div>
      <TopBar />
      <HeroFull />
      <StatBand />
      <TeamDraft />
      <PlayersPreview />
      <MatchFeed />
      <Cinematic />
      <Footer />
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<HomePage />);
