"use client";

import { PlayerComparison } from "@/types/types";
import { useEffect, useState } from "react";

/* ── helpers ─────────────────────────────────────────────────── */
const num = (v: unknown) => (typeof v === "number" ? v : Number(v) || 0);
const fmt = (v: unknown) =>
  num(v).toLocaleString("en-US", { maximumFractionDigits: 0 }).replace(/,/g, " ");
const top = (pct: unknown) => (pct != null ? `Top ${num(pct)}%` : "—");

/* ── tiny metric icons (monochrome, stroke = currentColor) ───── */
const ICONS: Record<string, React.ReactNode> = {
  damage: (
    <path d="M2 13 L8 7 L6 5 L11 1 L9 6 L11 6 L5 13 L7 11 Z" fill="currentColor" stroke="none" />
  ),
  kd: (
    <>
      <path d="M2 12 L12 2" />
      <path d="M2 2 L5 2 M2 2 L2 5" />
      <path d="M12 12 L9 12 M12 12 L12 9" />
    </>
  ),
  hs: (
    <>
      <circle cx="7" cy="7" r="5.2" />
      <circle cx="7" cy="7" r="2" />
      <path d="M7 0.5 L7 2.4 M7 11.6 L7 13.5 M0.5 7 L2.4 7 M11.6 7 L13.5 7" />
    </>
  ),
  rating: (
    <path d="M7 1 L8.8 5 L13 5.4 L9.8 8.3 L10.8 12.5 L7 10.2 L3.2 12.5 L4.2 8.3 L1 5.4 L5.2 5 Z" />
  ),
};

/* horizontal percentile bar with a percentile read-out */
function PctBar({ pct, accent }: { pct: number; accent?: boolean }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    setW(0);
    const t = setTimeout(() => setW(Math.min(Math.max(pct, 0), 100)), 320);
    return () => clearTimeout(t);
  }, [pct]);
  return (
    <div style={{ height: 4, background: "var(--zinc-900)", overflow: "hidden", position: "relative" }}>
      <div
        style={{
          height: "100%",
          width: `${w}%`,
          background: accent ? "var(--orange)" : "#fff",
          transition: "width 1.1s cubic-bezier(0,.6,.3,1)",
        }}
      />
    </div>
  );
}

/* entry-success ring driven by firstKills vs firstDeaths */
function EntryGauge({ won, lost }: { won: number; lost: number }) {
  const sz = 148;
  const r = 56;
  const c = 2 * Math.PI * r;
  const total = won + lost;
  const pct = total > 0 ? (won / total) * 100 : 0;

  const [off, setOff] = useState(c);
  useEffect(() => {
    setOff(c);
    const t = setTimeout(() => setOff(c - c * (pct / 100)), 400);
    return () => clearTimeout(t);
  }, [pct, c]);

  return (
    <div style={{ position: "relative", width: sz, height: sz }}>
      <svg width={sz} height={sz} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={sz / 2} cy={sz / 2} r={r} fill="none" stroke="var(--zinc-900)" strokeWidth="2" />
        <circle
          cx={sz / 2}
          cy={sz / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,.82)"
          strokeWidth="2"
          strokeDasharray={c}
          strokeDashoffset={off}
          style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0,.6,.3,1)" }}
        />
      </svg>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
        <div className="num" style={{ fontSize: 26, lineHeight: 1.1 }}>{pct.toFixed(1)}%</div>
        <div className="cap cap--xs" style={{ display: "block", margin: "5px 0 3px", letterSpacing: ".06em" }}>
          entry success
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--zinc-400)", letterSpacing: ".03em" }}>
          {won} | {lost}
        </div>
      </div>
    </div>
  );
}

export const PlayerStatsSection = ({ playerStats: p }: { playerStats: PlayerComparison }) => {
  /* 4 stat columns — big value + percentile bar + metric icon.
     Числовые под-строки убраны: Kills/Deaths/Assists/FK/FD дублировались
     между колонками и нижней misc-сеткой. */
  const statCols = [
    { label: "Avg Damage", value: fmt(p.TargetAvg),            pct: num(p.avgAdv),    icon: "damage", caption: "Damage per round" },
    { label: "K/D Ratio",  value: num(p.TargetKD).toFixed(2),  pct: num(p.kdAdv),     icon: "kd",     caption: "Kills per death" },
    { label: "Headshot%",  value: `${num(p.TargetHSRatio)}%`,  pct: num(p.hsAdv),     icon: "hs",     caption: "Headshot accuracy" },
    { label: "Rating",     value: num(p.rating).toFixed(2),    pct: num(p.ratingAdv), icon: "rating", caption: "Overall impact", accent: true },
  ];

  /* misc grid — 4×2, hatch tiles fill the gaps like the design.
     Уникальные поля, которых нет в stat-колонках выше. */
  const misc: ({ l: string; v: string } | { hatch: true })[] = [
    { l: "Matches", v: fmt(p.maps) },
    { hatch: true },
    { l: "First Kills", v: fmt(p.firstKills) },
    { l: "First Deaths", v: fmt(p.firstDeaths) },
    { l: "Flash Kills", v: fmt(p.flashes) },
    { hatch: true },
    { l: "Trade Kills", v: fmt(p.exchanged) },
    { l: "Grenade Dmg", v: fmt(p.nades) },
  ];

  return (
    <div>
      {/* section header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10 }}>
        <span className="cap cap--xs">// STATS</span>
        <div className="zebra" style={{ flex: 1 }} />
      </div>

      {/* ── stat columns ── */}
      <div style={{ display: "flex", border: "1px solid var(--zinc-900)" }}>
        {statCols.map((col, ci) => (
          <div key={ci} style={{ flex: 1, minWidth: 0, borderRight: ci < 3 ? "1px solid var(--zinc-900)" : undefined }}>
            <div style={{ padding: "18px 16px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
              {/* label + icon */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, color: "var(--zinc-400)", fontWeight: 600, lineHeight: 1.3 }}>
                  {col.label}
                </span>
                <svg
                  width={14}
                  height={14}
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="var(--zinc-600)"
                  strokeWidth={1.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flexShrink: 0 }}
                >
                  {ICONS[col.icon]}
                </svg>
              </div>

              {/* big value */}
              <div className="num" style={{ fontSize: "clamp(24px,2.4vw,34px)", lineHeight: 1, color: col.accent ? "var(--orange)" : "#fff" }}>
                {col.value}
              </div>

              {/* percentile bar */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <PctBar pct={col.pct} accent={col.accent} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: ".1em", color: "var(--zinc-600)" }}>
                    {col.caption}
                  </span>
                  <span className="cap cap--xs" style={{ color: col.accent ? "var(--orange)" : "var(--zinc-500)", letterSpacing: ".1em" }}>
                    {top(col.pct)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── entry gauge + misc grid ── */}
      <div style={{ display: "flex", border: "1px solid var(--zinc-900)", borderTop: "none", minHeight: 160 }}>
        <div
          style={{
            flexShrink: 0,
            width: 188,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            borderRight: "1px solid var(--zinc-900)",
          }}
        >
          <EntryGauge won={num(p.firstKills)} lost={num(p.firstDeaths)} />
        </div>
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gridTemplateRows: "1fr 1fr" }}>
          {misc.map((item, i) => (
            <div
              key={i}
              style={{
                borderRight: i % 4 < 3 ? "1px solid var(--zinc-900)" : undefined,
                borderBottom: i < 4 ? "1px solid var(--zinc-900)" : undefined,
                overflow: "hidden",
                minHeight: 70,
              }}
            >
              {"hatch" in item ? (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background:
                      "repeating-linear-gradient(-45deg,var(--zinc-900),var(--zinc-900) 3px,transparent 3px,transparent 9px)",
                  }}
                />
              ) : (
                <div style={{ padding: "12px 14px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 5 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 10, height: 10, background: "var(--zinc-700)", flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: "var(--zinc-500)" }}>{item.l}</span>
                  </div>
                  <div className="num" style={{ fontSize: 17, paddingLeft: 17 }}>{item.v}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
