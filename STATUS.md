# Status

As of 2026-10-20.

MVP is shipped and live on GitHub Pages: https://krool.github.io/TravelAgentZero/

## Recently done

Review pass (2026-10-20):

- **Bugs**: sample travelers no longer auto-selected on first visit (they were
  filtering and scoring a new user's results); "Reset" keeps favorites, compare
  list, traveler selection and home airport; Escape now closes the help modal and
  mobile filters (`'escape'` never matched); mobile filter dialog traps focus and
  locks scroll; score badge background/border fixed (hex-alpha on a CSS var was
  invalid); persisted preferences deep-merge with defaults; local (0h) flights no
  longer sort last; favorite/compare buttons moved out of the card `<a>`.
- **Scoring**: month is graded (shoulder month = half), safety scales with risk,
  flight time weighs 12 (was 5), new-place bonus only varies when "New Places
  Only" is off. Weights exported and still sum to 100.
- **Usability**: default month = current month, sound off by default and no
  hover sounds, labels tied to selects/sliders, visible focus on sliders and
  toggles, single trip length selectable, one search box, search not persisted,
  "Risk" filter chip, "Matches: X of 108", "(US passport)" on the visa filter,
  notes included in export/import.
- **Data/bloat**: modelled price curves (2,483 of 2,700) removed from the JSON
  and computed at runtime; shipped JSON minified at build. destinations.json
  1.26MB -> 525KB source / 367KB shipped. Fonts self-hosted via next/font. ~310
  lines of dead CSS, 9 unused icons, and ~200 lines of dead code removed. The 5
  premature ETIAS notes removed (launch still unconfirmed).

Earlier review/modernization pass (2026-07-01):

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
- **Known, deferred items**:
  - `destinations.json` (367KB shipped) is still fetched eagerly and gates every
    page, including `/privacy` and `/settings`; destination pages export as a
    "Loading" shell. Next step: split a list payload (card + scoring fields)
    from per-destination detail (`neighborhoods`, `gettingAround`,
    `costBreakdown`, ~189KB) and render detail into the static HTML.
  - `visaRequirements` is US-passport free text; restructure to
    `{status, days, note, verifiedAt}` so it can be dated and filtered.
  - Regional coverage is US-heavy (21 of 108); thin on Central Asia, Caribbean,
    Oceania, West/North Africa.
  - Home-page filters/sort/view are not in the URL.
  - `worldDots.ts` is 44KB with no generator in the repo.
  - `og-preview.png` is 243KB, larger than necessary for an OG image.
