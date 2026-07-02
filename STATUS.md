# Status

As of 2026-07-01.

MVP is shipped and live on GitHub Pages: https://krool.github.io/TravelAgentZero/

## Recently done

A review/modernization pass (2026-07-01) covering:

- **Airport data** backfilled from 15 to all 25 selectable home airports (flight
  times and average flight prices) via the new reproducible
  `app/scripts/build-data.js`. Values are modelled estimates. Fixed the sentinel
  `0` ("home hub") being mis-scored as a 15h flight.
- **Data validation** added (`app/scripts/validate-data.js`), now gating CI
  before build.
- **Privacy**: personal traveler data pseudonymized (JSON + source CSVs); GA now
  loads production-only behind a Consent Mode banner (default denied), events are
  PII-free, added a `/privacy` page. SPA `page_view` tracking added.
- **Correctness fixes**: dead share-link decoding wired up, "Best Months"
  render, stale compare/favorite reconciliation, duplicate-traveler feedback,
  `AppProvider` response/shape guards.
- **Cleanup**: removed unused `howler` + `framer-motion` deps, rewrote `useSound`
  to a pure Web Audio singleton, deleted default template SVGs and dead
  code/fields, fixed the non-cross-platform `deploy` script.
- Docs refreshed (README, CLAUDE.md, this file, PLAN.md historical banner).

## Open / not built

- **LLM itinerary generation** - planned in `PLAN.md` (day-by-day AI itinerary
  output, prompt export) but never built. No `/itinerary` route or prompt
  generator exists.
- **Content enrichment gap** - `neighborhoods`, `gettingAround`, and
  `costBreakdown` fields exist in the schema but are only populated for 3 of the
  77 destinations (`rome-italy`, `japan`, `iceland`). Per-destination content
  backfill for the remaining 74 is outstanding.
- **Known, deferred performance items** (now the top follow-up):
  - `destinations.json` is fetched eagerly client-side and blocks first paint.
    Full 25-airport price backfill grew it to ~624KB raw (~66KB gzip over the
    wire). Recommended fix: split a lightweight list payload from the
    per-destination price/detail payload, or lazy-load prices on the Costs tab.
  - Google Fonts are loaded via a render-blocking `@import` (switch to
    `next/font`).
  - `og-preview.png` is 243KB, larger than necessary for an OG image.
