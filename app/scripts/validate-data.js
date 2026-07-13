// validate-data.js - schema/range/referential checks for the shipped datasets.
//
// Runs in CI before `next build` (see .github/workflows/deploy.yml). Exits
// non-zero on any violation so bad data can never reach production silently.
//
// Usage: node scripts/validate-data.js

const fs = require('fs');
const path = require('path');

// Keep in sync with src/types/index.ts.
const AIRPORTS = [
  'JFK', 'LAX', 'ORD', 'SFO', 'MIA', 'DEN', 'SEA', 'ATL',
  'LHR', 'CDG', 'FRA', 'AMS', 'MAD', 'FCO',
  'NRT', 'PEK', 'SIN', 'DXB', 'HKG', 'ICN', 'BKK',
  'SYD', 'MEL', 'GRU', 'EZE',
];
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const CLIMATES = ['Hot', 'Cold', 'Temperate', 'Mix'];
const TYPES = ['Urban', 'Nature', 'Mix'];
const REGIONS = [
  'North America', 'Central America', 'South America', 'Caribbean',
  'Western Europe', 'Eastern Europe', 'Northern Europe', 'Southern Europe',
  'Middle East', 'Central Asia', 'South Asia', 'Southeast Asia', 'East Asia',
  'Africa', 'Oceania',
];
const REQUIRED_STRINGS = ['id', 'name', 'itinerarySummary', 'considerations', 'visaRequirements', 'bestTimeDescription'];
const SCORE_FIELDS = ['easeWithChild', 'urgency', 'danger', 'cost'];

const dataDir = path.join(__dirname, '..', 'public', 'data');
const errors = [];
const err = (msg) => errors.push(msg);

// --- Destinations ---------------------------------------------------------
const destinations = JSON.parse(fs.readFileSync(path.join(dataDir, 'destinations.json'), 'utf8'));
if (!Array.isArray(destinations)) throw new Error('destinations.json is not an array');

const ids = new Set();
const names = new Set();

for (const d of destinations) {
  const tag = d && d.id ? d.id : JSON.stringify(d).slice(0, 40);

  for (const key of REQUIRED_STRINGS) {
    if (typeof d[key] !== 'string' || d[key].trim() === '') err(`[${tag}] missing/empty string field "${key}"`);
  }
  if (ids.has(d.id)) err(`duplicate id "${d.id}"`);
  ids.add(d.id);
  if (names.has(d.name)) err(`duplicate name "${d.name}"`);
  names.add(d.name);

  if (!Array.isArray(d.countries) || d.countries.length === 0) err(`[${tag}] countries must be a non-empty array`);
  if (!CLIMATES.includes(d.climate)) err(`[${tag}] invalid climate "${d.climate}"`);
  if (!TYPES.includes(d.type)) err(`[${tag}] invalid type "${d.type}"`);
  if (!REGIONS.includes(d.region)) err(`[${tag}] invalid region "${d.region}"`);
  if (typeof d.duration !== 'number' || d.duration <= 0) err(`[${tag}] duration must be a positive number`);

  for (const f of SCORE_FIELDS) {
    if (typeof d[f] !== 'number' || d[f] < 0 || d[f] > 10) err(`[${tag}] ${f} out of range 0-10: ${d[f]}`);
  }

  // bestMonths: every month present and strictly 0 or 1.
  for (const m of MONTHS) {
    if (d.bestMonths[m] !== 0 && d.bestMonths[m] !== 1) err(`[${tag}] bestMonths.${m} must be 0 or 1, got ${d.bestMonths[m]}`);
  }

  // flightTimes: full 25-airport coverage, each a sane number of hours.
  for (const a of AIRPORTS) {
    const v = d.flightTimes[a];
    if (typeof v !== 'number' || v < 0 || v > 30) err(`[${tag}] flightTimes.${a} missing/out-of-range: ${v}`);
  }

  // Enriched content: required for every destination since the 2026-07 content
  // pass, and shape-checked so a partial entry can't crash the detail page.
  if (!Array.isArray(d.highlights) || d.highlights.length === 0 || d.highlights.some((h) => typeof h !== 'string' || !h.trim())) {
    err(`[${tag}] highlights must be a non-empty array of strings`);
  }
  if (!Array.isArray(d.neighborhoods) || d.neighborhoods.length === 0) {
    err(`[${tag}] neighborhoods must be a non-empty array`);
  } else {
    for (const n of d.neighborhoods) {
      if (typeof n.name !== 'string' || typeof n.description !== 'string' || !Array.isArray(n.bestFor)) {
        err(`[${tag}] neighborhood entries need name, description, bestFor[]`);
      }
    }
  }
  if (!d.gettingAround || typeof d.gettingAround.summary !== 'string' || !Array.isArray(d.gettingAround.options) || d.gettingAround.options.length === 0) {
    err(`[${tag}] gettingAround needs summary and non-empty options[]`);
  } else {
    for (const o of d.gettingAround.options) {
      if (typeof o.type !== 'string' || typeof o.description !== 'string') {
        err(`[${tag}] gettingAround option entries need type and description`);
      }
    }
  }
  const cb = d.costBreakdown;
  if (!cb || !cb.accommodation || !cb.meals || typeof cb.activities !== 'string' || typeof cb.transport !== 'string') {
    err(`[${tag}] costBreakdown needs accommodation, meals, activities, transport`);
  } else {
    for (const grp of ['accommodation', 'meals']) {
      for (const tier of ['budget', 'mid', 'luxury']) {
        if (typeof cb[grp][tier] !== 'string' || !cb[grp][tier].trim()) err(`[${tag}] costBreakdown.${grp}.${tier} missing`);
      }
    }
    if (cb.tips != null && (!Array.isArray(cb.tips) || cb.tips.some((t) => typeof t !== 'string'))) {
      err(`[${tag}] costBreakdown.tips must be an array of strings`);
    }
  }

  // imageUrl: every destination ships a verified image.
  if (typeof d.imageUrl !== 'string' || !d.imageUrl.startsWith('https://')) {
    err(`[${tag}] imageUrl missing or not https`);
  }

  // coordinates: required for the pin board map.
  const co = d.coordinates;
  if (!co || typeof co.lat !== 'number' || typeof co.lng !== 'number' ||
      co.lat < -90 || co.lat > 90 || co.lng < -180 || co.lng > 180) {
    err(`[${tag}] coordinates missing or out of range`);
  }

  // avgFlightPrices: full 25-airport coverage, each a full 12-month curve.
  if (!d.avgFlightPrices) {
    err(`[${tag}] avgFlightPrices missing`);
  } else {
    for (const a of AIRPORTS) {
      const curve = d.avgFlightPrices[a];
      if (!curve) { err(`[${tag}] avgFlightPrices.${a} missing`); continue; }
      for (const m of MONTHS) {
        if (typeof curve[m] !== 'number' || curve[m] <= 0) err(`[${tag}] avgFlightPrices.${a}.${m} invalid: ${curve[m]}`);
      }
    }
  }
}

// --- Travelers ------------------------------------------------------------
const travelers = JSON.parse(fs.readFileSync(path.join(dataDir, 'travelers.json'), 'utf8'));
if (!Array.isArray(travelers)) throw new Error('travelers.json is not an array');

for (const t of travelers) {
  if (typeof t.id !== 'string' || t.id.trim() === '') err(`traveler missing id`);
  if (typeof t.name !== 'string' || t.name.trim() === '') err(`[${t.id}] traveler missing name`);
  if (typeof t.isChild !== 'boolean') err(`[${t.id}] traveler.isChild must be boolean`);
  for (const [destId, data] of Object.entries(t.destinations || {})) {
    if (!ids.has(destId)) err(`[${t.id}] references unknown destination "${destId}"`);
    if (typeof data.hasVisited !== 'boolean') err(`[${t.id}] ${destId}.hasVisited must be boolean`);
    if (typeof data.rating !== 'number' || data.rating < 0 || data.rating > 10) err(`[${t.id}] ${destId}.rating out of range: ${data.rating}`);
  }
}

// --- Report ---------------------------------------------------------------
if (errors.length) {
  console.error(`validate-data: FAILED with ${errors.length} error(s):`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log(`validate-data: OK - ${destinations.length} destinations, ${travelers.length} travelers, all 25 airports covered.`);
