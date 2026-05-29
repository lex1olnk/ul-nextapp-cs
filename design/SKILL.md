---
name: cs2-parser-stats-design
description: Use this skill to generate well-branded interfaces and assets for CS2 Parser Stats (a Counter-Strike 2 tournament & player statistics site), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping. The aesthetic is brutalist + terminal + tech-magazine — monochrome (black/white/zinc) with orange accents, aggressive italic display type, and mono "system-log" captions.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Where things are
- `README.md` — context, content fundamentals, visual foundations, iconography, exceptions, index.
- `colors_and_type.css` — color tokens (raw + zinc scale + semantic) and the typography scale / element styles. Import or copy these vars.
- `fonts/README.md` — Nunito (Google Fonts, the real brand sans) + system mono.
- `preview/` — small specimen cards for every foundation/component.
- `ui_kits/web/` — a working React recreation of the public site (hero, leaderboard, player, matches) with reusable primitives.

## Non-negotiables (the short version)
- Background `#0a0a0a`, text white, everything else from the **zinc** scale. Color = accent only (orange `#f97316`, status green/yellow).
- **Square corners always** (only avatars are round). 1px `zinc-900` borders. No soft shadows.
- Headings: Nunito **900 italic, tracking-tighter, uppercase**. Captions: **mono, uppercase, wide tracking**, framed like system logs (`// SYSTEM_LOG`).
- `snake_case` in headings/labels; `[ BRACKETED ]` status codes; key:value, never paragraphs. No emoji (except the off-brand `/admin`).
- Interactive cards/rows **invert to `bg-white text-black` on hover**.
- Generous whitespace, 12-column grid, watermark ghost text in big sections.
