import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Same basePath rule as next.config.ts and AppProvider.tsx - the static export
// is served from /TravelAgentZero on GitHub Pages.
export function assetPath(path: string): string {
  const basePath = process.env.NODE_ENV === 'production' ? '/TravelAgentZero' : '';
  return `${basePath}${path}`;
}

export function formatDuration(days: number): string {
  if (days === 1) return '1 day';
  return `${days} days`;
}

export function formatFlightTime(hours: number | undefined): string {
  if (hours == null) return 'n/a';
  if (hours === 0) return 'Local';
  if (hours < 1) return `${Math.round(hours * 60)}min`;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function getScoreColor(score: number, max: number): string {
  const percentage = (score / max) * 100;
  if (percentage >= 80) return 'var(--retro-green)';
  if (percentage >= 60) return 'var(--retro-cyan)';
  if (percentage >= 40) return 'var(--retro-yellow)';
  if (percentage >= 20) return 'var(--retro-orange)';
  return 'var(--retro-red)';
}
