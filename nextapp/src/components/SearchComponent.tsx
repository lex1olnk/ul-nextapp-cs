"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

interface Player {
  id: string;
  nickname: string;
}

export const SearchComponent = ({ allPlayers }: { allPlayers: Player[] }) => {
  const [searchTerm, setSearchTerm]     = useState("");
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [focused, setFocused]           = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router   = useRouter();

  useEffect(() => {
    if (searchTerm.length === 0) { setFilteredPlayers([]); return; }
    setFilteredPlayers(
      allPlayers.filter(p =>
        p.nickname.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 8)
    );
  }, [searchTerm, allPlayers]);

  const handleSelect = (player: Player) => {
    setSearchTerm(player.nickname);
    setFilteredPlayers([]);
    router.push(`/player/${player.id}`);
  };

  const showDropdown = focused && filteredPlayers.length > 0;

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 480 }}>
      {/* input row */}
      <div
        style={{
          display: "flex",
          border: `1px solid ${focused ? "#fff" : "var(--zinc-800)"}`,
          transition: "border-color 0.2s",
        }}
      >
        {/* icon cell */}
        <div
          style={{
            padding: "0 14px",
            display: "flex",
            alignItems: "center",
            borderRight: "1px solid var(--zinc-800)",
            background: "rgba(24,24,27,0.4)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none"
               xmlns="http://www.w3.org/2000/svg">
            <circle cx="8.5" cy="8.5" r="5.5" stroke="var(--zinc-500)" strokeWidth="1.5"/>
            <path d="M13 13L17 17" stroke="var(--zinc-500)" strokeWidth="1.5" strokeLinecap="square"/>
          </svg>
        </div>

        <input
          ref={inputRef}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="SEARCH_PLAYER"
          style={{
            flex: 1,
            background: "rgba(24,24,27,0.4)",
            border: "none",
            outline: "none",
            padding: "12px 16px",
            color: "#fff",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        />

        <div
          style={{
            padding: "0 14px",
            display: "flex",
            alignItems: "center",
            background: "rgba(24,24,27,0.4)",
          }}
        >
          <span className="cap cap--xs" style={{ color: "var(--zinc-700)" }}>
            {allPlayers.length}_ENTRIES
          </span>
        </div>
      </div>

      {/* dropdown */}
      {showDropdown && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "#0c0c0c",
            border: "1px solid var(--zinc-800)",
            borderTop: "none",
            zIndex: 100,
          }}
        >
          {filteredPlayers.map((player, i) => (
            <button
              key={player.id}
              onClick={() => handleSelect(player)}
              className="invert-row"
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "10px 16px",
                background: "transparent",
                border: "none",
                borderBottom: i < filteredPlayers.length - 1
                  ? "1px solid var(--zinc-900)" : "none",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span className="wipe" />
              <span
                className="num ghost"
                style={{ fontSize: 12, minWidth: 24 }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 13,
                  textTransform: "uppercase",
                  letterSpacing: "-0.02em",
                  color: "#fff",
                }}
              >
                {player.nickname}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
