"use client";

import { getPlayerMatches } from "@/app/player/[id]/api";
import { useCallback, useEffect, useMemo, useState } from "react";

interface Tournament { id: string; name: string; }
interface MatchData {
  matchId: string;
  finishedAt: string;
  map: string;
  kills: number;
  deaths: number;
  assists: number;
  rating: number;
  isWinner: boolean;
}

const COLS = "88px 1fr 100px 80px 72px";
const HEADS = ["DATE", "MAP", "K / D / A", "RATING", ""];

export const RatingStatisticsSection = ({
  playerId,
  ulTournaments,
}: {
  playerId: string;
  ulTournaments: Tournament[];
}) => {
  const [ulTournament, setUlTournament] = useState("");
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sortedTournaments = useMemo(() => {
    const num = (name: string) => { const m = name.match(/\d+/g); return m ? parseInt(m[0]) : 0; };
    return [...ulTournaments].sort((a, b) => num(b.name) - num(a.name));
  }, [ulTournaments]);

  const loadMatches = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getPlayerMatches(playerId, ulTournament, 0);
      setMatches(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [playerId, ulTournament]);

  useEffect(() => { loadMatches(); }, [loadMatches]);

  return (
    <div style={{ marginBottom: 64 }}>
      {/* section header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <span className="cap cap--xs">// MATCH_HISTORY</span>
        <div className="hr-cs" style={{ flex: 1 }} />
        {/* tournament selector */}
        <div style={{ position: "relative" }}>
          <select
            value={ulTournament}
            onChange={e => setUlTournament(e.target.value)}
            style={{
              background: "transparent",
              border: "1px solid var(--zinc-800)",
              color: "var(--zinc-500)",
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              letterSpacing: ".2em",
              textTransform: "uppercase",
              padding: "6px 28px 6px 10px",
              outline: "none",
              cursor: "pointer",
              appearance: "none",
            }}
          >
            <option value="" style={{ background: "#111" }}>ALL_TOURNAMENTS</option>
            {sortedTournaments.map(t =>
              <option key={t.id} value={t.id} style={{ background: "#111" }}>{t.name}</option>
            )}
          </select>
          <span style={{
            position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
            fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--zinc-600)", pointerEvents: "none",
          }}>▾</span>
        </div>
      </div>

      {/* header row */}
      <div style={{
        display: "grid", gridTemplateColumns: COLS,
        padding: "8px 20px",
        border: "1px solid var(--zinc-900)",
        borderBottom: "none",
        background: "rgba(24,24,27,.07)",
      }}>
        {HEADS.map(h => (
          <div key={h} style={{
            fontFamily: "var(--font-mono)", fontSize: 8,
            letterSpacing: ".25em", textTransform: "uppercase", color: "var(--zinc-600)",
          }}>{h}</div>
        ))}
      </div>

      {isLoading && (
        <div style={{
          border: "1px solid var(--zinc-900)", padding: "32px 20px",
          fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: ".3em",
          color: "var(--zinc-600)", textAlign: "center",
        }}>
          LOADING_DATA...
        </div>
      )}

      {!isLoading && matches.map((m, i) => {
        const date = new Date(m.finishedAt);
        const dateStr = `${date.getDate()} ${date.toLocaleDateString("en-US", { month: "short" })}`.toUpperCase();
        const rating = m.rating?.toFixed(2);
        const ratingHigh = m.rating >= 1.3;

        return (
          <div
            key={m.matchId || i}
            className="invert-row"
            style={{
              display: "grid", gridTemplateColumns: COLS,
              padding: "0 20px",
              border: "1px solid var(--zinc-900)",
              borderTop: "none",
              minHeight: 52,
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => window.open(`https://cs2.fastcup.net/matches/${m.matchId}`, "_blank")}
          >
            <div className="wipe" />

            {/* ghost index */}
            <div className="num ghost" style={{
              position: "absolute", left: 8, fontSize: 38,
              transition: "color .3s", pointerEvents: "none", userSelect: "none",
            }}>{String(i + 1).padStart(2, "0")}</div>

            {/* date */}
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: ".12em", color: "var(--zinc-500)" }}>
              {dateStr}
            </div>

            {/* map */}
            <div>
              <span className="num" style={{
                fontSize: 13, letterSpacing: "-.02em",
                color: m.isWinner ? "#fff" : "var(--zinc-500)",
              }}>
                {m.map}
              </span>
              {m.isWinner && (
                <span style={{ marginLeft: 8, fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: ".15em", color: "var(--green)" }}>WIN</span>
              )}
            </div>

            {/* kda */}
            <div className="num sub" style={{ fontSize: 13 }}>
              {m.kills} / {m.deaths} / {m.assists}
            </div>

            {/* rating */}
            <div className="num" style={{ fontSize: 18, color: ratingHigh ? "var(--orange)" : "#fff" }}>
              {rating}
            </div>

            {/* arrow */}
            <div className="sub" style={{ fontFamily: "var(--font-mono)", fontSize: 9, textAlign: "right" }}>→</div>
          </div>
        );
      })}

      {!isLoading && matches.length === 0 && (
        <div style={{
          border: "1px solid var(--zinc-900)", padding: "32px 20px",
          fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: ".3em",
          color: "var(--zinc-700)", textAlign: "center",
        }}>
          NO_DATA_FOUND
        </div>
      )}
    </div>
  );
};
