import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function formatDuration(days: number): string {
  if (days === 1) return '1 day';
  return `${days} days`;
}

export function formatFlightTime(hours: number): string {
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

export function getScoreGrade(score: number, max: number): string {
  const percentage = (score / max) * 100;
  if (percentage >= 90) return 'S';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
}
