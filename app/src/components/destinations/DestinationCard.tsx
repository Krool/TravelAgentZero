'use client';

import Link from 'next/link';
import { Destination, Traveler, UserPreferences, getDestinationImageUrl } from '@/types';
import { ScoreBreakdown } from '@/lib/scoring';
import { RetroCard } from '@/components/ui/RetroCard';
import { ScoreBadge } from '@/components/ui/ScoreGauge';
import { MonthHeatmapInline } from '@/components/ui/MonthHeatmap';
import { formatDuration, formatFlightTime, cn } from '@/lib/utils';
import { getMaxPossibleScore } from '@/lib/scoring';
import { useButtonSound } from '@/hooks/useSound';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/hooks/useToast';

interface DestinationCardProps {
  destination: Destination;
  score: ScoreBreakdown;
  preferences: UserPreferences;
  travelers: Traveler[];
  className?: string;
}

export function DestinationCard({
  destination,
  score,
  preferences,
  className,
}: DestinationCardProps) {
  const buttonSound = useButtonSound();
  const { toggleFavorite, toggleCompare } = useAppStore();
  const toast = useToast();
  const maxScore = getMaxPossibleScore();

  const isFavorite = preferences.favorites.includes(destination.id);
  const isInCompare = preferences.compareList.includes(destination.id);
  const compareIndex = preferences.compareList.indexOf(destination.id);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(destination.id);
    if (isFavorite) {
      toast.info(`Removed ${destination.name} from favorites`);
    } else {
      toast.success(`Added ${destination.name} to favorites`);
    }
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isInCompare && preferences.compareList.length >= 3) {
      toast.warning('Compare list full. Remove a destination to add more.');
      return;
    }
    toggleCompare(destination.id);
    if (isInCompare) {
      toast.info(`Removed ${destination.name} from comparison`);
    } else {
      toast.success(`Added ${destination.name} to comparison`);
    }
  };

  const imageUrl = getDestinationImageUrl(destination);

  return (
    <Link
      href={`/destination/${destination.id}`}
      onMouseEnter={buttonSound.onMouseEnter}
      onClick={buttonSound.onClick}
    >
      <RetroCard
        className={cn(
          'cursor-pointer relative overflow-hidden group',
          className
        )}
        glow
      >
        {/* Hero Image */}
        <div className="h-48 relative overflow-hidden rounded-t-xl">
          <img
            src={imageUrl}
            alt={destination.name}
            width={800}
            height={600}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
              target.parentElement!.classList.add('bg-bg-card', 'flex', 'items-center', 'justify-center');
              const fallback = document.createElement('span');
              fallback.className = 'text-retro-cyan text-xs uppercase font-medium';
              fallback.textContent = destination.name;
              target.parentElement!.appendChild(fallback);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-bg-card/40 to-transparent" />

          {/* Score badge overlay */}
          <div className="absolute bottom-3 left-3">
            <ScoreBadge value={score.total} max={maxScore} />
          </div>

          {/* Region eyebrow */}
          <div className="absolute bottom-3 right-3">
            <span className="eyebrow text-white/80 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md">
              {destination.region}
            </span>
          </div>

          {/* Action buttons */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
            <button
              onClick={handleCompare}
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center transition-all backdrop-blur-sm',
                isInCompare
                  ? 'bg-retro-magenta/30 text-retro-magenta border border-retro-magenta/30'
                  : 'bg-black/40 text-white/70 hover:text-retro-magenta hover:bg-black/60'
              )}
              aria-label={isInCompare ? `Remove ${destination.name} from comparison` : `Add ${destination.name} to comparison`}
              aria-pressed={isInCompare}
            >
              {isInCompare ? (
                <span className="text-xs font-bold">{compareIndex + 1}</span>
              ) : (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M3 12h18M3 18h18" /><path d="M8 6v12M16 6v12" />
                </svg>
              )}
            </button>

            <button
              onClick={handleFavorite}
              className={cn(
                'favorite-btn w-8 h-8 rounded-lg flex items-center justify-center transition-all backdrop-blur-sm',
                isFavorite
                  ? 'active bg-retro-yellow/20 border border-retro-yellow/30'
                  : 'bg-black/40 text-white/70 hover:text-retro-yellow hover:bg-black/60'
              )}
              aria-label={isFavorite ? `Remove ${destination.name} from favorites` : `Add ${destination.name} to favorites`}
              aria-pressed={isFavorite}
            >
              {isFavorite ? '★' : '☆'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Header */}
          <div className="mb-3">
            <h3 className="display-title text-lg text-text-primary truncate group-hover:text-retro-cyan transition-colors">
              {destination.name}
            </h3>
            <p className="text-text-muted text-xs truncate mt-0.5">
              {destination.countries.join(', ')}
            </p>
          </div>

          {/* Highlight teaser */}
          {destination.highlights && destination.highlights.length > 0 && (
            <p className="text-text-secondary text-xs mb-3 truncate">
              <span className="text-retro-green mr-1">✦</span>
              {destination.highlights[0]}
            </p>
          )}

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
            <div className="flex items-center gap-1.5 text-text-secondary">
              <svg className="w-3 h-3 text-text-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
              </svg>
              <span>{formatDuration(destination.duration)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-text-secondary">
              <svg className="w-3 h-3 text-text-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 22-7z" />
              </svg>
              <span>{formatFlightTime(destination.flightTimes[preferences.homeAirport] || 0)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-text-secondary">
              <svg className="w-3 h-3 text-text-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z" />
              </svg>
              <span>{destination.climate}</span>
            </div>
            <div className="flex items-center gap-1.5 text-text-secondary">
              <svg className="w-3 h-3 text-text-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" /><path d="M8 2v16M16 6v16" />
              </svg>
              <span>{destination.type}</span>
            </div>
          </div>

          {/* Stat bars */}
          <div className="space-y-1.5 mb-3">
            <StatBar label="Cost" value={destination.cost} max={10} inverted />
            <StatBar label="Safety" value={10 - destination.danger} max={10} />
            <StatBar label="Kid-Friendly" value={destination.easeWithChild} max={10} />
          </div>

          {/* Month heatmap */}
          <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
            <span className="text-xs text-text-muted">Best Months</span>
            <MonthHeatmapInline
              data={destination.bestMonths}
              selectedMonth={preferences.travelMonth}
            />
          </div>
        </div>
      </RetroCard>
    </Link>
  );
}

// Mini stat bar component
function StatBar({
  label,
  value,
  max,
  inverted = false,
}: {
  label: string;
  value: number;
  max: number;
  inverted?: boolean;
}) {
  const displayValue = inverted ? max - value : value;
  const percentage = (displayValue / max) * 100;

  let color = 'var(--retro-green)';
  if (percentage < 40) color = 'var(--retro-red)';
  else if (percentage < 60) color = 'var(--retro-orange)';
  else if (percentage < 80) color = 'var(--retro-cyan)';

  return (
    <div className="flex items-center gap-2" role="meter" aria-label={label} aria-valuenow={displayValue} aria-valuemin={0} aria-valuemax={max}>
      <span className="text-xs text-text-muted w-20 truncate">
        {label}
      </span>
      <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <span className="sr-only">{displayValue} out of {max}</span>
    </div>
  );
}

// Compact list view card
export function DestinationCardCompact({
  destination,
  score,
  preferences,
  className,
}: DestinationCardProps) {
  const buttonSound = useButtonSound();
  const { toggleFavorite, toggleCompare } = useAppStore();
  const toast = useToast();
  const maxScore = getMaxPossibleScore();

  const isFavorite = preferences.favorites.includes(destination.id);
  const isInCompare = preferences.compareList.includes(destination.id);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(destination.id);
    if (isFavorite) {
      toast.info(`Removed ${destination.name} from favorites`);
    } else {
      toast.success(`Added ${destination.name} to favorites`);
    }
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isInCompare && preferences.compareList.length >= 3) {
      toast.warning('Compare list full. Remove a destination to add more.');
      return;
    }
    toggleCompare(destination.id);
    if (isInCompare) {
      toast.info(`Removed ${destination.name} from comparison`);
    } else {
      toast.success(`Added ${destination.name} to comparison`);
    }
  };

  const imageUrl = getDestinationImageUrl(destination);

  return (
    <Link
      href={`/destination/${destination.id}`}
      onMouseEnter={buttonSound.onMouseEnter}
      onClick={buttonSound.onClick}
    >
      <RetroCard
        className={cn(
          'p-3 cursor-pointer flex items-center gap-4 group',
          className
        )}
      >
        {/* Score */}
        <div className="w-14 shrink-0 flex justify-center">
          <ScoreBadge value={score.total} max={maxScore} />
        </div>

        {/* Image */}
        <div className="w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-bg-dark">
          <img
            src={imageUrl}
            alt={destination.name}
            width={64}
            height={64}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-text-primary truncate group-hover:text-retro-cyan transition-colors">
            {destination.name}
          </h3>
          <p className="text-text-muted text-xs truncate">
            {destination.countries.join(', ')}
          </p>
          <p className="text-text-muted text-[10px] truncate mt-0.5">
            {formatDuration(destination.duration)} · {formatFlightTime(destination.flightTimes[preferences.homeAirport] || 0)} flight
          </p>
        </div>

        {/* Month indicator */}
        <div className="w-28 shrink-0 hidden sm:flex justify-center">
          <MonthHeatmapInline
            data={destination.bestMonths}
            selectedMonth={preferences.travelMonth}
          />
        </div>

        {/* Action buttons */}
        <div className="w-20 flex items-center justify-end gap-1 shrink-0">
          <button
            onClick={handleCompare}
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-all text-xs',
              isInCompare
                ? 'bg-retro-magenta/15 text-retro-magenta'
                : 'text-text-muted hover:text-retro-magenta'
            )}
            aria-label={isInCompare ? `Remove ${destination.name} from comparison` : `Add ${destination.name} to comparison`}
            aria-pressed={isInCompare}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" /><path d="M8 6v12M16 6v12" />
            </svg>
          </button>
          <button
            onClick={handleFavorite}
            className={cn(
              'favorite-btn w-8 h-8 rounded-lg flex items-center justify-center transition-all',
              isFavorite
                ? 'active'
                : 'text-text-muted hover:text-retro-yellow'
            )}
            aria-label={isFavorite ? `Remove ${destination.name} from favorites` : `Add ${destination.name} to favorites`}
            aria-pressed={isFavorite}
          >
            {isFavorite ? '★' : '☆'}
          </button>
        </div>
      </RetroCard>
    </Link>
  );
}
