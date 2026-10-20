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

Source data lives in `data/` and is never served directly:

- `data/destinations.json` - the destination catalog: scores (cost, danger, ease
  with child, etc.), best-visit months, flight times per home airport, enriched
  content (neighborhoods, getting around, cost breakdown, highlights), and a few
  hand-seeded flight price curves. Other prices are modelled at runtime by
  `src/lib/pricing.ts`.
- `data/visas.json` - entry requirements per country for five passports (US, UK,
  Canada, Australia, Germany as the EU stand-in), with a verification date and
  official source links.
- `public/data/travelers.json` - two sample travelers. They load on a first visit
  but start unselected.

`scripts/build-index.js` (run automatically before `dev` and `build`) writes
`public/data/destinations-index.json`, the only catalog the browser fetches: the
list and scoring fields plus a per-passport visa status. Detail pages are built
from the full records at build time, so their content is in the static HTML.

Types are in `src/types/index.ts`; scoring weights in `src/lib/scoring.ts`.

## Data pipeline

```bash
npm run build:data   # scripts/build-data.js - fill flight times, prune modelled prices
npm run validate     # scripts/validate-data.js - validate the data files
```

- `build:data` fills in flight times for all 25 selectable home airports and
  prunes any stored price curve the runtime model reproduces. Deterministic and
  idempotent.
- `validate` checks schema, ranges, visa-table coverage, and referential
  integrity, warns when the visa table is over a year old, and exits non-zero on
  failure. CI runs it before building.

**Flight times and prices are modelled estimates**, not a live fare feed, and
**entry rules change** - the detail page links each country's official source.

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
