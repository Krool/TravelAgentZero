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

// Curated Unsplash images for destinations featuring major attractions
const DESTINATION_IMAGES: Record<string, string> = {
  // Asia
  'seoul-hong-kong': 'https://images.unsplash.com/photo-1546874177-9e664107314e?w=400&h=300&fit=crop', // Seoul Gyeongbokgung
  'hong-kong': 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=400&h=300&fit=crop', // Hong Kong skyline
  'japan': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop', // Mt Fuji with cherry blossoms
  'singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&h=300&fit=crop', // Marina Bay Sands
  'thailand': 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=400&h=300&fit=crop', // Thai temples
  'vietnam': 'https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=400&h=300&fit=crop', // Ha Long Bay
  'indonesia-bali-java': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&fit=crop', // Bali temple
  'india': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&h=300&fit=crop', // Taj Mahal
  'cambodia-angkor-wat': 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=400&h=300&fit=crop', // Angkor Wat
  'south-korea': 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=400&h=300&fit=crop', // Seoul cityscape
  'taiwan': 'https://images.unsplash.com/photo-1470004914212-05527e49370b?w=400&h=300&fit=crop', // Taipei 101
  'dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop', // Burj Khalifa

  // Europe
  'istanbul-turkey': 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=400&h=300&fit=crop', // Hagia Sophia
  'berlin-germany': 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=400&h=300&fit=crop', // Brandenburg Gate
  'budapest-hungary': 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=400&h=300&fit=crop', // Hungarian Parliament
  'portugal-azores': 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&h=300&fit=crop', // Azores landscape
  'poland': 'https://images.unsplash.com/photo-1519197924294-4ba991a11128?w=400&h=300&fit=crop', // Krakow Old Town
  'georgia-tbilisi': 'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=400&h=300&fit=crop', // Tbilisi old town
  'slovenia': 'https://images.unsplash.com/photo-1586439974666-22bb0e1a21ee?w=400&h=300&fit=crop', // Lake Bled
  'prague-czech': 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=400&h=300&fit=crop', // Prague Charles Bridge
  'greece': 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400&h=300&fit=crop', // Santorini
  'croatia': 'https://images.unsplash.com/photo-1555990538-1e6c1e8f8f16?w=400&h=300&fit=crop', // Dubrovnik
  'rome-italy': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=300&fit=crop', // Colosseum
  'austria': 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=400&h=300&fit=crop', // Vienna
  'paris-france': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=300&fit=crop', // Eiffel Tower
  'london-uk': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop', // Big Ben
  'spain-barcelona-madrid': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&h=300&fit=crop', // Sagrada Familia
  'amsterdam-netherlands': 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400&h=300&fit=crop', // Amsterdam canals
  'scotland': 'https://images.unsplash.com/photo-1506377585622-bedcbb5f8c4e?w=400&h=300&fit=crop', // Edinburgh Castle
  'ireland': 'https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?w=400&h=300&fit=crop', // Cliffs of Moher
  'switzerland': 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=400&h=300&fit=crop', // Swiss Alps
  'norway': 'https://images.unsplash.com/photo-1520769669658-f07657f5a307?w=400&h=300&fit=crop', // Norwegian fjords
  'iceland': 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=400&h=300&fit=crop', // Iceland waterfall
  'aurora-borealis': 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&h=300&fit=crop', // Northern Lights

  // Americas
  'new-york-city': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop', // NYC skyline
  'las-vegas': 'https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=400&h=300&fit=crop', // Las Vegas strip
  'grand-canyon': 'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=400&h=300&fit=crop', // Grand Canyon
  'disneyland': 'https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=400&h=300&fit=crop', // Disney castle
  'new-orleans': 'https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=400&h=300&fit=crop', // French Quarter
  'hawaii': 'https://images.unsplash.com/photo-1542259009477-d625272157b7?w=400&h=300&fit=crop', // Hawaii beach
  'alaska': 'https://images.unsplash.com/photo-1531176175280-d26deac2e5a2?w=400&h=300&fit=crop', // Alaska glacier
  'glacier-national-park': 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=300&fit=crop', // Glacier NP
  'banff': 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=400&h=300&fit=crop', // Moraine Lake
  'vancouver-victoria': 'https://images.unsplash.com/photo-1559511260-66a654ae982a?w=400&h=300&fit=crop', // Vancouver skyline
  'quebec-city-montreal': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop', // Quebec City
  'nova-scotia': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop', // Peggy's Cove
  'mexico-city': 'https://images.unsplash.com/photo-1518659526054-e8f9b8b24f33?w=400&h=300&fit=crop', // Mexico City
  'puerto-rico': 'https://images.unsplash.com/photo-1570402140711-d1d79bd2a0a9?w=400&h=300&fit=crop', // Old San Juan
  'cuba': 'https://images.unsplash.com/photo-1500759285222-a95626b934cb?w=400&h=300&fit=crop', // Havana vintage cars
  'costa-rica': 'https://images.unsplash.com/photo-1518183214770-9cffbec72538?w=400&h=300&fit=crop', // Costa Rica rainforest
  'belize-ambergris': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop', // Belize blue hole
  'bahamas': 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=400&h=300&fit=crop', // Bahamas beach
  'new-mexico-balloons': 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=400&h=300&fit=crop', // Hot air balloons
  'carlsbad-cavern': 'https://images.unsplash.com/photo-1520759651819-7e377e6f66f0?w=400&h=300&fit=crop', // Cave formations
  'charlotte': 'https://images.unsplash.com/photo-1577024681624-f3d58e5ff1a4?w=400&h=300&fit=crop', // Charlotte skyline
  'charleston': 'https://images.unsplash.com/photo-1587162146766-e06b1189b907?w=400&h=300&fit=crop', // Charleston historic
  'nashville': 'https://images.unsplash.com/photo-1545419913-775e3e55fb95?w=400&h=300&fit=crop', // Nashville music scene
  'southeast-us-roadtrip': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop', // Road trip

  // South America
  'rio-de-janeiro': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=400&h=300&fit=crop', // Christ the Redeemer
  'argentina-patagonia': 'https://images.unsplash.com/photo-1531761535209-180857e963b9?w=400&h=300&fit=crop', // Patagonia
  'inca-trail': 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400&h=300&fit=crop', // Machu Picchu
  'peru-no-inca': 'https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?w=400&h=300&fit=crop', // Peru rainbow mountain
  'chile': 'https://images.unsplash.com/photo-1478827536114-da961b7f86d2?w=400&h=300&fit=crop', // Torres del Paine
  'colombia': 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400&h=300&fit=crop', // Cartagena
  'la-paz': 'https://images.unsplash.com/photo-1591543620767-582b2e76369e?w=400&h=300&fit=crop', // La Paz Bolivia

  // Africa & Middle East
  'morocco': 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=400&h=300&fit=crop', // Marrakech
  'egypt-pyramids': 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=400&h=300&fit=crop', // Pyramids
  'south-africa-kruger': 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400&h=300&fit=crop', // Safari elephant
  'kenya-safari': 'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=400&h=300&fit=crop', // Kenya safari
  'tanzania-serengeti': 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400&h=300&fit=crop', // Serengeti
  'israel': 'https://images.unsplash.com/photo-1552423314-cf29ab68ad73?w=400&h=300&fit=crop', // Jerusalem
  'jordan-petra': 'https://images.unsplash.com/photo-1579606032821-4e6161c81571?w=400&h=300&fit=crop', // Petra Treasury
  'seychelles': 'https://images.unsplash.com/photo-1589979481223-deb893043163?w=400&h=300&fit=crop', // Seychelles beach

  // Oceania
  'australia-east-coast': 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=400&h=300&fit=crop', // Sydney Opera House
  'new-zealand': 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=400&h=300&fit=crop', // NZ mountains
  'fiji': 'https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=400&h=300&fit=crop', // Fiji island
  'maldives': 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&h=300&fit=crop', // Maldives overwater
};

// Helper function to get destination image URL
export function getDestinationImageUrl(destination: Destination): string {
  if (destination.imageUrl) {
    return destination.imageUrl;
  }
  // Return curated image or fallback to picsum with seed
  return DESTINATION_IMAGES[destination.id] || `https://picsum.photos/seed/${destination.id}/400/300`;
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
