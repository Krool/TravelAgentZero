// build-index.js - writes public/data/destinations-index.json, the payload the
// browser fetches for browsing, filtering and scoring.
//
// data/destinations.json is the source of truth. The index adds a per-passport
// entryStatus from data/visas.json and drops the fields only the detail page
// shows; those are rendered into each destination's
// static HTML at build time instead (src/app/destination/[id]/page.tsx).
// The output is generated (gitignored) and runs automatically before
// `npm run dev` and `npm run build`.
//
// Keep DETAIL_KEYS in sync with DestinationDetailKey in src/types/index.ts.

const fs = require('fs');
const path = require('path');

const DETAIL_KEYS = [
  'neighborhoods',
  'gettingAround',
  'costBreakdown',
  'avgFlightPrices',
  'considerations',
  'bestTimeDescription',
  'urgency',
];

// Least to most restrictive. Keep in sync with ENTRY_RANK in src/lib/visa.ts.
const ENTRY_RANK = ['domestic', 'none', 'eta', 'on-arrival', 'evisa', 'visa'];
const PASSPORTS = ['US', 'GB', 'CA', 'AU', 'DE'];

const src = path.join(__dirname, '..', 'data', 'destinations.json');
const visas = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'visas.json'), 'utf8'));
const outDir = path.join(__dirname, '..', 'public', 'data');
const out = path.join(outDir, 'destinations-index.json');

const destinations = JSON.parse(fs.readFileSync(src, 'utf8'));
const index = destinations.map((d) => {
  const summary = { ...d };
  for (const key of DETAIL_KEYS) delete summary[key];
  // One status per passport: the most restrictive across the trip's countries.
  summary.entryStatus = {};
  for (const passport of PASSPORTS) {
    const ranks = d.countries.map((c) => {
      const rule = visas.countries[c] && visas.countries[c][passport];
      if (!rule) throw new Error(`build-index: data/visas.json has no ${passport} rule for "${c}" (${d.id})`);
      return ENTRY_RANK.indexOf(rule.status);
    });
    summary.entryStatus[passport] = ENTRY_RANK[Math.max(...ranks)];
  }
  return summary;
});

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(out, JSON.stringify(index));
console.log(`build-index: ${index.length} destinations -> ${path.relative(process.cwd(), out)} (${fs.statSync(out).size} bytes)`);
