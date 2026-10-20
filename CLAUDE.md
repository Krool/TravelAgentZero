# Travel Agent Zero - agent notes

Retro-futuristic travel planner. Next.js 16 (App Router) + React 19 + Tailwind v4 +
Zustand, statically exported and hosted on GitHub Pages. All app code lives under
`app/`; run every command below from there, not the repo root.

## Commands (run from `app/`)

- `npm run dev` - local dev server
- `npm run build` - `next build`, static export to `app/out`. `prebuild` writes
  the browser index (`scripts/build-index.js`); `postbuild` minifies
  `out/data/*.json`
- `npm run lint` - eslint
- `npm run validate` - `node scripts/validate-data.js`, checks `data/*.json` and travelers
- `npm run build:data` - `node scripts/build-data.js`, enriches `data/destinations.json`
- `npm run deploy` - local helper only (`next build` + writes `out/.nojekyll`); it
  does not publish anything. The real deploy path is CI (below).

## Deploy

Push to `main` triggers `.github/workflows/deploy.yml`: installs deps, runs
`node scripts/validate-data.js`, runs `npm run build`, then publishes `app/out` to
GitHub Pages. Live at **https://krool.github.io/TravelAgentZero/**. The real deploy
path is CI.

## Static export + basePath - two places to update

`app/next.config.ts` sets `basePath`/`assetPrefix` to `/TravelAgentZero` only when
`NODE_ENV=production`, because the export is served from
`https://krool.github.io/TravelAgentZero/`. Opening `out/index.html` from disk, or
serving `out/` at a domain root, 404s on assets.

`app/src/lib/utils.ts` has `assetPath()`, which independently hardcodes the
same `/TravelAgentZero` string for all runtime asset URLs (data JSON fetches
in `AppProvider.tsx`, sprite icons under `public/icons/travel/`). **If this
repo is ever renamed, both places need updating** - the `next.config.ts`
constant and the `assetPath()` constant are not shared.

## Data pipeline

Source of truth is `app/data/` (`destinations.json`, `visas.json`); the browser
fetches a generated index, and detail pages are built from the full records.
Details, the hydration rule, and how to add a destination: `app/data/CLAUDE.md`.

## Repo map

- Routes: `/` (browse + filter + score), `/destination/[id]` (detail page),
  `/travelers` (traveler profiles / visit history), `/settings`. Home-page
  filters, sort and view live in the URL query (`src/lib/homeUrlState.ts`). There is **no**
  `/compare` or `/itinerary` route - comparison is an in-page
  `ComparePanel`/`CompareTable` (`app/src/components/ComparePanel.tsx`,
  `CompareTable.tsx`), not a separate page.
- Scoring algorithm and weights: `app/src/lib/scoring.ts`. `WEIGHTS` is exported
  and sums to 100; UI gauges read their maxima from it, so don't hardcode them.
- Shared types (`Destination`, `Traveler`, `UserPreferences`, `AirportCode`, etc.):
  `app/src/types/index.ts`.
- `PLAN.md` (repo root) is the original planning doc from the initial build and has
  diverged from the shipped app - see its banner.
