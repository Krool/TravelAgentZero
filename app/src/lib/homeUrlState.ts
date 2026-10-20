import {
  UserPreferences,
  DEFAULT_PREFERENCES,
  DESTINATION_REGIONS,
  DestinationRegion,
  BUDGET_OPTIONS,
  BudgetSensitivity,
  FLIGHT_TIME_OPTIONS,
  Climate,
  TripType,
  Month,
  AirportCode,
  PASSPORTS,
  PassportCode,
} from '@/types';
import { decodeShareParams, isValidAirport, isValidMonth } from '@/lib/shareUtils';

// Home-page search state <-> URL query, so a filtered list can be bookmarked,
// shared, and restored with the back button. Only values that differ from the
// defaults are written, so an untouched search keeps a clean URL.

export type ViewMode = 'grid' | 'list' | 'favorites';
export type SortMode = 'score' | 'name' | 'cost' | 'flight' | 'duration';

const SORT_MODES: SortMode[] = ['score', 'name', 'cost', 'flight', 'duration'];
const VIEW_MODES: ViewMode[] = ['grid', 'list', 'favorites'];
const CLIMATES: Climate[] = ['Hot', 'Cold', 'Temperate', 'Mix'];
const TRIP_TYPES: TripType[] = ['Urban', 'Nature', 'Mix'];

type FilterPrefs = Pick<
  UserPreferences,
  | 'travelMonth' | 'homeAirport' | 'durationMin' | 'durationMax' | 'regionPreference'
  | 'temperaturePreference' | 'typePreference' | 'budgetSensitivity' | 'maxFlightTime'
  | 'maxDanger' | 'visaFreeOnly' | 'preferNewPlaces' | 'searchQuery' | 'passport'
>;

export interface HomeUrlState {
  prefs: Partial<FilterPrefs>;
  sort?: SortMode;
  view?: ViewMode;
}

export function encodeHomeState(prefs: UserPreferences, sort: SortMode, view: ViewMode): string {
  const p = new URLSearchParams();
  const d = DEFAULT_PREFERENCES;
  if (prefs.travelMonth !== d.travelMonth) p.set('month', prefs.travelMonth);
  if (prefs.homeAirport !== d.homeAirport) p.set('from', prefs.homeAirport);
  if (prefs.durationMin !== d.durationMin || prefs.durationMax !== d.durationMax) {
    p.set('days', `${prefs.durationMin}-${prefs.durationMax}`);
  }
  if (prefs.regionPreference !== 'Any') p.set('region', prefs.regionPreference);
  if (prefs.temperaturePreference !== 'Any') p.set('climate', prefs.temperaturePreference);
  if (prefs.typePreference !== 'Any') p.set('style', prefs.typePreference);
  if (prefs.budgetSensitivity !== d.budgetSensitivity) p.set('budget', prefs.budgetSensitivity);
  if (prefs.maxFlightTime > 0) p.set('maxflight', String(prefs.maxFlightTime));
  if (prefs.maxDanger !== d.maxDanger) p.set('risk', String(prefs.maxDanger));
  if (prefs.visaFreeOnly) p.set('visa', '1');
  if (prefs.passport !== d.passport) p.set('passport', prefs.passport);
  if (prefs.preferNewPlaces !== d.preferNewPlaces) p.set('new', prefs.preferNewPlaces ? '1' : '0');
  if (prefs.searchQuery.trim()) p.set('q', prefs.searchQuery.trim());
  if (sort !== 'score') p.set('sort', sort);
  if (view !== 'grid') p.set('view', view);
  const s = p.toString();
  return s ? `?${s}` : '';
}

/** Parse a home URL query. Invalid values are ignored, never applied. */
export function decodeHomeState(search: string): HomeUrlState {
  const p = new URLSearchParams(search);
  const prefs: Partial<FilterPrefs> = {};

  const month = p.get('month');
  if (month && isValidMonth(month)) prefs.travelMonth = month as Month;
  const from = p.get('from');
  if (from && isValidAirport(from)) prefs.homeAirport = from as AirportCode;
  const days = p.get('days');
  if (days) {
    const { durationMin, durationMax } = decodeShareParams(new URLSearchParams({ d: days }));
    if (durationMin != null && durationMax != null) Object.assign(prefs, { durationMin, durationMax });
  }
  const region = p.get('region');
  if (region && (DESTINATION_REGIONS as string[]).includes(region)) prefs.regionPreference = region as DestinationRegion;
  const climate = p.get('climate');
  if (climate && (CLIMATES as string[]).includes(climate)) prefs.temperaturePreference = climate as Climate;
  const style = p.get('style');
  if (style && (TRIP_TYPES as string[]).includes(style)) prefs.typePreference = style as TripType;
  const budget = p.get('budget');
  if (budget && Object.hasOwn(BUDGET_OPTIONS, budget)) prefs.budgetSensitivity = budget as BudgetSensitivity;
  const maxflight = Number(p.get('maxflight'));
  if (FLIGHT_TIME_OPTIONS.some((o) => o.value === maxflight && o.value > 0)) prefs.maxFlightTime = maxflight;
  const risk = Number(p.get('risk'));
  if (Number.isInteger(risk) && risk >= 1 && risk <= 10) prefs.maxDanger = risk;
  if (p.get('visa') === '1') prefs.visaFreeOnly = true;
  const passport = p.get('passport');
  if (passport && Object.hasOwn(PASSPORTS, passport)) prefs.passport = passport as PassportCode;
  const isNew = p.get('new');
  if (isNew === '0' || isNew === '1') prefs.preferNewPlaces = isNew === '1';
  const q = p.get('q');
  if (q) prefs.searchQuery = q.slice(0, 100);

  const sort = p.get('sort') as SortMode | null;
  const view = p.get('view') as ViewMode | null;
  return {
    prefs,
    sort: sort && SORT_MODES.includes(sort) ? sort : undefined,
    view: view && VIEW_MODES.includes(view) ? view : undefined,
  };
}

// The home query last written, so "Back to Destinations" on a detail page can
// return to the same filtered, sorted list. In-memory only: it survives
// client-side navigation, which is all the back link needs.
let lastHomeSearch = '';
export function setLastHomeSearch(search: string) {
  lastHomeSearch = search;
}
export function getLastHomeSearch(): string {
  return lastHomeSearch;
}
