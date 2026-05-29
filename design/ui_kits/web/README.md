# UI Kit — Public Web

High-fidelity, click-through recreation of the **CS2 Parser Stats** public site,
built from `design.md`. React + Babel (in-browser), no build step. Open
`index.html`.

## Views (fake router in `App.jsx`)
- **Home** — full-height hero with `// SELECT_EVENT` tournament toggles + live
  `Event_Details` panel, then the `History.exe` match list.
- **Matches** — `Match_Center`: 8-col match feed + 4-col technical sidebar +
  dashed "awaiting signal" empty slot.
- **Leaderboard** — `Top_Performers` 12-col table; ghost rank numerals, animated
  rating bars, hover-inversion rows. Click a row → player.
- **Player** — profile card with corner ticks, stat grid w/ TOP badges, two-tone
  clutch bar, orange opening-duels bar, SVG `Entry_Success` gauge.

The hidden **Navbar** slides down on hover (mouse to the top edge) — that's the
real product behavior.

## Full homepage — `homepage.html`
A single scrolling landing page assembled from the components: sticky header
(with logo lockup), parallax hero (operators key art + mouse/scroll depth),
stat band, `Team_Assembly` draft grid, `Top_Performers` preview (with the
red→cyan **rank-tier emblems**), `History.exe` match feed, cinematic data block,
and footer. `HomeHero.jsx` + `HomeSections.jsx` hold the sections; `Parallax.jsx`
drives the depth (waits for React to mount, respects `prefers-reduced-motion`).
Assets live in `ui_kits/web/assets/`.

## Files
| File | Role |
|---|---|
| `index.html` | Loads fonts, React/Babel, all scripts, mounts `#root`. |
| `web.css` | All kit styling (tokens + classes + hover-inversion). |
| `Primitives.jsx` | `Cap`, `Fade`, `Watermark`, `Button`, `Choice`, `Chip`, `Badge`, `Status`, `SplitTitle`, `ProgressBar`, `Gauge`, `EmptyState`. |
| `Data.jsx` | Mock tournaments / players / matches (`window.CS2DATA`). |
| `Navbar.jsx` · `HomeView.jsx` · `MatchesView.jsx` · `LeaderboardView.jsx` · `PlayerView.jsx` | The chrome + screens. |
| `App.jsx` | View state, navigation, mount. |

Each component file exports onto `window` (Babel scripts don't share scope).

## Notes / fidelity
- Recreated from the **documented patterns** in `design.md`; the original
  `nextapp/` source was not attached. framer-motion is approximated with small
  CSS fade/slide-in transitions. The home page's horizontal-scroll composition
  and the AK-47 `RecoilPattern` cursor FX are **not** reproduced here (they're
  bespoke hero effects) — the rest of the language is faithful.
- All data is fake.
