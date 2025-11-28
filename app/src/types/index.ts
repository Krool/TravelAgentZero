// ============================================================================
// AIRPORT TYPES & DATA
// ============================================================================

export type AirportCode =
  | 'JFK' | 'LAX' | 'ORD' | 'SFO' | 'MIA' | 'DEN' | 'SEA' | 'ATL'  // North America
  | 'LHR' | 'CDG' | 'FRA' | 'AMS' | 'MAD' | 'FCO'  // Europe
  | 'NRT' | 'PEK' | 'SIN' | 'DXB' | 'HKG' | 'ICN' | 'BKK'  // Asia/Middle East
  | 'SYD' | 'MEL'  // Oceania
  | 'GRU' | 'EZE';  // South America

export type AirportRegion = 'North America' | 'Europe' | 'Asia' | 'Middle East' | 'Oceania' | 'South America' | 'Africa';

export interface AirportInfo {
  code: AirportCode;
  name: string;
  city: string;
  country: string;
  region: AirportRegion;
}

export const AIRPORT_HUBS: Record<AirportCode, AirportInfo> = {
  // North America
  JFK: { code: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'USA', region: 'North America' },
  LAX: { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'USA', region: 'North America' },
  ORD: { code: 'ORD', name: "O'Hare International", city: 'Chicago', country: 'USA', region: 'North America' },
  SFO: { code: 'SFO', name: 'San Francisco International', city: 'San Francisco', country: 'USA', region: 'North America' },
  MIA: { code: 'MIA', name: 'Miami International', city: 'Miami', country: 'USA', region: 'North America' },
  DEN: { code: 'DEN', name: 'Denver International', city: 'Denver', country: 'USA', region: 'North America' },
  SEA: { code: 'SEA', name: 'Seattle-Tacoma International', city: 'Seattle', country: 'USA', region: 'North America' },
  ATL: { code: 'ATL', name: 'Hartsfield-Jackson Atlanta', city: 'Atlanta', country: 'USA', region: 'North America' },
  // Europe
  LHR: { code: 'LHR', name: 'Heathrow', city: 'London', country: 'UK', region: 'Europe' },
  CDG: { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France', region: 'Europe' },
  FRA: { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', region: 'Europe' },
  AMS: { code: 'AMS', name: 'Schiphol', city: 'Amsterdam', country: 'Netherlands', region: 'Europe' },
  MAD: { code: 'MAD', name: 'Adolfo Suárez Madrid–Barajas', city: 'Madrid', country: 'Spain', region: 'Europe' },
  FCO: { code: 'FCO', name: 'Leonardo da Vinci–Fiumicino', city: 'Rome', country: 'Italy', region: 'Europe' },
  // Asia
  NRT: { code: 'NRT', name: 'Narita International', city: 'Tokyo', country: 'Japan', region: 'Asia' },
  PEK: { code: 'PEK', name: 'Beijing Capital International', city: 'Beijing', country: 'China', region: 'Asia' },
  SIN: { code: 'SIN', name: 'Changi Airport', city: 'Singapore', country: 'Singapore', region: 'Asia' },
  HKG: { code: 'HKG', name: 'Hong Kong International', city: 'Hong Kong', country: 'China', region: 'Asia' },
  ICN: { code: 'ICN', name: 'Incheon International', city: 'Seoul', country: 'South Korea', region: 'Asia' },
  BKK: { code: 'BKK', name: 'Suvarnabhumi', city: 'Bangkok', country: 'Thailand', region: 'Asia' },
  // Middle East
  DXB: { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE', region: 'Middle East' },
  // Oceania
  SYD: { code: 'SYD', name: 'Sydney Airport', city: 'Sydney', country: 'Australia', region: 'Oceania' },
  MEL: { code: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia', region: 'Oceania' },
  // South America
  GRU: { code: 'GRU', name: 'São Paulo–Guarulhos', city: 'São Paulo', country: 'Brazil', region: 'South America' },
  EZE: { code: 'EZE', name: 'Ministro Pistarini', city: 'Buenos Aires', country: 'Argentina', region: 'South America' },
};

// ============================================================================
// CLIMATE, TRIP TYPE & TIME TYPES
// ============================================================================

export type ClimateType = 'tropical' | 'arid' | 'temperate' | 'cold' | 'mixed';
export type TripStyle = 'urban' | 'nature' | 'beach' | 'adventure' | 'cultural' | 'mixed';
export type Month = 'jan' | 'feb' | 'mar' | 'apr' | 'may' | 'jun' | 'jul' | 'aug' | 'sep' | 'oct' | 'nov' | 'dec';

// Legacy type aliases for backward compatibility
export type Climate = 'Hot' | 'Cold' | 'Temperate' | 'Mix';
export type TripType = 'Urban' | 'Nature' | 'Mix';

export interface MonthlyData {
  jan: number;
  feb: number;
  mar: number;
  apr: number;
  may: number;
  jun: number;
  jul: number;
  aug: number;
  sep: number;
  oct: number;
  nov: number;
  dec: number;
}

// ============================================================================
// DESTINATION REGION TYPES
// ============================================================================

export type DestinationRegion =
  | 'North America'
  | 'Central America'
  | 'South America'
  | 'Caribbean'
  | 'Western Europe'
  | 'Eastern Europe'
  | 'Northern Europe'
  | 'Southern Europe'
  | 'Middle East'
  | 'Central Asia'
  | 'South Asia'
  | 'Southeast Asia'
  | 'East Asia'
  | 'Africa'
  | 'Oceania';

export const DESTINATION_REGIONS: DestinationRegion[] = [
  'North America',
  'Central America',
  'South America',
  'Caribbean',
  'Western Europe',
  'Eastern Europe',
  'Northern Europe',
  'Southern Europe',
  'Middle East',
  'Central Asia',
  'South Asia',
  'Southeast Asia',
  'East Asia',
  'Africa',
  'Oceania',
];

// ============================================================================
// PRICING TYPES
// ============================================================================

export interface MonthlyPricing {
  jan: number;
  feb: number;
  mar: number;
  apr: number;
  may: number;
  jun: number;
  jul: number;
  aug: number;
  sep: number;
  oct: number;
  nov: number;
  dec: number;
}

export type PriceLevel = 'budget' | 'moderate' | 'expensive' | 'luxury';

// ============================================================================
// TRAVELER TYPES
// ============================================================================

export interface TravelerData {
  hasVisited: boolean;
  rating: number; // 0-10
}

export interface Traveler {
  id: string;
  name: string;
  isChild: boolean; // NEW: marks traveler as a child (under 18)
  birthYear?: number; // Optional: for age calculation
  destinations: Record<string, TravelerData>;
}

// ============================================================================
// DESTINATION TYPES
// ============================================================================

export interface Destination {
  id: string;
  name: string;
  duration: number;
  itinerarySummary: string;
  considerations: string;
  visaRequirements: string;
  countries: string[];
  region: DestinationRegion;
  climate: Climate;
  type: TripType;
  easeWithChild: number; // 0-10
  urgency: number; // 0-10
  danger: number; // 0-10
  cost: number; // 0-10
  flightTimes: Partial<Record<AirportCode, number>>; // Partial to allow missing airports
  bestMonths: MonthlyData;
  bestTimeDescription: string;
  // NEW: Historical average flight prices from major airports
  avgFlightPrices?: Partial<Record<AirportCode, MonthlyPricing>>;
  tags?: string[]; // searchable tags
  imageUrl?: string; // Optional: custom image URL for the destination
}

// Helper function to generate a placeholder image URL from Unsplash
export function getDestinationImageUrl(destination: Destination): string {
  if (destination.imageUrl) {
    return destination.imageUrl;
  }
  // Use the first country or destination name for Unsplash search
  const searchTerm = destination.countries[0] || destination.name;
  // Encode the search term for URL and use Unsplash source for relevant images
  const encoded = encodeURIComponent(searchTerm.toLowerCase());
  return `https://source.unsplash.com/featured/400x300/?${encoded},travel,landscape`;
}

// ============================================================================
// BUDGET SENSITIVITY OPTIONS
// ============================================================================

export type BudgetSensitivity = 'flexible' | 'moderate' | 'strict';

export const BUDGET_OPTIONS: Record<BudgetSensitivity, { label: string; description: string }> = {
  flexible: { label: 'Flexible', description: 'Money is no object' },
  moderate: { label: 'Moderate', description: 'Cost-conscious but willing to splurge' },
  strict: { label: 'Strict', description: 'Looking for the best value' },
};

// Legacy alias
export type CostSensitivity = 'none' | 'a_little' | 'very';

// ============================================================================
// USER PREFERENCES
// ============================================================================

export interface FlightTimeRange {
  min: number;
  max: number;
}

export interface UserPreferences {
  // When
  travelMonth: Month;
  durationMin: number;
  durationMax: number;

  // Travelers (children auto-detected from selected travelers)
  selectedTravelers: string[];

  // Origin
  homeAirport: AirportCode;

  // Destination preferences
  temperaturePreference: Climate | 'Any';
  typePreference: TripType | 'Any';
  regionPreference: DestinationRegion | 'Any';

  // Budget
  budgetSensitivity: BudgetSensitivity;
  maxFlightPrice?: number; // Optional max price filter

  // Flight time filter
  maxFlightTime: number; // in hours, 0 = no limit

  // Safety
  maxDanger: number;

  // Filters
  preferNewPlaces: boolean;
  visaFreeOnly: boolean;

  // Search & UI state
  searchQuery: string;
  favorites: string[];
  compareList: string[];

  // Legacy field (kept for migration)
  costSensitivity?: CostSensitivity;
}

export interface AppState {
  destinations: Destination[];
  travelers: Traveler[];
  preferences: UserPreferences;
  soundEnabled: boolean;
  soundVolume: number;
}

// ============================================================================
// MONTH CONSTANTS
// ============================================================================

export const MONTH_NAMES: Record<Month, string> = {
  jan: 'January',
  feb: 'February',
  mar: 'March',
  apr: 'April',
  may: 'May',
  jun: 'June',
  jul: 'July',
  aug: 'August',
  sep: 'September',
  oct: 'October',
  nov: 'November',
  dec: 'December',
};

export const MONTH_SHORT: Record<Month, string> = {
  jan: 'Jan',
  feb: 'Feb',
  mar: 'Mar',
  apr: 'Apr',
  may: 'May',
  jun: 'Jun',
  jul: 'Jul',
  aug: 'Aug',
  sep: 'Sep',
  oct: 'Oct',
  nov: 'Nov',
  dec: 'Dec',
};

export const MONTHS_ORDERED: Month[] = [
  'jan', 'feb', 'mar', 'apr', 'may', 'jun',
  'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
];

// ============================================================================
// CLIMATE & TRIP TYPE LABELS
// ============================================================================

export const CLIMATE_OPTIONS: Record<Climate | 'Any', { label: string; icon: string }> = {
  Any: { label: 'Any Climate', icon: '🌍' },
  Hot: { label: 'Hot / Tropical', icon: '☀️' },
  Cold: { label: 'Cold / Alpine', icon: '❄️' },
  Temperate: { label: 'Temperate', icon: '🌤️' },
  Mix: { label: 'Mixed Climate', icon: '🌡️' },
};

export const TRIP_TYPE_OPTIONS: Record<TripType | 'Any', { label: string; icon: string }> = {
  Any: { label: 'Any Type', icon: '🗺️' },
  Urban: { label: 'Urban / City', icon: '🏙️' },
  Nature: { label: 'Nature / Outdoors', icon: '🌲' },
  Mix: { label: 'Mix of Both', icon: '🏞️' },
};

// ============================================================================
// FLIGHT TIME OPTIONS
// ============================================================================

export const FLIGHT_TIME_OPTIONS = [
  { value: 0, label: 'Any Distance' },
  { value: 4, label: 'Under 4 hours' },
  { value: 8, label: 'Under 8 hours' },
  { value: 12, label: 'Under 12 hours' },
  { value: 16, label: 'Under 16 hours' },
  { value: 20, label: 'Under 20 hours' },
];

// ============================================================================
// DEFAULT PREFERENCES
// ============================================================================

export const DEFAULT_PREFERENCES: UserPreferences = {
  // When
  travelMonth: 'oct',
  durationMin: 6,
  durationMax: 9,

  // Travelers
  selectedTravelers: [],

  // Origin
  homeAirport: 'SFO',

  // Destination preferences
  temperaturePreference: 'Any',
  typePreference: 'Any',
  regionPreference: 'Any',

  // Budget
  budgetSensitivity: 'moderate',

  // Flight time
  maxFlightTime: 0, // No limit

  // Safety
  maxDanger: 6,

  // Filters
  preferNewPlaces: true,
  visaFreeOnly: false,

  // Search & UI
  searchQuery: '',
  favorites: [],
  compareList: [],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if any selected travelers are children
 */
export function hasChildTraveler(travelers: Traveler[], selectedIds: string[]): boolean {
  return travelers
    .filter(t => selectedIds.includes(t.id))
    .some(t => t.isChild);
}

/**
 * Get the count of child travelers among selected
 */
export function getChildCount(travelers: Traveler[], selectedIds: string[]): number {
  return travelers
    .filter(t => selectedIds.includes(t.id))
    .filter(t => t.isChild)
    .length;
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}
