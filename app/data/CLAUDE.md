# Data - agent notes

`app/data/` holds the source of truth. Nothing here is served directly.

- `destinations.json` - every destination, full record (types in
  `src/types/index.ts`, `Destination`).
- `visas.json` - entry rules per country x passport (US GB CA AU DE).
- `../public/data/travelers.json` - sample travelers, served as-is.

## What ships, and how

- `scripts/build-index.js` runs before `npm run dev` and `npm run build`
  (npm `pre*` hooks). It writes `public/data/destinations-index.json`
  (gitignored): every record minus the detail-only fields (`DETAIL_KEYS`, kept
  in sync with `DestinationDetailKey` in types), plus `entryStatus` - the most
  restrictive visa status per passport across the trip's countries.
- The browser fetches only that index (`AppProvider.tsx`). Detail pages read the
  full record and that destination's visa rules at build time
  (`src/app/destination/[id]/page.tsx`, `src/lib/visaData.server.ts`) and pass
  them as props, so their content is in the static HTML. `visas.json` never
  ships to the browser.
- The store rehydrates from localStorage in an effect (`skipHydration`), so the
  first client render matches the static HTML. Anything that depends on saved
  preferences must wait for `hydrated` (or `isLoaded` for the catalog) or React
  reports a hydration mismatch.

## Adding or editing a destination

- Ship the full enriched schema: `highlights`, `neighborhoods`, `gettingAround`,
  `costBreakdown`, and a verified Unsplash `imageUrl` (`w=800&h=600` crop; the
  UI derives the hero size). The validator requires all of these.
- Include `flightTimes` for the 15 base airports (JFK LAX ORD SFO LHR CDG FRA
  AMS NRT PEK SIN DXB HKG SYD GRU); `scripts/build-data.js` fills the other 10.
  Deterministic and idempotent - safe to re-run.
- Every entry in `countries` must be a key in `visas.json` (validator checks).
  Hong Kong is its own country there, separate from mainland China.
- Flight prices are computed at runtime by `src/lib/pricing.ts`.
  `avgFlightPrices` holds only hand-seeded overrides; `build-data.js` prunes any
  curve the model reproduces. The model is duplicated in `build-data.js`
  (`modelPriceCurve`) - change both together. Read prices via
  `getFlightPrices()`.
- Run `npm run validate` (gates CI) and `npm run build:data`.

## Freshness

- Flight times and prices are modelled estimates, not fares. Neighborhood and
  cost content is editorial (2026-07, 15 records added 2026-10).
- `visas.json` was compiled 2026-10-20 from official sources where reachable;
  its `uncertain` list names what could not be confirmed (several rules expire
  2026-12-31: China's visa-free list, Korea's K-ETA exemption, Mongolia).
  The validator warns once `verifiedAt` is over a year old. Re-audit, update
  `verifiedAt`, and re-check every `source` link is the real government site
  (lookalike visa sites are common; Madagascar's link was left out for that
  reason).
- ETIAS is not modelled as required until the EU scheme actually launches.
