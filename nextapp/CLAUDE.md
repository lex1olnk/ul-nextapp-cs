# CLAUDE.md

Guidance for working in this repository.

## Overview

CS2 Fastcup leaderboard & player-stats web app (`cs-stats`). Renders player
search, leaderboards, per-player stats and a match table. Most aggregated player
data is served by an **external backend** (`https://ul-backend.vercel.app/`),
while a local Postgres DB (via Prisma) holds the normalized match/round/kill
data and is exposed through local route handlers.

Live: [ulmixcup.ru](https://ulmixcup.ru)

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript 5**
- **Tailwind CSS 4** (via `@tailwindcss/postcss`)
- **Prisma** → **Postgres** (`DATABASE_URL`)
- **axios** for HTTP

## Commands

```bash
npm run dev      # next dev (localhost:3000)
npm run build    # next build
npm run start    # next start (production)
npm run lint     # next lint
```

Prisma:
```bash
npx prisma generate      # regenerate client (default node_modules/@prisma/client)
npx prisma migrate dev   # apply migrations in dev
npx prisma studio        # inspect the DB
```

## Two data sources — important

There are **two distinct "API" layers**; don't confuse them.

1. **External backend** — `src/lib/api.ts` exports an axios instance whose
   `baseURL` is hardcoded to `https://ul-backend.vercel.app/` (`getBaseUrl()`).
   Files that call `api.get`/`api.post` against paths like `/api/players`,
   `/api/matches`, `/api/player/:id/matches` are hitting **that remote server**,
   not local route handlers. These callers are already server-side: they live in
   Server Components (e.g. `src/app/page.tsx`) or files marked `"use server"`
   (e.g. `src/app/matches/api.ts`, `src/app/upload/api.ts`,
   `src/app/player/[id]/api.ts`). They are thin proxies and cannot be "moved" to
   local Server Actions — the data lives on the remote backend.

2. **Local route handlers** — `src/app/api/**/route.ts` talk to the **local
   Postgres** via Prisma (`src/lib/services/matchesService.ts`). Currently the
   only one is `src/app/api/matches/route.ts` (GET).

> When asked to convert "API to Server Actions", only category (2) is a real
> candidate. Category (1) is already server code proxying a remote service.

## Architecture

### Local database (Prisma)
- Schema: `prisma/schema.prisma`. Generator is `prisma-client-js`; datasource
  reads `DATABASE_URL` from env. Run `npx prisma generate` after schema changes.
- Always import the shared client from **`src/lib/prisma.ts`** (singleton that
  guards against connection storms in dev). Do not `new PrismaClient()`
  elsewhere; `matchesService.ts` already uses the shared instance.
- DB access is wrapped in **service classes** under `src/lib/services/`
  (`MatchesService`) with DTOs in `src/lib/services/dto/`.
- Models: `Tournament` (+ `TournamentTeam`, `TournamentParticipant`), `Match` →
  `MatchMap` → `Round`; per-event tables `MatchKill`, `MatchDamage`,
  `MatchClutch`, `MatchGrenade`; `MatchTeam`/`MatchMember`/`MatchTeamMapStat`;
  `User`/`Profile`; `Map`, `Weapon`. Table names are snake_case via `@@map`;
  fields use `@map`.

### Routing & UI
- App Router under `src/app/`: `/` (player search/leaderboard — `page.tsx`),
  `/matches`, `/player/[id]`, `/upload`.
- Pages that need data are **async Server Components** calling colocated
  `api.ts` helpers (`src/app/matches/api.ts`, `src/app/player/[id]/api.ts`,
  `src/app/upload/api.ts`). These helpers are `"use server"` and hit the remote
  backend.
- Shared components in `src/components/` (`player/`, `matches/`, `tournaments/`,
  plus top-level `Navbar`, `SearchComponent`, `Select`, `table`).
- Types live in `src/types/types.ts`; misc helpers in `src/lib/utils.ts`.
- Caching is set per-route via segment config: `export const revalidate = ...`
  on pages, and `cache: 'no-store'` on individual `fetch` calls.

## Conventions

- Use the `@/*` path alias for `src/*` imports.
- Data-fetch helpers swallow errors and return an empty array/value (e.g.
  `return []`) rather than throwing, so pages render without data on failure.
  Match this pattern when adding new fetchers.
- Local route handlers return `NextResponse.json(...)`.
- Existing code comments and the README are largely in **Russian**; match the
  surrounding language when editing a file.
- `next.config.ts` only configures remote image hosts (`cdn.fastcup.net`,
  `*.faceit-cdn.net`). Add any new external image domain there.

## Environment variables

- `DATABASE_URL` — local Postgres connection string (required for Prisma).
- External backend base URL is currently **hardcoded** in `src/lib/api.ts`
  (`https://ul-backend.vercel.app/`), not env-driven.
