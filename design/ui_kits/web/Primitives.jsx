// CS2 Parser Stats — UI kit primitives
const { useState, useEffect, useRef } = React;

// system-log caption: <Cap>// SYSTEM_LOG</Cap>
function Cap({ children, className = "", style }) {
  return <span className={"cap " + className} style={style}>{children}</span>;
}

// fade-in-on-mount wrapper (mimics framer whileInView)
function Fade({ children, delay = 0, kind = "fade", style, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const t = setTimeout(() => el && el.classList.add("in"), 40 + delay);
    return () => clearTimeout(t);
  }, [delay]);
  return <div ref={ref} className={kind + " " + className} style={style}>{children}</div>;
}

// section watermark ghost text
function Watermark({ children, style }) {
  return <div className="watermark" style={{ fontSize: "20vw", ...style }}>{children}</div>;
}

// thin fill-on-hover button
function Button({ children, onClick }) {
  return (
    <button className="btn" onClick={onClick}>
      <span className="lbl">{children}</span>
      <span className="fill"></span>
    </button>
  );
}

// big italic choice toggle
function Choice({ children, active, onClick }) {
  return (
    <button className={"choice" + (active ? " is-active" : "")} onClick={onClick}>{children}</button>
  );
}

function Chip({ children }) { return <span className="chip">{children}</span>; }
function Badge({ children }) { return <span className="badge">{children}</span>; }

const STATUS_COLORS = { ONGOING: "var(--green)", LIVE: "var(--orange)", STANDBY: "var(--yellow)", ENDED: "var(--zinc500)" };
function Status({ state }) {
  return <span className="status" style={{ color: STATUS_COLORS[state] || "#fff" }}>[ {state} ]</span>;
}

// word split: "Team_Assembly" -> alternating white / ghost words
function SplitTitle({ text, className = "h2" }) {
  const words = text.split("_");
  return (
    <span className={className}>
      {words.map((w, i) => (
        <span key={i} className={i % 2 ? "ghost" : ""}>{w}{i < words.length - 1 ? "_" : ""}</span>
      ))}
    </span>
  );
}

// animated horizontal progress bar
function ProgressBar({ value, max = 1, accent }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW((value / max) * 100), 80); return () => clearTimeout(t); }, [value, max]);
  return (
    <div className="bar-track">
      <div className="bar-fill" style={{ width: w + "%", background: accent || undefined }}></div>
    </div>
  );
}

// SVG circular gauge (value 0..1)
function Gauge({ value, label, size = 128 }) {
  const r = size / 2 - 2, c = 2 * Math.PI * r;
  const [off, setOff] = useState(c);
  useEffect(() => { const t = setTimeout(() => setOff(c - c * value), 120); return () => clearTimeout(t); }, [value, c]);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#18181b" strokeWidth="2" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#fff" strokeWidth="3"
          strokeDasharray={c} strokeDashoffset={off} style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0,.6,.3,1)" }} />
      </svg>
      <div className="num" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: size * 0.21 }}>
        {Math.round(value * 100)}<span style={{ fontSize: size * 0.11, color: "var(--zinc500)" }}>%</span>
      </div>
      {label && <Cap className="cap--xs" style={{ position: "absolute", bottom: -18, left: 0 }}>{label}</Cap>}
    </div>
  );
}

function EmptyState({ children, dashed = true }) {
  if (dashed) return (
    <div style={{ minHeight: 160, border: "1px dashed var(--zinc800)", display: "flex", alignItems: "center", justifyContent: "center",
      fontStyle: "italic", color: "var(--zinc800)", fontSize: 12, textTransform: "uppercase", letterSpacing: ".18em", textAlign: "center", padding: "0 48px", lineHeight: 1.6 }}>
      {children}
    </div>
  );
  return <p style={{ fontFamily: "var(--mono)", color: "var(--zinc600)", fontSize: 14 }}>{children}</p>;
}

Object.assign(window, { Cap, Fade, Watermark, Button, Choice, Chip, Badge, Status, SplitTitle, ProgressBar, Gauge, EmptyState });
