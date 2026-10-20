import { AIRPORT_HUBS, AirportCode, Destination, MonthlyPricing, MONTHS_ORDERED } from '@/types';

// Modelled flight prices. destinations.json stores only the hand-seeded curves
// (avgFlightPrices overrides); every other airport is computed here from cost,
// flight time and season. These are planning estimates, not fares.
//
// Keep this model in sync with modelPriceCurve() in scripts/build-data.js,
// which uses it to decide which stored curves are redundant.

function modelPriceCurve(destination: Destination, airport: AirportCode): MonthlyPricing {
  const costBase = 400 + destination.cost * 100;
  const flightHours = destination.flightTimes[airport] ?? 12;
  // Distance-scaled base: a local hop ~0.65x, a 20h haul ~1.65x.
  const base = Math.round(costBase * (0.65 + flightHours / 20));

  const curve = {} as MonthlyPricing;
  MONTHS_ORDERED.forEach((month, index) => {
    let multiplier = 1.0;
    if (index >= 5 && index <= 7) multiplier = 1.3;      // Jun-Aug
    if (index === 11) multiplier = 1.4;                  // December
    if (index === 0 || index === 1) multiplier = 0.85;   // Jan-Feb
    if (destination.bestMonths[month] === 1) multiplier *= 1.15; // in-season premium
    curve[month] = Math.round(base * multiplier);
  });
  return curve;
}

/** Estimated round-trip price per month from one home airport. */
export function getFlightPrices(destination: Destination, airport: AirportCode): MonthlyPricing {
  return destination.avgFlightPrices?.[airport] ?? modelPriceCurve(destination, airport);
}

/** Estimated prices from every selectable home airport. */
export function getAllFlightPrices(destination: Destination): Record<AirportCode, MonthlyPricing> {
  const all = {} as Record<AirportCode, MonthlyPricing>;
  for (const code of Object.keys(AIRPORT_HUBS) as AirportCode[]) {
    all[code] = getFlightPrices(destination, code);
  }
  return all;
}
