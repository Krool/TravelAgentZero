# Travel Agent Zero

A retro-futuristic travel planning companion. Browse and filter roughly 77 curated
destinations, score them against your own preferences with a weighted algorithm,
track per-traveler visit history and ratings, and compare destinations side by side.

Live at **https://krool.github.io/TravelAgentZero/**.

## Tech stack

- Next.js 16 (App Router), static export
- React 19
- Tailwind CSS v4
- Zustand for client state

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Other scripts:

```bash
npm run build   # next build -> static export in ./out, then minifies out/data/*.json
npm run lint    # eslint
```

## Data model

The app is driven by two static JSON files under `public/data/`, fetched client-side
at runtime (see `src/components/layout/AppProvider.tsx`):

- `destinations.json` - the destination catalog: scores (cost, danger, ease with
  child, etc.), best-visit months, flight times per home airport, enriched content
  (neighborhoods, getting around, cost breakdown, highlights), and a few
  hand-seeded flight price curves. All other prices are modelled at runtime by
  `src/lib/pricing.ts`.
- `travelers.json` - two sample travelers with visit history and ratings. They
  load on a first visit but start unselected, so they never shape a new user's
  results until ticked.

Types for both are defined in `src/types/index.ts`, along with the scoring weights
in `src/lib/scoring.ts`.

## Data pipeline

Two scripts under `scripts/` keep `destinations.json` complete and consistent:

```bash
npm run build:data   # scripts/build-data.js - enrich destinations.json
npm run validate      # scripts/validate-data.js - validate the data files
```

- `build:data` fills in flight times for all 25 selectable home airports
  (`AIRPORT_HUBS` in `src/types/index.ts`) and prunes any stored price curve the
  runtime price model reproduces exactly. It's deterministic and idempotent, so
  re-running is safe.
- `validate` checks schema, value ranges, and referential integrity (e.g. traveler
  records referencing real destination ids) across both data files, and exits
  non-zero on any failure. CI runs this before building (see
  `.github/workflows/deploy.yml`).

**Flight times and prices are modelled estimates**, not a live fare feed. They're a
planning aid for relative comparison, not a source of truth for booking.

## Build / static export

```bash
npm run build
```

`next.config.ts` sets `output: 'export'`, so this produces a fully static site in
`app/out` (no Node server required to serve it).

### basePath gotcha

In production builds (`NODE_ENV=production`), `next.config.ts` sets `basePath` and
`assetPrefix` to `/TravelAgentZero`, because the export is served from
`https://krool.github.io/TravelAgentZero/`. This means:

- Opening `out/index.html` directly from disk will 404 on assets.
- Serving `out/` at a domain root (rather than under `/TravelAgentZero/`) will also
  404 on assets.

To preview a production build locally, serve the `out/` directory under a
`/TravelAgentZero` path, or temporarily build without `NODE_ENV=production`.

## Deploy

Deployment is automated: pushing to `main` triggers
`.github/workflows/deploy.yml`, which validates the data, builds the static export,
and publishes it to GitHub Pages.

Live site: **https://krool.github.io/TravelAgentZero/**
