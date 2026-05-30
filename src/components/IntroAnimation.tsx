"use client";

import { useEffect, useRef, useState } from "react";

/* ════════════════════════════════════════════════════════════════
   INTRO // SIGNAL ACQUISITION
   Glitch / strobe / raw-web boot sequence.
   Aesthetic: acid-graphix, anti-design, broken CRT under techno.
   Honours prefers-reduced-motion (degrades to a quick fade).
   State: sessionStorage — plays once per browser tab.
   ════════════════════════════════════════════════════════════════ */

const STORAGE_KEY = "cs2_intro_seen";

// scrolling junk lines that flicker through the glitch core
const NOISE = [
  "0xFA3C 0x00FF 0xDEAD 0xBEEF",
  "SIGNAL // ACQUIRING ░▒▓█",
  "PKT_LOSS 12% · RESYNC",
  "ULMIX_NET // NODE_01",
  "DECODING FRAME 0x1A3F2B",
  "RATING_ENGINE :: ONLINE",
  "▓▓░░ CALIBRATING ░░▓▓",
  "CS2_PARSER v2.0",
];

// total runtime of the sequence
const DURATION = 2600;
const TEAR_AT = 2100;

export function IntroAnimation() {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<"strobe" | "glitch" | "lock" | "tear">("strobe");
  const [reduced, setReduced] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    if (typeof window === "undefined") return;
    // NOTE: uncomment to play only once per tab (currently always-on for dev)
    return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    startedRef.current = true;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(prefersReduced);
    setVisible(true);

    const timers: ReturnType<typeof setTimeout>[] = [];

    if (prefersReduced) {
      // calm path: just hold a wordmark briefly then leave
      timers.push(setTimeout(() => setPhase("tear"), 900));
      timers.push(
        setTimeout(() => {
          setVisible(false);
          sessionStorage.setItem(STORAGE_KEY, "1");
        }, 1400),
      );
    } else {
      timers.push(setTimeout(() => setPhase("glitch"), 600));
      timers.push(setTimeout(() => setPhase("lock"), 1700));
      timers.push(setTimeout(() => setPhase("tear"), TEAR_AT));
      timers.push(
        setTimeout(() => {
          setVisible(false);
          sessionStorage.setItem(STORAGE_KEY, "1");
        }, DURATION),
      );
    }

    return () => timers.forEach(clearTimeout);
  }, []);

  if (!visible) return null;

  const tearing = phase === "tear";

  /* ── REDUCED-MOTION PATH ─────────────────────────────────────── */
  if (reduced) {
    return (
      <div className="intro-root" data-tear={tearing}>
        <div className="intro-wordmark-calm">
          CS2_<span>PARSER</span>
        </div>
        <span className="intro-cap">SIGNAL ACQUIRED // ULMIX_STATS</span>
        <StyleBlock />
      </div>
    );
  }

  /* ── FULL GLITCH PATH ────────────────────────────────────────── */
  return (
    <div
      className="intro-root"
      data-phase={phase}
      data-tear={tearing}
      onClick={() => setPhase("tear")}
    >
      {/* operators key-art */}
      <div className="intro-art intro-art--base" />

      {/* scanlines + dot grid */}
      <div className="intro-scan" />
      <div className="intro-dots" />

      {/* datamosh slice blocks */}
      <div className="intro-slices">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="intro-slice" style={{ ["--i" as string]: i }} />
        ))}
      </div>

      {/* giant glitch wordmark */}
      <div className="intro-center">
        <div className="intro-wordmark glitch" data-text="CS2_PARSER">
          CS2_PARSER
        </div>
        <div className="intro-sub">
          <span className="intro-cap">SIGNAL ACQUISITION</span>
          <span className="intro-bar" />
          <span className="intro-cap intro-cap--dim">ULMIX // NODE_01</span>
        </div>
      </div>

      {/* flickering noise terminal — bottom left */}
      <div className="intro-noise">
        {NOISE.map((line, i) => (
          <span key={i} className="intro-noise-line" style={{ ["--i" as string]: i }}>
            {">"} {line}
          </span>
        ))}
      </div>

      {/* corner HUD ticks */}
      <span className="intro-hud intro-hud--tl" />
      <span className="intro-hud intro-hud--br" />
      <div className="intro-rec">
        <span className="intro-rec-dot" /> REC // 00:0{phase === "strobe" ? 1 : phase === "glitch" ? 2 : 3}
      </div>

      <StyleBlock />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   STYLES
   ════════════════════════════════════════════════════════════════ */
function StyleBlock() {
  return (
    <style>{`
      .intro-root{
        position:fixed; inset:0; z-index:9999; background:#000;
        overflow:hidden; cursor:pointer;
        font-family:var(--font-sans);
        transition:none;
      }
      .intro-root[data-tear="true"]{
        animation:introTear .5s cubic-bezier(.76,0,.24,1) forwards;
      }
      @keyframes introTear{
        0%{ transform:translateY(0) skewY(0); filter:contrast(1); }
        18%{ transform:translateY(-2%) skewY(2deg); filter:contrast(1.8) brightness(1.6); }
        38%{ transform:translateY(-4%) skewY(-3deg) scaleX(1.04); }
        100%{ transform:translateY(-100%) skewY(0); filter:contrast(1); }
      }

      /* ── operators key-art with RGB split ── */
      .intro-art{
        position:absolute; inset:-6% -4%; z-index:0;
        background:url(/bg-operators.jpg) center right / cover no-repeat;
        opacity:0;
      }
      .intro-art--base{
        filter:grayscale(1) contrast(1.4) brightness(.55);
        animation:artIn .5s steps(2) .15s forwards, artJitter 1.1s steps(3) .6s infinite;
        opacity:0;
      }
      [data-phase="strobe"] .intro-art--base{ animation:artStrobe .6s steps(1) infinite; }
      @keyframes artIn{ to{ opacity:.7; } }
      @keyframes artStrobe{ 0%,100%{opacity:0;} 50%{opacity:.85;} }
      @keyframes artJitter{
        0%,100%{ transform:translate(0,0); }
        33%{ transform:translate(-4px,2px); }
        66%{ transform:translate(3px,-2px); }
      }
      [data-phase="lock"] .intro-art--base{ animation:none; opacity:.7; filter:grayscale(1) contrast(1.3) brightness(.6); }

      /* ── strobe white flash ── */
      .intro-strobe{
        position:absolute; inset:0; z-index:6; background:#fff; opacity:0; pointer-events:none;
        mix-blend-mode:difference;
      }
      [data-phase="strobe"] .intro-strobe{ animation:strobe .12s steps(1) infinite; }
      [data-phase="glitch"] .intro-strobe{ animation:strobeRare .34s steps(1) infinite; }
      @keyframes strobe{ 0%,100%{opacity:0;} 50%{opacity:1;} }
      @keyframes strobeRare{ 0%,82%,100%{opacity:0;} 90%{opacity:.9;} }

      /* ── scanlines ── */
      .intro-scan{
        position:absolute; inset:0; z-index:5; pointer-events:none; opacity:.5;
        background:repeating-linear-gradient(0deg, rgba(0,0,0,0) 0 2px, rgba(0,0,0,.55) 2px 3px);
        animation:scanRoll 7s linear infinite;
      }
      @keyframes scanRoll{ to{ background-position:0 100px; } }

      .intro-dots{
        position:absolute; inset:0; z-index:5; pointer-events:none; opacity:.12;
        background-image:radial-gradient(#fff 1px,transparent 1px); background-size:46px 46px;
      }

      /* ── datamosh slices ── */
      .intro-slices{ position:absolute; inset:0; z-index:4; pointer-events:none; }
      .intro-slice{
        position:absolute; left:0; right:0; height:calc(100% / 7);
        top:calc(var(--i) * (100% / 7));
        background:url(/bg-operators.jpg) center right / cover no-repeat;
        filter:grayscale(1) brightness(.5) contrast(1.6);
        opacity:0;
      }
      [data-phase="glitch"] .intro-slice{
        animation:sliceShift .9s steps(2) infinite;
        animation-delay:calc(var(--i) * -.13s);
      }
      @keyframes sliceShift{
        0%,100%{ opacity:0; transform:translateX(0); }
        20%{ opacity:.5; transform:translateX(-14px); }
        24%{ opacity:.5; transform:translateX(12px); }
        28%{ opacity:0; transform:translateX(0); }
      }

      /* ── center wordmark ── */
      .intro-center{
        position:relative; z-index:7; height:100%;
        display:flex; flex-direction:column; align-items:center; justify-content:center; gap:22px;
      }
      .intro-wordmark{
        font-weight:900; font-style:italic; text-transform:uppercase;
        letter-spacing:-.05em; line-height:.9; color:#fff;
        font-size:clamp(44px,11vw,150px);
        position:relative;
      }
      .intro-wordmark.glitch::before,
      .intro-wordmark.glitch::after{
        content:attr(data-text); position:absolute; inset:0;
        clip-path:inset(0 0 0 0);
      }
      [data-phase="glitch"] .intro-wordmark.glitch::before{
        color:#fff; left:4px;
        animation:glA .5s steps(2) infinite;
      }
      [data-phase="glitch"] .intro-wordmark.glitch::after{
        color:var(--zinc-500); left:-4px;
        animation:glB .5s steps(2) infinite;
      }
      [data-phase="strobe"] .intro-wordmark{ animation:wmFlick .14s steps(1) infinite; }
      @keyframes wmFlick{ 0%,100%{opacity:.15;} 50%{opacity:1;} }
      @keyframes glA{
        0%{ clip-path:inset(10% 0 80% 0); transform:translateX(-6px); }
        25%{ clip-path:inset(60% 0 12% 0); transform:translateX(5px); }
        50%{ clip-path:inset(30% 0 50% 0); transform:translateX(-4px); }
        75%{ clip-path:inset(85% 0 2% 0);  transform:translateX(6px); }
        100%{ clip-path:inset(40% 0 40% 0); transform:translateX(0); }
      }
      @keyframes glB{
        0%{ clip-path:inset(70% 0 14% 0); transform:translateX(6px); }
        25%{ clip-path:inset(15% 0 70% 0); transform:translateX(-5px); }
        50%{ clip-path:inset(50% 0 30% 0); transform:translateX(4px); }
        75%{ clip-path:inset(5% 0 88% 0);  transform:translateX(-6px); }
        100%{ clip-path:inset(45% 0 35% 0); transform:translateX(0); }
      }
      [data-phase="lock"] .intro-wordmark{ text-shadow:0 0 24px rgba(255,255,255,.45); }

      .intro-sub{ display:flex; align-items:center; gap:16px; }
      .intro-bar{ width:54px; height:1px; background:var(--zinc-700); }
      .intro-cap{
        font-family:var(--font-mono); font-size:clamp(8px,1vw,11px);
        letter-spacing:.4em; text-transform:uppercase; color:var(--zinc-400);
      }
      .intro-cap--dim{ color:var(--zinc-600); }
      [data-phase="strobe"] .intro-sub{ opacity:0; }
      [data-phase="glitch"] .intro-sub{ animation:subFlick .3s steps(1) infinite; }
      @keyframes subFlick{ 0%,70%{opacity:1;} 85%{opacity:.2;} 100%{opacity:1;} }

      /* ── noise terminal ── */
      .intro-noise{
        position:absolute; left:6vw; bottom:7vh; z-index:7;
        display:flex; flex-direction:column; gap:5px; pointer-events:none;
      }
      .intro-noise-line{
        font-family:var(--font-mono); font-size:10px; letter-spacing:.12em;
        text-transform:uppercase; color:var(--zinc-500);
        opacity:0; animation:noiseFlick .8s steps(2) infinite;
        animation-delay:calc(var(--i) * .09s);
      }
      [data-phase="strobe"] .intro-noise-line{ animation:none; opacity:0; }
      @keyframes noiseFlick{
        0%,100%{ opacity:0; transform:translateX(0); }
        15%{ opacity:.9; transform:translateX(2px); }
        30%{ opacity:.2; }
        45%{ opacity:.8; transform:translateX(-2px); }
        60%{ opacity:.3; }
      }
      [data-phase="lock"] .intro-noise-line{ animation:none; opacity:.55; }

      /* ── HUD ── */
      .intro-hud{ position:absolute; width:26px; height:26px; z-index:7; }
      .intro-hud--tl{ top:24px; left:24px; border-top:1px solid var(--zinc-500); border-left:1px solid var(--zinc-500); }
      .intro-hud--br{ bottom:24px; right:24px; border-bottom:1px solid var(--zinc-500); border-right:1px solid var(--zinc-500); }
      .intro-rec{
        position:absolute; top:22px; right:26px; z-index:7;
        font-family:var(--font-mono); font-size:10px; letter-spacing:.22em;
        color:var(--zinc-400); display:flex; align-items:center; gap:8px;
      }
      .intro-rec-dot{ width:8px; height:8px; background:var(--orange,#f97316); border-radius:50%;
        animation:recBlink .8s steps(1) infinite; }
      @keyframes recBlink{ 0%,100%{opacity:1;} 50%{opacity:.15;} }

      /* ── reduced-motion calm wordmark ── */
      .intro-wordmark-calm{
        position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
        font-weight:900; font-style:italic; text-transform:uppercase; letter-spacing:-.05em;
        color:#fff; font-size:clamp(40px,9vw,110px);
      }
      .intro-wordmark-calm span{ color:var(--zinc-800); }
      .intro-root[data-tear="true"] .intro-wordmark-calm{ animation:none; }
    `}</style>
  );
}
