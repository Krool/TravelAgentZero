# Travel Agent Zero - agent notes

Retro-futuristic travel planner. Next.js 16 (App Router) + React 19 + Tailwind v4 +
Zustand, statically exported and hosted on GitHub Pages. All app code lives under
`app/`; run every command below from there, not the repo root.

## Commands (run from `app/`)

- `npm run dev` - local dev server
- `npm run build` - `next build`, static export to `app/out`
- `npm run lint` - eslint
- `npm run validate` - `node scripts/validate-data.js`, checks `public/data/*.json`
- `npm run build:data` - `node scripts/build-data.js`, enriches `destinations.json`
- `npm run deploy` - local helper only (`next build` + writes `out/.nojekyll`); it
  does not publish anything. The real deploy path is CI (below).

## Deploy

Push to `main` triggers `.github/workflows/deploy.yml`: installs deps, runs
`node scripts/validate-data.js`, runs `npm run build`, then publishes `app/out` to
GitHub Pages. Live at **https://krool.github.io/TravelAgentZero/**. No manual
deploy step exists or should be added without approval.

## Static export + basePath - two places to update

`app/next.config.ts` sets `basePath`/`assetPrefix` to `/TravelAgentZero` only when
`NODE_ENV=production`, because the export is served from
`https://krool.github.io/TravelAgentZero/`. Opening `out/index.html` from disk, or
serving `out/` at a domain root, 404s on assets.

`app/src/components/layout/AppProvider.tsx` independently hardcodes the same
`/TravelAgentZero` basePath string to fetch `public/data/*.json` client-side at
runtime. **If this repo is ever renamed, both places need updating** - the
`next.config.ts` constant and the `AppProvider.tsx` constant are not shared.

## Data pipeline

`app/public/data/destinations.json` and `travelers.json` are the source of truth,
fetched client-side by `AppProvider.tsx`. Types are in `app/src/types/index.ts`.

- 95 destinations. Every record carries the full enriched schema: `highlights`,
  `neighborhoods`, `gettingAround`, `costBreakdown`, and a verified `imageUrl`
  (Unsplash, `w=800&h=600` crop - the UI derives the hero size from it). The
  validator requires all of these, so a new destination must ship them.
- A new destination must also include `flightTimes` for the 15 base airports
  (JFK LAX ORD SFO LHR CDG FRA AMS NRT PEK SIN DXB HKG SYD GRU);
  `scripts/build-data.js` fills the other 10 airports and all price curves.
  Deterministic and idempotent - safe to re-run.
- `scripts/validate-data.js` checks schema, ranges, enriched-content shape, and
  referential integrity (traveler destination ids must exist in
  `destinations.json`). Gates CI; exits non-zero on failure.
- Flight times and prices are **modelled estimates**, not a live fare feed.
  Neighborhood/cost content is editorial, written 2026-07; prices are ballpark.

## Repo map

- Routes: `/` (browse + filter + score), `/destination/[id]` (detail page),
  `/travelers` (traveler profiles / visit history), `/settings`. There is **no**
  `/compare` or `/itinerary` route - comparison is an in-page
  `ComparePanel`/`CompareTable` (`app/src/components/ComparePanel.tsx`,
  `CompareTable.tsx`), not a separate page.
- Scoring algorithm and weights: `app/src/lib/scoring.ts`.
- Shared types (`Destination`, `Traveler`, `UserPreferences`, `AirportCode`, etc.):
  `app/src/types/index.ts`.
- `PLAN.md` (repo root) is the original planning doc from the initial build and has
  diverged from the shipped app - see its banner.
