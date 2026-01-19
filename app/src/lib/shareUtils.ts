import { UserPreferences, Month, AirportCode } from '@/types';

export interface ShareParams {
  month?: Month;
  airport?: AirportCode;
  durationMin?: number;
  durationMax?: number;
}

/**
 * Encode current preferences to URL search params
 */
export function encodeShareParams(preferences: UserPreferences): string {
  const params = new URLSearchParams();

  // Month (m)
  params.set('m', preferences.travelMonth);

  // Airport (a)
  params.set('a', preferences.homeAirport);

  // Duration range (d) - format: "min-max"
  if (preferences.durationMin !== 6 || preferences.durationMax !== 9) {
    params.set('d', `${preferences.durationMin}-${preferences.durationMax}`);
  }

  return params.toString();
}

/**
 * Decode URL search params to preferences
 */
export function decodeShareParams(searchParams: URLSearchParams): ShareParams {
  const result: ShareParams = {};

  // Month
  const month = searchParams.get('m');
  if (month && isValidMonth(month)) {
    result.month = month as Month;
  }

  // Airport
  const airport = searchParams.get('a');
  if (airport && isValidAirport(airport)) {
    result.airport = airport as AirportCode;
  }

  // Duration
  const duration = searchParams.get('d');
  if (duration) {
    const [min, max] = duration.split('-').map(Number);
    if (!isNaN(min) && !isNaN(max)) {
      result.durationMin = Math.max(3, Math.min(21, min));
      result.durationMax = Math.max(3, Math.min(21, max));
    }
  }

  return result;
}

/**
 * Build a shareable URL for a destination
 */
export function buildShareUrl(destinationId: string, preferences: UserPreferences): string {
  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname.replace(/\/destination\/.*/, '')}`
    : '';

  const params = encodeShareParams(preferences);
  return `${baseUrl}/destination/${destinationId}${params ? `?${params}` : ''}`;
}

/**
 * Copy text to clipboard with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for non-secure contexts
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    }
  } catch {
    return false;
  }
}

/**
 * Check if Web Share API is available
 */
export function canNativeShare(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.share;
}

/**
 * Share using Web Share API
 */
export async function nativeShare(title: string, text: string, url: string): Promise<boolean> {
  try {
    await navigator.share({ title, text, url });
    return true;
  } catch {
    return false;
  }
}

// Validation helpers
function isValidMonth(month: string): boolean {
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  return months.includes(month);
}

function isValidAirport(code: string): boolean {
  const airports = [
    'JFK', 'LAX', 'ORD', 'SFO', 'MIA', 'DEN', 'SEA', 'ATL',
    'LHR', 'CDG', 'FRA', 'AMS', 'MAD', 'FCO',
    'NRT', 'PEK', 'SIN', 'DXB', 'HKG', 'ICN', 'BKK',
    'SYD', 'MEL', 'GRU', 'EZE'
  ];
  return airports.includes(code);
}
