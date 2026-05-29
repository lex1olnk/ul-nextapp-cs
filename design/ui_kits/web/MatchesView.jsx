// CS2 Parser Stats — MATCHES view (content + technical sidebar)
function MatchesView({ go }) {
  const { MATCHES, TOURNAMENTS } = window.CS2DATA;
  const t = TOURNAMENTS[0];
  return (
    <section style={{ position: "relative", paddingTop: 130, paddingBottom: 120, minHeight: "100vh" }}>
      <Watermark style={{ bottom: "0", left: "-1vw", fontSize: "18vw" }}>MATCH</Watermark>
      <div className="container">
        <header className="pagehead">
          <div className="tagrow"><Cap>// SYSTEM_LOG // MATCH_ENTRIES</Cap><div className="hr"></div></div>
          <SplitTitle text="Match_Center" className="h1" />
        </header>

        <div className="grid12">
          {/* content */}
          <div style={{ gridColumn: "span 8", display: "flex", flexDirection: "column", gap: 8 }}>
            {MATCHES.map((m, i) => (
              <Fade key={m.id} kind="slidein" delay={i * 70}>
                <div className="card invert" style={{ padding: "20px 22px" }} onClick={() => go("leaderboard")}>
                  <span className="wipe"></span>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <Cap className="cap--xs sub">{m.map}</Cap><Status state={m.status} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 24, fontWeight: 700, textTransform: "uppercase", letterSpacing: "-.02em" }}>{m.a}</span>
                    <span className="num" style={{ fontSize: 28, whiteSpace: "nowrap" }}>{m.sa} <span className="sub" style={{ fontSize: 14 }}>:</span> {m.sb}</span>
                    <span style={{ fontSize: 24, fontWeight: 700, textTransform: "uppercase", letterSpacing: "-.02em" }}>{m.b}</span>
                  </div>
                </div>
              </Fade>
            ))}
            {/* empty slot */}
            <Fade kind="slidein" delay={MATCHES.length * 70}>
              <EmptyState>Live_Broadcasting_Subsystem_Awaiting_Signal</EmptyState>
            </Fade>
          </div>

          {/* sidebar */}
          <div style={{ gridColumn: "span 4" }}>
            <Fade delay={120}>
              <div className="card card--faint" style={{ padding: 24, backdropFilter: "blur(4px)", marginBottom: 16 }}>
                <h3 className="cap" style={{ color: "var(--zinc500)", letterSpacing: ".3em", marginBottom: 16 }}>Event_Details</h3>
                <div style={{ fontFamily: "var(--mono)", fontSize: 12 }}>
                  {[["EVENT", t.full], ["STATUS", null], ["FORMAT", t.maps], ["PARSED", "28_DEMOS"], ["NODE", t.node]].map(([k, v], i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--zinc900)", padding: "9px 0" }}>
                      <span style={{ color: "var(--zinc600)" }}>{k}:</span>
                      {k === "STATUS" ? <Status state={t.status} /> : <span>{v}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </Fade>
            <Fade delay={200}>
              <div className="zebra" style={{ marginBottom: 16 }}></div>
              <Button onClick={() => go("leaderboard")}>Player_Standings →</Button>
            </Fade>
          </div>
        </div>
      </div>
    </section>
  );
}
window.MatchesView = MatchesView;
