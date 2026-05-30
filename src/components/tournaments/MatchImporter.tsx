"use client";
import { createTournament, exportMatches, postAndAttachMatches, updateTournamentPlayers } from "@/app/upload/api";
import { useState } from "react";
import { TournamentSearch } from "./TournamentSearch";

type MatchStatus = "pending" | "loading" | "ok" | "error";

interface MatchResult {
  url: string;
  status: MatchStatus;
  message?: string;
}

export default function MatchImporter({ tournaments }) {
  const [selectedTournament, setSelectedTournament] = useState<string>("");
  const [matchUrls, setMatchUrls] = useState<string>("");
  const [newTournamentName, setNewTournamentName] = useState("");
  const [results, setResults] = useState<MatchResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const handleSubmit = async () => {
    const urls = matchUrls.split(/[\n,]+/).map(u => u.trim()).filter(Boolean);
    if (urls.length === 0) return;

    setIsRunning(true);
    setResults(urls.map(url => ({ url, status: "pending" })));

    for (let i = 0; i < urls.length; i++) {
      setResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: "loading" } : r));
      try {
        const response = await postAndAttachMatches({ tournamentId: selectedTournament, matchUrls: [urls[i]] });
        setResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: "ok", message: response ?? "ok" } : r));
      } catch (error) {
        setResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: "error", message: String(error) } : r));
      }
    }

    setIsRunning(false);
  };

  const handleCreateTournament = async () => {
    if (!newTournamentName) return;
    try {
      const id = await createTournament(newTournamentName);
      setSelectedTournament(id);
    } catch (e) { console.error(e); }
  };

  const handleUpdatePlayers = async () => {
    if (!selectedTournament || !newTournamentName) return;
    try { await updateTournamentPlayers(selectedTournament, newTournamentName); }
    catch (e) { console.error(e); }
  };

  const handleExport = async () => {
    if (!newTournamentName) return;
    try { await exportMatches({ tournamentId: selectedTournament, tournamentName: newTournamentName }); }
    catch (e) { console.error(e); }
  };

  const urlCount = matchUrls.split(/[\n,]+/).map(u => u.trim()).filter(Boolean).length;
  const okCount  = results.filter(r => r.status === "ok").length;
  const errCount = results.filter(r => r.status === "error").length;

  return (
    <section style={{ minHeight: "100vh", position: "relative", padding: "120px 0 80px" }}>

      {/* watermark */}
      <div className="watermark" style={{ right: "2vw", top: "8vh", fontSize: "22vw", zIndex: 0 }}>
        UP
      </div>

      <div className="cs-container">

        {/* page header */}
        <div className="pagehead">
          <div className="tagrow">
            <span className="cap">// UPLOAD_CONSOLE</span>
            <div className="hr-line" />
            <span className="cap cap--meta">MATCH_IMPORT // FASTCUP</span>
          </div>
          <h1 className="h1">
            Import_<span className="ghost">Matches</span>
          </h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>

          {/* LEFT col */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Tournament block */}
            <div className="card ticks" style={{ padding: "28px 32px" }}>
              <div style={{ marginBottom: 20 }}>
                <span className="cap cap--xs" style={{ color: "var(--zinc-600)" }}>TOURNAMENT_SELECT</span>
              </div>

              <TournamentSearch
                allTournaments={tournaments}
                setNewTournamentName={setNewTournamentName}
                setNewTournamentId={setSelectedTournament}
              />

              {selectedTournament && (
                <div style={{ marginTop: 12, fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.2em", color: "var(--zinc-600)" }}>
                  ID__{selectedTournament}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
                <button onClick={handleCreateTournament} className="btn-cs">
                  <span className="lbl">Create_New</span>
                  <span className="fill" />
                </button>
                {selectedTournament && (
                  <>
                    <button onClick={handleUpdatePlayers} className="btn-cs">
                      <span className="lbl">Update_Players</span>
                      <span className="fill" />
                    </button>
                    <button onClick={handleExport} className="btn-cs">
                      <span className="lbl">Export</span>
                      <span className="fill" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* URLs block */}
            <div className="card ticks" style={{ padding: "28px 32px", flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span className="cap cap--xs" style={{ color: "var(--zinc-600)" }}>MATCH_URLS</span>
                {urlCount > 0 && (
                  <span className="cap cap--xs" style={{ color: "var(--zinc-500)" }}>
                    {urlCount}_ENTRIES
                  </span>
                )}
              </div>
              <textarea
                value={matchUrls}
                onChange={e => setMatchUrls(e.target.value)}
                placeholder={"https://fastcup.net/match/...\nhttps://fastcup.net/match/..."}
                rows={10}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "1px solid var(--zinc-800)",
                  borderRadius: 0,
                  color: "#fff",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  padding: "12px 16px",
                  outline: "none",
                  resize: "vertical",
                  lineHeight: 1.8,
                  letterSpacing: "0.03em",
                }}
              />

              <button
                onClick={handleSubmit}
                disabled={isRunning || urlCount === 0}
                className="btn-cs"
                style={{ width: "100%", marginTop: 16, justifyContent: "center", display: "flex" }}
              >
                <span className="lbl">
                  {isRunning
                    ? `Processing_${results.filter(r => r.status === "ok" || r.status === "error").length}/${results.length}`
                    : `Process_${urlCount || ""}_Matches`}
                </span>
                <span className="fill" />
              </button>
            </div>
          </div>

          {/* RIGHT col — results */}
          <div className="card ticks" style={{ padding: "28px 32px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <span className="cap cap--xs" style={{ color: "var(--zinc-600)" }}>IMPORT_LOG</span>
              {results.length > 0 && (
                <div style={{ display: "flex", gap: 16 }}>
                  <span className="cap cap--xs" style={{ color: "var(--green)" }}>{okCount}_OK</span>
                  {errCount > 0 && <span className="cap cap--xs" style={{ color: "var(--orange)" }}>{errCount}_ERR</span>}
                </div>
              )}
            </div>

            {results.length === 0 ? (
              <div style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 12,
                color: "var(--zinc-700)",
              }}>
                <div className="zebra" style={{ width: 64, height: 20 }} />
                <span className="cap cap--xs">AWAITING_INPUT</span>
              </div>
            ) : (
              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
                {results.map((r, i) => (
                  <div
                    key={i}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "20px 1fr auto",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 12px",
                      background: r.status === "ok"
                        ? "rgba(34,197,94,0.05)"
                        : r.status === "error"
                          ? "rgba(249,115,22,0.05)"
                          : "transparent",
                      borderLeft: `2px solid ${
                        r.status === "ok" ? "var(--green)"
                        : r.status === "error" ? "var(--orange)"
                        : r.status === "loading" ? "var(--yellow)"
                        : "var(--zinc-800)"
                      }`,
                    }}
                  >
                    {/* indicator */}
                    <span style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      color: r.status === "ok" ? "var(--green)"
                        : r.status === "error" ? "var(--orange)"
                        : r.status === "loading" ? "var(--yellow)"
                        : "var(--zinc-700)",
                      textAlign: "center",
                    }}>
                      {r.status === "ok" ? "✓" : r.status === "error" ? "✗" : r.status === "loading" ? "▸" : "·"}
                    </span>

                    {/* url */}
                    <span style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      color: r.status === "pending" ? "var(--zinc-600)" : "var(--zinc-300)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      letterSpacing: "0.02em",
                    }} title={r.url}>
                      {r.url.replace("https://fastcup.net/match/", "match/")}
                    </span>

                    {/* status */}
                    {r.message && r.status !== "loading" && (
                      <span style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 9,
                        letterSpacing: "0.15em",
                        color: r.status === "ok" ? "var(--green)" : "var(--orange)",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                      }}>
                        {String(r.message).slice(0, 20)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* progress bar */}
            {results.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span className="cap cap--xs" style={{ color: "var(--zinc-600)" }}>PROGRESS</span>
                  <span className="cap cap--xs" style={{ color: "var(--zinc-500)" }}>
                    {okCount + errCount}/{results.length}
                  </span>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${results.length ? ((okCount + errCount) / results.length) * 100 : 0}%`,
                      background: errCount > 0 ? "var(--orange)" : "var(--green)",
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
