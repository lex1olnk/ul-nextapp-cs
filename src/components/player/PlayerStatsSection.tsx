"use client";

import { getRatingColor } from "@/lib/utils";
import { PlayerComparison } from "@/types/types";
import { useEffect, useState } from "react";

function AnimBar({ value, color }: { value: number; color: string }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    setW(0);
    const t = setTimeout(() => setW(Math.min(Math.max(value, 0), 100)), 280);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <div style={{ height: 3, background: "var(--zinc-900)", overflow: "hidden" }}>
      <div style={{ height: "100%", width: w + "%", background: color, transition: "width 1.2s cubic-bezier(0,.6,.3,1)" }} />
    </div>
  );
}

export const PlayerStatsSection = ({ playerStats }: { playerStats: PlayerComparison }) => {
  const mainStats = [
    { title: "Damage/Round", key: "TargetAvg",     percentile: "avgAdv" },
    { title: "K/D Ratio",    key: "TargetKD",       percentile: "kdAdv"  },
    { title: "Headshot %",   key: "TargetHSRatio",  percentile: "hsAdv"  },
    { title: "Rating",       key: "rating",         percentile: "ratingAdv" },
  ];

  const secondaryStats = [
    { title: "Kills",   key: "kills"   },
    { title: "Deaths",  key: "deaths"  },
    { title: "Assists", key: "assists" },
    { title: "KAST",    key: "kast"    },
    { title: "Impact",  key: "impact"  },
    { title: "Winrate", key: "winrate" },
  ];

  return (
    <section className="card ticks" style={{ padding: "20px 20px 16px", marginBottom: 0 }}>
      {/* main stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderBottom: "1px solid var(--zinc-900)", marginBottom: 12 }}>
        {mainStats.map((stat, i) => {
          const pct = playerStats[stat.percentile] ?? 0;
          const barColor = getRatingColor(59 * (1 - pct / 100), 10, 59);
          return (
            <div
              key={i}
              style={{
                padding: "12px 16px 14px",
                borderRight: i < 3 ? "1px solid var(--zinc-900)" : undefined,
              }}
            >
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: ".25em", textTransform: "uppercase", color: "var(--zinc-600)", marginBottom: 8 }}>
                {stat.title}
              </div>
              <div className="num" style={{ fontSize: "clamp(20px,2vw,28px)", marginBottom: 8 }}>
                {playerStats[stat.key]}
              </div>
              <AnimBar value={pct} color={barColor} />
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: ".1em", marginTop: 5, color: "var(--zinc-600)" }}>
                TOP {pct}%
              </div>
            </div>
          );
        })}
      </div>

      {/* secondary stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 4 }}>
        {secondaryStats.map((stat, i) => (
          <div key={i} style={{ padding: "10px 12px", background: "rgba(24,24,27,0.4)" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--zinc-600)", marginBottom: 4 }}>
              {stat.title}
            </div>
            <div className="num" style={{ fontSize: 16 }}>
              {playerStats[stat.key]}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
