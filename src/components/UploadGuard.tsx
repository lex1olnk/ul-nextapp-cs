"use client";

import { useState } from "react";

export function UploadGuard({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  if (unlocked) return <>{children}</>;

  function handleSubmit() {
    if (password === process.env.NEXT_PUBLIC_UPLOAD_PASSWORD) {
      setUnlocked(true);
    } else {
      setError(true);
    }
  }

  return (
    <section style={{ minHeight: "100vh", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="watermark" style={{ right: "2vw", top: "8vh", fontSize: "22vw", zIndex: 0 }}>
        UP
      </div>

      <div className="card ticks" style={{ padding: "48px 56px", minWidth: 320, position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            <span className="cap">// UPLOAD_CONSOLE</span>
            <div style={{ height: 1, width: 48, background: "var(--zinc-800)" }} />
          </div>
          <h2 className="h2">
            Auth_<span className="ghost">Gate</span>
          </h2>
        </div>

        <div style={{ marginBottom: 8 }}>
          <span className="cap cap--xs" style={{ color: "var(--zinc-600)" }}>ACCESS_KEY</span>
        </div>

        <input
          type="password"
          value={password}
          onChange={e => { setPassword(e.target.value); setError(false); }}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          placeholder="············"
          autoFocus
          style={{
            width: "100%",
            background: "transparent",
            border: `1px solid ${error ? "var(--orange)" : "var(--zinc-800)"}`,
            color: "#fff",
            fontFamily: "var(--font-mono)",
            fontSize: 18,
            padding: "12px 16px",
            outline: "none",
            letterSpacing: "0.3em",
            marginBottom: 8,
            transition: "border-color 0.2s",
          }}
        />

        <div style={{ height: 20, marginBottom: 16 }}>
          {error && (
            <span className="cap cap--xs" style={{ color: "var(--orange)" }}>
              ACCESS_DENIED // INVALID_KEY
            </span>
          )}
        </div>

        <button onClick={handleSubmit} className="btn-cs" style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <span className="lbl">Enter_Console</span>
          <span className="fill" />
        </button>
      </div>
    </section>
  );
}
