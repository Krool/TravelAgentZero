import { Destination, UserPreferences, Traveler, MONTHS_ORDERED, hasChildTraveler, BudgetSensitivity } from '@/types';

export interface ScoreBreakdown {
  total: number;
  monthMatch: number;
  newPlace: number;
  personalRating: number;
  childFriendly: number;
  costMatch: number;
  durationMatch: number;
  flightTime: number;
  safetyScore: number;
  climateMatch: number;
  typeMatch: number;
}

// Sums to 100. Exported so the UI reads the maxima instead of hardcoding them.
export const WEIGHTS = {
  monthMatch: 20,      // Good time to visit (half credit in a shoulder month)
  newPlace: 10,        // Nobody selected has been (only varies with "New Places Only" off)
  personalRating: 15,  // Selected travelers' interest rating
  childFriendly: 12,   // If kids coming (auto-detected from travelers)
  costMatch: 10,       // Within budget preference
  durationMatch: 8,    // Fits trip length
  flightTime: 12,      // Shorter = better
  safetyScore: 8,      // Lower risk = better
  climateMatch: 3,     // Matches temperature preference
  typeMatch: 2,        // Matches urban/nature preference
};

/** 1 for a best month, 0.5 for a month next to one (shoulder season), else 0. */
function getMonthFit(destination: Destination, month: UserPreferences['travelMonth']): number {
  if (destination.bestMonths[month] === 1) return 1;
  const i = MONTHS_ORDERED.indexOf(month);
  const prev = MONTHS_ORDERED[(i + 11) % 12];
  const next = MONTHS_ORDERED[(i + 1) % 12];
  return destination.bestMonths[prev] === 1 || destination.bestMonths[next] === 1 ? 0.5 : 0;
}

/**
 * Map new budget sensitivity to scoring logic
 */
function getBudgetMultiplier(budget: BudgetSensitivity, cost: number): number {
  switch (budget) {
    case 'flexible':
      return 1; // Full points regardless of cost
    case 'moderate':
      return (10 - cost) / 10; // Linear penalty
    case 'strict':
      return Math.max(0, (8 - cost) / 8); // Stricter penalty
    default:
      return (10 - cost) / 10;
  }
}

export function calculateScore(
  destination: Destination,
  preferences: UserPreferences,
  travelers: Traveler[]
): ScoreBreakdown {
  const selectedTravelers = travelers.filter(t =>
    preferences.selectedTravelers.includes(t.id)
  );

  // Auto-detect if children are traveling (replaces kidsIncluded toggle)
  const hasChildren = hasChildTraveler(travelers, preferences.selectedTravelers);

  const monthMatch = getMonthFit(destination, preferences.travelMonth) * WEIGHTS.monthMatch;

  // New place bonus - new to ALL selected travelers. With "New Places Only" on,
  // visited places are filtered out, so this only separates results when it's off.
  const isNewToAll = selectedTravelers.every(traveler =>
    !traveler.destinations[destination.id]?.hasVisited
  );
  const newPlace = isNewToAll ? WEIGHTS.newPlace : 0;

  // Personal rating average from selected travelers
  let personalRating = 0;
  if (selectedTravelers.length > 0) {
    const ratings = selectedTravelers.map(traveler => {
      const travelerData = traveler.destinations[destination.id];
      return travelerData?.rating ?? 5; // Default to 5 if no rating
    });
    const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    personalRating = (avgRating / 10) * WEIGHTS.personalRating;
  } else {
    // No travelers selected, give neutral score
    personalRating = 0.5 * WEIGHTS.personalRating;
  }

  // Child-friendliness - NOW AUTO-DETECTED from traveler isChild flag
  let childFriendly = 0;
  if (hasChildren) {
    childFriendly = (destination.easeWithChild / 10) * WEIGHTS.childFriendly;
  } else {
    childFriendly = WEIGHTS.childFriendly; // Full points if no kids
  }

  // Cost matching - use new budget sensitivity
  const budget = preferences.budgetSensitivity || 'moderate';
  const costMatch = getBudgetMultiplier(budget, destination.cost) * WEIGHTS.costMatch;

  // Flight time (normalized, shorter = better). Nullish (not ||) so a genuine
  // 0 (home hub = "you're already there") keeps the best score instead of
  // being treated as missing data and penalized as a 15h flight.
  const flightHours = destination.flightTimes[preferences.homeAirport] ?? 15;
  const maxFlightTime = 20; // Assume 20 hours is max
  const flightTimeScore = Math.max(0, ((maxFlightTime - flightHours) / maxFlightTime)) * WEIGHTS.flightTime;

  // Duration fit: inside the user's preferred range, and long enough to
  // justify the flight from their home airport. A 5-day trip after a 16h
  // haul is a poor use of travel time even if 5 days is "in range", so it
  // only earns half credit (matches the detail page's duration guidance).
  const inRange = destination.duration >= preferences.durationMin &&
                  destination.duration <= preferences.durationMax;
  let durationMatch = inRange ? WEIGHTS.durationMatch : 0;
  if (durationMatch > 0 && destination.duration < getRecommendedMinDuration(flightHours)) {
    durationMatch *= 0.5;
  }

  // Safety - lower risk earns more. Anything over maxDanger is filtered out,
  // so a flat "within threshold" score would be the same for every result.
  const safetyScore = Math.max(0, (10 - destination.danger) / 9) * WEIGHTS.safetyScore;

  // Climate match
  let climateMatch = 0;
  if (preferences.temperaturePreference === 'Any') {
    climateMatch = WEIGHTS.climateMatch;
  } else if (destination.climate === preferences.temperaturePreference) {
    climateMatch = WEIGHTS.climateMatch;
  } else if (destination.climate === 'Mix') {
    climateMatch = WEIGHTS.climateMatch * 0.5;
  }

  // Type match (urban/nature)
  let typeMatch = 0;
  if (preferences.typePreference === 'Any') {
    typeMatch = WEIGHTS.typeMatch;
  } else if (destination.type === preferences.typePreference) {
    typeMatch = WEIGHTS.typeMatch;
  } else if (destination.type === 'Mix') {
    typeMatch = WEIGHTS.typeMatch * 0.5;
  }

  const total = monthMatch + newPlace + personalRating + childFriendly +
                costMatch + durationMatch + flightTimeScore + safetyScore +
                climateMatch + typeMatch;

  return {
    total,
    monthMatch,
    newPlace,
    personalRating,
    childFriendly,
    costMatch,
    durationMatch,
    flightTime: flightTimeScore,
    safetyScore,
    climateMatch,
    typeMatch,
  };
}

export function getMaxPossibleScore(): number {
  return Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
}

export function filterDestinations(
  destinations: Destination[],
  preferences: UserPreferences,
  travelers: Traveler[]
): Destination[] {
  return destinations.filter(dest => {
    // Filter by search query (with fallback for missing/undefined field)
    const searchQuery = preferences.searchQuery ?? '';
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const nameMatch = dest.name.toLowerCase().includes(query);
      const countryMatch = dest.countries.some(c => c.toLowerCase().includes(query));
      const summaryMatch = dest.itinerarySummary.toLowerCase().includes(query);
      const regionMatch = dest.region?.toLowerCase().includes(query);
      const tagMatch = dest.tags?.some(t => t.toLowerCase().includes(query));
      if (!nameMatch && !countryMatch && !summaryMatch && !regionMatch && !tagMatch) {
        return false;
      }
    }

    // Filter by duration
    if (dest.duration < preferences.durationMin || dest.duration > preferences.durationMax) {
      return false;
    }

    // Filter by danger
    if (dest.danger > preferences.maxDanger) {
      return false;
    }

    // Filter by visa if required
    if (preferences.visaFreeOnly) {
      const visaLower = dest.visaRequirements.toLowerCase();
      if (!visaLower.includes('no visa') && !visaLower.includes('visa-free') && !visaLower.includes('visa not required')) {
        return false;
      }
    }

    // Filter by climate
    if (preferences.temperaturePreference !== 'Any' &&
        dest.climate !== preferences.temperaturePreference &&
        dest.climate !== 'Mix') {
      return false;
    }

    // Filter by type
    if (preferences.typePreference !== 'Any' &&
        dest.type !== preferences.typePreference &&
        dest.type !== 'Mix') {
      return false;
    }

    // Filter by region (NEW)
    if (preferences.regionPreference && preferences.regionPreference !== 'Any') {
      if (dest.region !== preferences.regionPreference) {
        return false;
      }
    }

    // Filter by max flight time (NEW). Use != null so a 0 (local) passes and
    // only genuinely-missing data is skipped rather than silently excluded.
    if (preferences.maxFlightTime && preferences.maxFlightTime > 0) {
      const flightHours = dest.flightTimes[preferences.homeAirport];
      if (flightHours != null && flightHours > preferences.maxFlightTime) {
        return false;
      }
    }

    // Filter by new places if required
    if (preferences.preferNewPlaces && preferences.selectedTravelers.length > 0) {
      const selectedTravelers = travelers.filter(t =>
        preferences.selectedTravelers.includes(t.id)
      );
      const isNewToAll = selectedTravelers.every(traveler => {
        const travelerData = traveler.destinations[dest.id];
        return !travelerData?.hasVisited;
      });
      if (!isNewToAll) {
        return false;
      }
    }

    return true;
  });
}

export function sortDestinationsByScore(
  destinations: Destination[],
  preferences: UserPreferences,
  travelers: Traveler[]
): { destination: Destination; score: ScoreBreakdown }[] {
  return destinations
    .map(dest => ({
      destination: dest,
      score: calculateScore(dest, preferences, travelers),
    }))
    .sort((a, b) => b.score.total - a.score.total);
}

/**
 * Calculate recommended minimum trip duration based on flight time.
 * Logic: Longer flights warrant longer stays to justify travel time.
 * - Under 4 hours: 4+ days minimum
 * - 4-8 hours: 5+ days minimum
 * - 8-12 hours: 7+ days minimum
 * - 12-16 hours: 9+ days minimum
 * - 16+ hours: 10+ days minimum
 */
export function getRecommendedMinDuration(flightHours: number): number {
  if (flightHours < 4) return 4;
  if (flightHours < 8) return 5;
  if (flightHours < 12) return 7;
  if (flightHours < 16) return 9;
  return 10;
}

/**
 * Check if a destination's duration is appropriate for the flight time.
 * Returns: 'good' if at or above recommended, 'warning' if slightly below, 'poor' if too short.
 */
export function getDurationRecommendation(
  destinationDuration: number,
  flightHours: number
): { status: 'good' | 'warning' | 'poor'; recommended: number; message: string } {
  const recommended = getRecommendedMinDuration(flightHours);

  if (destinationDuration >= recommended) {
    return {
      status: 'good',
      recommended,
      message: `Trip duration is appropriate for a ${Math.round(flightHours)}h flight`,
    };
  } else if (destinationDuration >= recommended - 2) {
    return {
      status: 'warning',
      recommended,
      message: `Consider ${recommended}+ days for a ${Math.round(flightHours)}h flight`,
    };
  } else {
    return {
      status: 'poor',
      recommended,
      message: `${recommended}+ days recommended for ${Math.round(flightHours)}h flight to maximize value`,
    };
  }
}
