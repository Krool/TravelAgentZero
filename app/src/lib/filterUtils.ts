import {
  UserPreferences,
  DEFAULT_PREFERENCES,
  MONTH_NAMES,
  DESTINATION_REGIONS,
  AIRPORT_HUBS,
  Month,
} from '@/types';

export interface ActiveFilter {
  key: string;
  label: string;
  value: string;
  clearAction: keyof UserPreferences | 'durationRange';
}

/**
 * Get list of active filters that differ from defaults
 */
export function getActiveFilters(preferences: UserPreferences): ActiveFilter[] {
  const filters: ActiveFilter[] = [];

  // Travel Month
  if (preferences.travelMonth !== DEFAULT_PREFERENCES.travelMonth) {
    filters.push({
      key: 'travelMonth',
      label: 'Month',
      value: MONTH_NAMES[preferences.travelMonth],
      clearAction: 'travelMonth',
    });
  }

  // Region
  if (preferences.regionPreference !== 'Any') {
    filters.push({
      key: 'regionPreference',
      label: 'Region',
      value: preferences.regionPreference,
      clearAction: 'regionPreference',
    });
  }

  // Climate
  if (preferences.temperaturePreference !== 'Any') {
    filters.push({
      key: 'temperaturePreference',
      label: 'Climate',
      value: preferences.temperaturePreference,
      clearAction: 'temperaturePreference',
    });
  }

  // Trip Type
  if (preferences.typePreference !== 'Any') {
    filters.push({
      key: 'typePreference',
      label: 'Type',
      value: preferences.typePreference,
      clearAction: 'typePreference',
    });
  }

  // Budget
  if (preferences.budgetSensitivity !== DEFAULT_PREFERENCES.budgetSensitivity) {
    const budgetLabels = {
      flexible: 'Flexible',
      moderate: 'Moderate',
      strict: 'Strict',
    };
    filters.push({
      key: 'budgetSensitivity',
      label: 'Budget',
      value: budgetLabels[preferences.budgetSensitivity],
      clearAction: 'budgetSensitivity',
    });
  }

  // Max Flight Time
  if (preferences.maxFlightTime > 0) {
    filters.push({
      key: 'maxFlightTime',
      label: 'Flight',
      value: `< ${preferences.maxFlightTime}h`,
      clearAction: 'maxFlightTime',
    });
  }

  // Duration (check if different from default)
  if (
    preferences.durationMin !== DEFAULT_PREFERENCES.durationMin ||
    preferences.durationMax !== DEFAULT_PREFERENCES.durationMax
  ) {
    filters.push({
      key: 'durationRange',
      label: 'Duration',
      value: `${preferences.durationMin}-${preferences.durationMax}d`,
      clearAction: 'durationRange',
    });
  }

  // Visa-Free Only
  if (preferences.visaFreeOnly) {
    filters.push({
      key: 'visaFreeOnly',
      label: 'Visa',
      value: 'Free',
      clearAction: 'visaFreeOnly',
    });
  }

  // New Places Only
  if (preferences.preferNewPlaces !== DEFAULT_PREFERENCES.preferNewPlaces) {
    filters.push({
      key: 'preferNewPlaces',
      label: 'Places',
      value: preferences.preferNewPlaces ? 'New Only' : 'All',
      clearAction: 'preferNewPlaces',
    });
  }

  // Home Airport (if different from default)
  if (preferences.homeAirport !== DEFAULT_PREFERENCES.homeAirport) {
    filters.push({
      key: 'homeAirport',
      label: 'From',
      value: preferences.homeAirport,
      clearAction: 'homeAirport',
    });
  }

  return filters;
}

/**
 * Count number of active filters
 */
export function getActiveFilterCount(preferences: UserPreferences): number {
  return getActiveFilters(preferences).length;
}

/**
 * Get default value for a preference key
 */
export function getDefaultValue(key: keyof UserPreferences | 'durationRange'): unknown {
  if (key === 'durationRange') {
    return { min: DEFAULT_PREFERENCES.durationMin, max: DEFAULT_PREFERENCES.durationMax };
  }
  return DEFAULT_PREFERENCES[key as keyof UserPreferences];
}
