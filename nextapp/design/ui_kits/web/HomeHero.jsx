// CS2 Parser Stats — full homepage: header + hero + stat band
function TopBar() {
  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <span className="logo-lockup">
          <img className="logo-mark" src="assets/logo.png" alt="UL" />
          <span className="brand">CS2_<span className="ghost">PARSER</span></span>
        </span>
        <nav className="topnav">
          <a href="#events">Events</a>
          <a href="#teams">Teams</a>
          <a href="#players">Players</a>
          <a href="#matches">Matches</a>
        </nav>
        <span className="cap cap--xs" style={{ color: "var(--zinc600)" }}>NET_LINK_ESTABLISHED // NODE_01</span>
      </div>
    </header>
  );
}

function HeroFull() {
  const { TOURNAMENTS } = window.CS2DATA;
  const [tid, setTid] = React.useState("major");
  const t = TOURNAMENTS.find(x => x.id === tid);
  return (
    <section id="events" className="hero" style={{ position: "relative", paddingTop: 72, paddingBottom: 96, overflow: "hidden" }}>
      <div className="hero-bg"></div>
      <div className="hero-protect"></div>
      <div className="hero-protect-b"></div>
      <Watermark style={{ bottom: "-5vw", right: "-2vw", fontSize: "28vw" }}>CS2</Watermark>
      <div className="crosses">{Array.from({ length: 7 }).map((_, i) => <span key={i}>✕</span>)}</div>
      <div className="container" style={{ minHeight: "78vh", display: "flex", alignItems: "center" }}>
        <div style={{ maxWidth: 620 }}>
          <Fade>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
              <Cap>DATA_EXTRACT // DEMO_PARSER_v2</Cap>
              <div className="hr" style={{ flex: 1, maxWidth: 200 }}></div>
            </div>
            <h1 className="h1" style={{ marginBottom: 26 }}>Tournament<br /><span className="ghost">Control_Panel</span></h1>
            <p className="mono" style={{ fontFamily: "var(--mono)", color: "var(--zinc500)", fontSize: 12, letterSpacing: ".05em", maxWidth: 440, lineHeight: 1.7, marginBottom: 32 }}>
              [ PARSE ]: server demos → ratings, KAST, ADR, clutch &amp; utility.<br />[ TRACK ]: every map, every duel, every round.
            </p>
          </Fade>
          <Fade delay={120}>
            <Cap className="cap--xs" style={{ display: "block", marginBottom: 12 }}>// SELECT_EVENT</Cap>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 30 }}>
              {TOURNAMENTS.map(x => <Choice key={x.id} active={x.id === tid} onClick={() => setTid(x.id)}>{x.name}</Choice>)}
            </div>
          </Fade>
          <Fade delay={200}>
            <div className="card card--faint ticks" style={{ maxWidth: 460, padding: 22, backdropFilter: "blur(4px)" }}>
              <h3 className="cap" style={{ color: "var(--zinc500)", letterSpacing: ".3em", marginBottom: 14 }}>Event_Details</h3>
              <div style={{ fontFamily: "var(--mono)", fontSize: 12 }}>
                {[["EVENT", t.full], ["STATUS", null], ["FORMAT", t.maps], ["NODE", t.node]].map(([k, v], i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--zinc900)", padding: "8px 0" }}>
                    <span style={{ color: "var(--zinc600)" }}>{k}:</span>
                    {k === "STATUS" ? <Status state={t.status} /> : <span>{v}</span>}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16 }}><a href="#players" style={{ textDecoration: "none" }}><Button>View_Players →</Button></a></div>
            </div>
          </Fade>
        </div>
      </div>
    </section>
  );
}

function StatBand() {
  const stats = [
    { v: "1.2M", k: "// DEMOS_PARSED" },
    { v: "84K", k: "// PLAYERS_TRACKED" },
    { v: "312K", k: "// MAPS_ANALYZED" },
    { v: "0.1s", k: "// PARSE_LATENCY" },
  ];
  return (
    <div className="statband">
      <div className="container statband-inner">
        {stats.map((s, i) => (
          <Fade key={i} delay={i * 80} className="statcell">
            <div className="v">{s.v}</div>
            <Cap className="cap--xs" style={{ display: "block", marginTop: 10 }}>{s.k}</Cap>
          </Fade>
        ))}
      </div>
    </div>
  );
}
window.TopBar = TopBar; window.HeroFull = HeroFull; window.StatBand = StatBand;
