# CS2 Parser Stats — Design System

A design system for **CS2 Parser Stats**, a Counter-Strike 2 tournament & player
statistics site that parses match demos and renders leaderboards, player cards,
match histories and deep performance metrics (rating, KAST, ADR, clutch %,
entry success, recoil/utility breakdowns).

The visual language is **Brutalist + Terminal + Tech-magazine**: the site reads
like *"a tournament control panel from a cyberpunk film"* — monochrome,
aggressive typography, technical system-log captions, and almost no color
(white and orange used purely as accents).

> This system was rebuilt from the project's authored design guide
> (`design.md`). The underlying app is a **Next.js** codebase (`nextapp/`,
> Tailwind CSS + framer-motion) that was **not** attached to this project — the
> source-of-truth component files are referenced below in case the reader has
> access.

---

## Sources

- **`design.md`** — the original, authored design guide (provided by the user). All
  tokens, patterns and rules here derive from it.
- **Codebase (referenced, not attached):** Next.js app under `nextapp/`.
  Key files cited by the guide:
  - Global tokens / font: `nextapp/src/app/globals.css`, `nextapp/src/app/layout.tsx`
  - Home (horizontal-scroll composition): `nextapp/src/app/(public)/page.tsx`,
    `components/features/home/HomeClient.tsx`, `HybridScroll.tsx`, `HeroSection.tsx`,
    `DeagleSection.tsx`, `Draft.tsx`, `MagicData.tsx`, `MatchList.tsx`
  - Player: `components/features/player/PlayerCard.tsx`, `StatsGrid.tsx`,
    `ClutchStats.tsx`, `PlayerLeaderboard.tsx`
  - Tournament: `components/TournamentLeaderboard.tsx`,
    `app/(public)/tournament/players/page.tsx`
  - Chrome / FX: `components/layout/Navbar.tsx`, `components/ui/RecoilPattern.tsx`
  - Admin (intentional light-theme exception): `app/admin/page.tsx`

Routes observed: `/` (home), `/matches`, `/tournament/players`, `/player/[id]`, `/admin`.

---

## CONTENT FUNDAMENTALS

How copy is written in this brand.

- **Voice:** machine, not human. The UI talks like a system terminal printing
  logs, not like a product addressing a user. There is no "I" and effectively no
  "you" — labels are impersonal nouns and status codes.
- **Casing:** **UPPERCASE** for every technical caption, label, tag, and most
  headings. Headings are also *italic* + tightly tracked.
- **`snake_case` as a graphic device:** spaces become underscores in headings and
  labels — `Team_Assembly`, `History.exe`, `DATA_EXTRACT`, `Top_Performers`,
  `NO_DATA_FOR_TOURNAMENT`. This is the single most recognizable copy tic.
- **System-log prefixes:** captions are framed like log lines and node IDs —
  `// SYSTEM_LOG`, `// MATCH_ENTRIES`, `NET_LINK_ESTABLISHED // NODE_01`,
  `DATA_EXTRACT // PLAYERS_STAT`. Technical sigils `// `, `[ ]`, `0x`, `#`, `^`
  add "systemness". Hex-looking strings (`0x1A3F2B`) appear as decoration.
- **Status as bracketed codes:** `[ ONGOING ]` (green), `[ STANDBY ]`,
  `[ LIVE ]`. Always bracketed, always mono, color = status.
- **Key:value, never prose:** explanations are formatted as `LABEL: value` in a
  mono block, never as sentences. **Long paragraphs are forbidden.**
- **No emoji** anywhere in the public product. (The `/admin` CRUD screen is a
  deliberate exception — see below.)
- **Vibe:** competitive, cold, precise, a little intimidating. Numbers do the
  talking; the chrome around them performs "high-tech instrumentation."

Examples:
```
// SYSTEM_LOG  // MATCH_ENTRIES
DATA_EXTRACT // PLAYERS_STAT
Top_Performers  [ — ]
STATUS: [ ONGOING ]
NET_LINK_ESTABLISHED // NODE_01
Live_Broadcasting_Subsystem_Awaiting_Signal
NO_DATA_FOR_TOURNAMENT
```

---

## VISUAL FOUNDATIONS

- **Color vibe:** ruthless monochrome. Page background `#0a0a0a`, body `#0c0c0c`,
  everything built from the **zinc** scale (`zinc-400 → zinc-900`). Color is an
  *accent only* — **orange** (`#f97316`, the "CS2 ammo/deagle" feel) for
  progress bars, the recoil cursor FX and highlights; **green** `#22c55e`,
  **yellow** `#facc15` for status. A small rotation (red/yellow/green/cyan/blue)
  appears only in a "DuelMasters" widget. **Never** colored section backgrounds
  or colored cards.
- **Type:** **Nunito** (sans, the real brand font, loaded from Google Fonts) +
  system **mono** for all technical captions. Headings are
  `font-black (900) italic, tracking-tighter, uppercase`, sized from `text-7xl`
  up to `20vw` watermarks. Mono captions live at `8–11px` with
  `tracking 0.2em–0.5em`, always uppercase.
- **Backgrounds:** flat near-black. Two recurring texture motifs: (1) a fixed
  **radial dot grid** (`radial-gradient(#fff 1px, transparent 1px)`, 50px,
  ~15% opacity); (2) **giant watermark text** — a ghost heading at
  `text-[15vw]`, `text-white/5`, italic uppercase, anchored in a section corner.
  A 45° **zebra hatch** (`repeating-linear-gradient`, ~30% opacity) is used as a
  decorative rule. No photographic or gradient backgrounds.
- **Corners:** **square. Always.** No `rounded-lg/xl`. The only roundness allowed
  is `rounded-full` for avatars / circular buttons.
- **Borders:** the primary structural device. `1px` borders in `zinc-900`
  (`#18181b`) for cards/rows, `zinc-800` for dividers. Cards get decorative
  **L-shaped corner ticks** — tiny `4×4` border fragments offset `-1px` outside
  two opposite corners (`border-zinc-600`). Empty states use
  `border-dashed border-zinc-800`.
- **Shadows:** essentially none — contrast replaces elevation. Exceptions are
  deliberate **glow** FX (`shadow-[0_0_20px_rgba(255,255,255,0.4)]`) and one
  dramatic cinematic block (`shadow-[30px_30px_60px_rgba(0,0,0,0.5)]`). No soft
  material shadows.
- **The signature interaction — HOVER INVERSION:** interactive cards and table
  rows flip to `bg-white text-black` on hover; inner accents invert via
  `group-hover:` (white→black bars, zinc→black/50 captions). A thin white bar
  often wipes in from the left/top edge (`scale-y-0 → scale-y-100`).
- **Press states:** there is no soft "press" language; state is communicated by
  the active/selected toggle becoming a solid inverted block
  (`bg-white text-black border-white`) vs. ghost (`border-zinc-900 text-zinc-700`).
- **Buttons:** rectangular, thin, uppercase mono-ish black labels with a fill
  that slides up/in on hover (`translate-y-full → 0`, white fill, text turns
  black). Large "choice" buttons are big italic toggles.
- **Transparency & blur:** sparingly and purposefully — the hidden Navbar and
  info sidebars use `bg-black/80 backdrop-blur-md`; card fills are translucent
  zinc (`zinc-900/5–10`). Blur signals "floating chrome," not decoration.
- **Layout rules:** `max-w-7xl mx-auto px-12` container; **12-column grid**
  everywhere (`col-span-8` content + `col-span-3/4` sidebar is the staple).
  Generous air: `pt-24–32` under the (fixed) Navbar, `py-20`, `mb-16–20`. On the
  home page each section is `w-screen h-screen` (horizontal scroll); other pages
  are `min-h-screen`.
- **Animation:** framer-motion as "system response." List items appear with
  `delay: i * 0.07–0.1`; sections use `whileInView` (`opacity/y`); progress bars
  animate `width 0→x%`; circular gauges animate `strokeDashoffset` with
  `ease: "circOut"`, `duration 1–1.5`. Hover transitions are `duration-300`.
  Home uses scroll-driven `useTransform` + `useSpring` smoothing. No bouncy
  easings — motion is mechanical and decisive. **Parallax:** the homepage layers
  depth — ghost watermarks drift at varied scroll speeds, and the operators key
  art floats with mouse + scroll (subtle translate/scale, eased), giving the
  hero a "models suspended in space" feel.
- **Cards, summarized:** square, `1px zinc-900` border, translucent zinc fill,
  optional corner ticks, no radius, no shadow, big italic number + mono caption,
  invert on hover.

---

## ICONOGRAPHY

This brand is **deliberately icon-light** — the "icons" are typography and
geometry, not a pictographic set.

- **Logo:** a **hexagonal "UL" monogram** (`assets/logo.png`, white on
  transparent). Use it white on dark; invert to black on light surfaces. Pairs
  with the typeset wordmark as a lockup: `[hex]  CS2_PARSER`. Appears in the
  navbar and footer.
- **Rank-tier emblems:** a set of five **angular cut-corner badges**
  (`assets/rank1–5.svg`) forming a color ramp — **red → amber → yellow → green →
  cyan** — with diagonal "speed" stripes (more stripes = higher tier). These are
  the one sanctioned place colorful accents appear in volume; use them as
  player/team rank emblems (see the leaderboard in the web kit). Each SVG bakes
  its own label/number — treat them as emblem art, don't relabel.
- **Hero key art:** `assets/bg-operators.jpg` — two CS2 operators rendered as a
  white edge-outline on black. Sits behind hero content as a parallax layer
  (mouse + scroll); the near-black field means it needs only a light protection
  gradient on the text side.

- **No icon font / no icon library** is used in the public product. There is no
  Lucide/Heroicons/Font-Awesome dependency in the design guide.
- **Glyphs-as-icons:** the multiplication sign **`✕`** (used as a decorative
  column of crosses in `MagicData`), plus sigils `//`, `[ ]`, `0x`, `#`, `^`,
  and `_` carry all "iconographic" weight. They're set in the mono font.
- **SVG is used for data viz, not icons:** circular progress gauges
  (`<circle>` + animated `strokeDashoffset`), bars, and the AK-47
  **recoil-pattern cursor FX** (orange dots) are drawn with SVG/DOM — these are
  effects, not an icon set.
- **Avatars:** the only `rounded-full` elements; player images or a mono
  initial fallback.
- **Emoji:** **forbidden in the public UI.** The single exception is the
  intentionally off-brand `/admin` dashboard, where 🏆 👥 👤 ⚡ are allowed.
- **Recommendation for new work:** do not introduce a pictographic icon set. If
  a symbol is unavoidable, prefer a mono glyph or a 1px-stroke square SVG that
  matches the brutalist line weight. If you must pull from a CDN, use a
  minimal 1px-stroke set (e.g. Lucide) sparingly and **flag the addition** — it
  is a departure from the established language.

---

## VISUAL EXCEPTION — `/admin`

The admin CRUD screen is **intentionally** the opposite style: light
`bg-gray-50`, white cards with soft shadows, `rounded-lg`, emoji, and
blue/green/purple accents (a standard "Tailwind admin dashboard"). The rules
above **do not apply** there. It is a utility, not a public showcase.

---

## INDEX — what's in this folder

| File / folder | What it is |
|---|---|
| `README.md` | This document — context, content & visual foundations, iconography. |
| `colors_and_type.css` | Color tokens (raw + zinc scale + semantic) and typography scale / element styles. |
| `SKILL.md` | Agent-Skill entry point (for use in Claude Code). |
| `preview/` | Small HTML specimen cards that populate the Design System tab. |
| `assets/` | Brand assets — `logo.png` (hex UL monogram), `bg-operators.jpg` (hero key art), `rank1–5.svg` (rank-tier emblems). |
| `ui_kits/web/` | High-fidelity recreation of the public site (home, leaderboard, player, matches) — `index.html` + JSX components + its own README. |
| `fonts/` | Font notes (Nunito is loaded from Google Fonts; see `fonts/README.md`). |

---

## CAVEATS

- Built from `design.md` only — the `nextapp/` codebase was **not** attached, so
  components are faithful recreations of the *documented* patterns, not 1:1 code
  copies. Re-attach the repo (via Import) for pixel-exact matching.
- No real logos / brand marks were provided; the wordmark in the UI kit is set
  typographically from the brand's own type rules.
- Fonts are loaded from Google Fonts CDN (Nunito is the genuine brand font; mono
  is the system stack) — no local `.woff2` files were bundled.
