"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const links = [
  { href: "/",        label: "Home" },
  { href: "/matches", label: "Players" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    /* outer wrapper — full width, centers the nav */
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center"
         style={{ pointerEvents: "none" }}>
      <nav
        style={{
          width: "100%",
          background: "rgba(0,0,0,0.82)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--zinc-800)",
          transform: "translateY(calc(-100% + 4px))",
          transition: "transform 0.35s",
          pointerEvents: "auto",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.transform =
            "translateY(calc(-100% + 4px))";
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "14px 48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* brand */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <Image
              src="/logo.png"
              alt="UL"
              width={26}
              height={26}
              style={{ display: "block" }}
            />
            <span
              style={{
                fontWeight: 900,
                fontStyle: "italic",
                letterSpacing: "-0.04em",
                textTransform: "uppercase",
                fontSize: 18,
                color: "#fff",
                fontFamily: "var(--font-sans)",
              }}
            >
              CS2_<span style={{ color: "var(--zinc-800)" }}>PARSER</span>
            </span>
          </Link>

          {/* nav links */}
          <div style={{ display: "flex", gap: 26 }}>
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: pathname === l.href ? "#fff" : "var(--zinc-500)",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* system tag */}
          <span className="cap cap--meta cap--xs">NET_LINK // NODE_01</span>
        </div>

        {/* pull tab */}
        <div
          style={{
            position: "absolute",
            bottom: -1,
            left: "50%",
            transform: "translateX(-50%)",
            width: 48,
            height: 4,
            background: "var(--zinc-700)",
          }}
        />
      </nav>
    </div>
  );
}
