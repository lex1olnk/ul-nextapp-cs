// CS2 Parser Stats — HOME view (hero + match list)
function HomeView({ go }) {
  const { TOURNAMENTS, MATCHES } = window.CS2DATA;
  const [tid, setTid] = React.useState("major");
  const t = TOURNAMENTS.find(x => x.id === tid);

  return (
    <div>
      {/* HERO */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", paddingTop: 120 }}>
        <Watermark style={{ bottom: "-4vw", right: "-1vw", fontSize: "26vw" }}>CS2</Watermark>
        <div className="container">
          <Fade>
            <div className="tagrow" style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
              <Cap>DATA_EXTRACT // DEMO_PARSER_v2</Cap>
              <div className="hr" style={{ flex: 1, maxWidth: 240 }}></div>
            </div>
            <h1 className="h1" style={{ marginBottom: 28 }}>
              Tournament<br /><span className="ghost">Control_Panel</span>
            </h1>
          </Fade>

          <Fade delay={120}>
            <Cap className="cap--xs" style={{ display: "block", marginBottom: 12 }}>// SELECT_EVENT</Cap>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 36 }}>
              {TOURNAMENTS.map(x => (
                <Choice key={x.id} active={x.id === tid} onClick={() => setTid(x.id)}>{x.name}</Choice>
              ))}
            </div>
          </Fade>

          {/* event details panel */}
          <Fade delay={200}>
            <div className="card card--faint ticks" style={{ maxWidth: 520, padding: 24, backdropFilter: "blur(4px)" }}>
              <h3 className="cap" style={{ color: "var(--zinc500)", letterSpacing: ".3em", marginBottom: 16 }}>Event_Details</h3>
              <div style={{ fontFamily: "var(--mono)", fontSize: 12 }}>
                {[["EVENT", t.full], ["STATUS", null], ["FORMAT", t.maps], ["NODE", t.node]].map(([k, v], i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--zinc900)", padding: "9px 0" }}>
                    <span style={{ color: "var(--zinc600)" }}>{k}:</span>
                    {k === "STATUS" ? <Status state={t.status} /> : <span>{v}</span>}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 18 }}>
                <Button onClick={() => go("leaderboard")}>View_Players →</Button>
              </div>
            </div>
          </Fade>
        </div>
      </section>

      {/* MATCH LIST */}
      <section style={{ position: "relative", padding: "80px 0 120px" }}>
        <Watermark style={{ top: "-3vw", left: "-1vw", fontSize: "16vw" }}>LIVE</Watermark>
        <div className="container">
          <header className="pagehead" style={{ marginBottom: 48 }}>
            <div className="tagrow"><Cap>// SYSTEM_LOG // MATCH_ENTRIES</Cap><div className="hr"></div></div>
            <SplitTitle text="History.exe" className="h2" />
          </header>
          <div className="grid12">
            <div style={{ gridColumn: "span 12", display: "flex", flexDirection: "column", gap: 8 }}>
              {MATCHES.map((m, i) => (
                <Fade key={m.id} kind="slidein" delay={i * 80}>
                  <MatchRow m={m} onClick={() => go("matches")} />
                </Fade>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function MatchRow({ m, onClick }) {
  return (
    <div className="card invert" style={{ padding: "18px 22px", display: "grid", gridTemplateColumns: "120px 1fr auto 130px", gap: 18, alignItems: "center" }} onClick={onClick}>
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
  );
}
window.HomeView = HomeView;
