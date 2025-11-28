import { Destination, UserPreferences, Traveler, Month, hasChildTraveler, BudgetSensitivity } from '@/types';

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

const WEIGHTS = {
  monthMatch: 20,      // Is it a good time to visit?
  newPlace: 15,        // Haven't been before
  personalRating: 15,  // User's own interest rating
  childFriendly: 12,   // If kids coming (auto-detected from travelers)
  costMatch: 10,       // Within budget preference
  durationMatch: 8,    // Fits trip length
  flightTime: 5,       // Shorter = better
  safetyScore: 8,      // Within danger threshold
  climateMatch: 4,     // Matches temperature preference
  typeMatch: 3,        // Matches urban/nature preference
};

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

  // Month matching (0 or 1 from data * weight)
  const monthValue = destination.bestMonths[preferences.travelMonth];
  const monthMatch = monthValue * WEIGHTS.monthMatch;

  // New place bonus - check if new to ALL selected travelers
  let newPlace = 0;
  if (preferences.preferNewPlaces && selectedTravelers.length > 0) {
    const isNewToAll = selectedTravelers.every(traveler => {
      const travelerData = traveler.destinations[destination.id];
      return !travelerData?.hasVisited;
    });
    newPlace = isNewToAll ? WEIGHTS.newPlace : 0;
  } else if (preferences.preferNewPlaces) {
    // No travelers selected, assume it's new
    newPlace = WEIGHTS.newPlace;
  }

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

  // Duration fit
  const inRange = destination.duration >= preferences.durationMin &&
                  destination.duration <= preferences.durationMax;
  const durationMatch = inRange ? WEIGHTS.durationMatch : 0;

  // Flight time (normalized, shorter = better)
  const flightHours = destination.flightTimes[preferences.homeAirport] || 15;
  const maxFlightTime = 20; // Assume 20 hours is max
  const flightTimeScore = Math.max(0, ((maxFlightTime - flightHours) / maxFlightTime)) * WEIGHTS.flightTime;

  // Safety score - penalize if over threshold
  let safetyScore = 0;
  if (destination.danger <= preferences.maxDanger) {
    safetyScore = WEIGHTS.safetyScore;
  } else {
    // Gradually reduce score for more dangerous destinations
    const overBy = destination.danger - preferences.maxDanger;
    safetyScore = Math.max(0, WEIGHTS.safetyScore - (overBy * 2));
  }

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

    // Filter by max flight time (NEW)
    if (preferences.maxFlightTime && preferences.maxFlightTime > 0) {
      const flightHours = dest.flightTimes[preferences.homeAirport];
      if (flightHours && flightHours > preferences.maxFlightTime) {
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

export function isGoodMonth(destination: Destination, month: Month): boolean {
  return destination.bestMonths[month] === 1;
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
