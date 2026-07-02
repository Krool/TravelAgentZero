// build-data.js - reproducible enrichment pass for destinations.json
//
// Fills flight-time and average-price coverage for ALL 25 selectable home
// airports (AIRPORT_HUBS in src/types/index.ts). The raw dataset historically
// only carried 15 airports of flight times and 3 airports of prices, which
// silently broke filtering/scoring for the other home-airport choices.
//
// Flight times and prices are MODELLED ESTIMATES, consistent with how the
// original 15 airports were seeded - this is a planning aid, not a fare feed.
// The script is deterministic and idempotent: existing values are preserved,
// only missing airports are added, so re-running is safe.
//
// Usage:  node scripts/build-data.js
// Verify: node scripts/validate-data.js

const fs = require('fs');
const path = require('path');

// Keep this list in sync with AirportCode in src/types/index.ts.
const ALL_AIRPORTS = [
  'JFK', 'LAX', 'ORD', 'SFO', 'MIA', 'DEN', 'SEA', 'ATL',       // North America
  'LHR', 'CDG', 'FRA', 'AMS', 'MAD', 'FCO',                     // Europe
  'NRT', 'PEK', 'SIN', 'DXB', 'HKG', 'ICN', 'BKK',             // Asia / Middle East
  'SYD', 'MEL',                                                 // Oceania
  'GRU', 'EZE',                                                 // South America
];

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

// The 15 airports the original dataset already carried flight times for.
const BASE_AIRPORTS = ['JFK', 'LAX', 'ORD', 'SFO', 'LHR', 'CDG', 'FRA', 'AMS', 'NRT', 'PEK', 'SIN', 'DXB', 'HKG', 'SYD', 'GRU'];

// Each of the 10 newer airports is modelled off the nearest existing hub,
// with a small hour offset that can be tuned per destination region. `localFor`
// marks destinations the airport's own city sits in (flight time 0 = "you're
// basically there", matching the existing sentinel convention). `localHop` is
// used when the reference hub itself is 0 for that destination (a short
// same-region hop rather than a copied 0).
const NEW_AIRPORTS = {
  MIA: { ref: 'JFK', delta: 1, byRegion: { 'South America': -2, 'Caribbean': -2, 'Central America': -1 }, localHop: 3 },
  DEN: { ref: 'ORD', delta: 1, byRegion: { 'East Asia': -1, 'Oceania': -1, 'Southeast Asia': -1 }, localHop: 3 },
  SEA: { ref: 'SFO', delta: 0, byRegion: { 'East Asia': -1, 'Northern Europe': -1 }, localHop: 3 },
  ATL: { ref: 'JFK', delta: 1, byRegion: { 'South America': -1, 'Caribbean': -1, 'Central America': -1 }, localHop: 3 },
  MAD: { ref: 'CDG', delta: 0, byRegion: { 'South America': -2, 'Africa': -1, 'Caribbean': -1 }, localHop: 2, localFor: ['spain-barcelona-madrid'] },
  FCO: { ref: 'FRA', delta: 0, byRegion: { 'Middle East': -1, 'Africa': -1 }, localHop: 2, localFor: ['rome-italy'] },
  ICN: { ref: 'NRT', delta: 0, byRegion: {}, localHop: 3, localFor: ['south-korea'] },
  BKK: { ref: 'SIN', delta: 1, byRegion: { 'South Asia': -1, 'East Asia': -1 }, localHop: 3, localFor: ['thailand'] },
  MEL: { ref: 'SYD', delta: 1, byRegion: {}, localHop: 2 },
  EZE: { ref: 'GRU', delta: 1, byRegion: { 'South America': -1 }, localHop: 2, localFor: ['argentina-patagonia'] },
};

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

function fillFlightTimes(dest) {
  const ft = { ...dest.flightTimes };
  for (const [code, cfg] of Object.entries(NEW_AIRPORTS)) {
    if (ft[code] != null) continue; // preserve any existing value
    if (cfg.localFor && cfg.localFor.includes(dest.id)) {
      ft[code] = 0;
      continue;
    }
    const refVal = ft[cfg.ref];
    if (refVal == null) continue; // no reference hub to model from
    if (refVal === 0) {
      ft[code] = cfg.localHop;
    } else {
      const offset = cfg.byRegion[dest.region] ?? cfg.delta;
      ft[code] = clamp(Math.round(refVal + offset), 1, 28);
    }
  }
  return ft;
}

// Seasonal price curve: summer + December cost more, deep winter costs less,
// and in-season months carry a premium. Mirrors the original price model.
function generatePriceCurve(basePrice, bestMonths) {
  const prices = {};
  MONTHS.forEach((month, index) => {
    let multiplier = 1.0;
    if (index >= 5 && index <= 7) multiplier = 1.3;      // Jun-Aug
    if (index === 11) multiplier = 1.4;                  // December
    if (index === 0 || index === 1) multiplier = 0.85;   // Jan-Feb
    if (bestMonths[month] === 1) multiplier *= 1.15;     // in-season premium
    prices[month] = Math.round(basePrice * multiplier);
  });
  return prices;
}

function fillPrices(dest, flightTimes) {
  const prices = { ...(dest.avgFlightPrices || {}) };
  const costBase = 400 + dest.cost * 100;
  for (const code of ALL_AIRPORTS) {
    if (prices[code]) continue; // keep existing curves (JFK/LAX/SFO)
    const fh = flightTimes[code] ?? 12;
    // Distance-scaled base: a local hop ~0.65x, a 20h haul ~1.65x.
    const base = Math.round(costBase * (0.65 + fh / 20));
    prices[code] = generatePriceCurve(base, dest.bestMonths);
  }
  // Emit in a stable airport order for clean diffs.
  const ordered = {};
  for (const code of ALL_AIRPORTS) if (prices[code]) ordered[code] = prices[code];
  return ordered;
}

const filePath = path.join(__dirname, '..', 'public', 'data', 'destinations.json');
const destinations = JSON.parse(fs.readFileSync(filePath, 'utf8'));

let flightAdds = 0;
let priceAirportsAdded = 0;

const updated = destinations.map((dest) => {
  const beforeFt = Object.keys(dest.flightTimes).length;
  const flightTimes = fillFlightTimes(dest);
  flightAdds += Object.keys(flightTimes).length - beforeFt;

  const beforePrices = Object.keys(dest.avgFlightPrices || {}).length;
  const avgFlightPrices = fillPrices(dest, flightTimes);
  priceAirportsAdded += Object.keys(avgFlightPrices).length - beforePrices;

  return { ...dest, flightTimes, avgFlightPrices };
});

fs.writeFileSync(filePath, JSON.stringify(updated, null, 2) + '\n');
console.log(
  `build-data: ${updated.length} destinations | +${flightAdds} flight-time entries | +${priceAirportsAdded} price-airport curves`
);
