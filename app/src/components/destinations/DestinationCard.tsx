'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Destination, Traveler, UserPreferences, getDestinationImageUrl } from '@/types';
import { ScoreBreakdown } from '@/lib/scoring';
import { RetroCard } from '@/components/ui/RetroCard';
import { ScoreBadge } from '@/components/ui/ScoreGauge';
import { MonthHeatmapInline } from '@/components/ui/MonthHeatmap';
import { formatDuration, formatFlightTime, cn } from '@/lib/utils';
import { getMaxPossibleScore } from '@/lib/scoring';
import { useButtonSound, useSound } from '@/hooks/useSound';
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
  const { play } = useSound();
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

  // Get climate icon
  const climateIcon = {
    Hot: '☀️',
    Cold: '❄️',
    Temperate: '🌤️',
    Mix: '🌡️',
  }[destination.climate];

  // Get type icon
  const typeIcon = {
    Urban: '🏙️',
    Nature: '🌲',
    Mix: '🗺️',
  }[destination.type];

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
        <div className="h-32 relative overflow-hidden">
          <img
            src={imageUrl}
            alt={destination.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-transparent to-transparent" />
          {/* Action buttons */}
          <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
            {/* Compare button */}
            <button
              onClick={handleCompare}
              className={cn(
                'w-7 h-7 rounded flex items-center justify-center transition-all',
                isInCompare
                  ? 'bg-retro-magenta/20 text-retro-magenta'
                  : 'bg-bg-dark/80 text-text-muted hover:text-retro-magenta'
              )}
              aria-label={isInCompare ? 'Remove from comparison' : 'Add to comparison'}
              aria-pressed={isInCompare}
            >
              {isInCompare ? (
                <span className="font-mono text-xs font-bold">{compareIndex + 1}</span>
              ) : (
                '⚖️'
              )}
            </button>

            {/* Favorite button */}
            <button
              onClick={handleFavorite}
              className={cn(
                'favorite-btn w-7 h-7 rounded flex items-center justify-center transition-all',
                isFavorite
                  ? 'active bg-retro-yellow/20'
                  : 'bg-bg-dark/80 text-text-muted hover:text-retro-yellow'
              )}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
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
          <h3 className="font-mono font-semibold text-lg text-retro-cyan truncate group-hover:glow-cyan transition-all">
            {destination.name}
          </h3>
          <p className="text-text-muted text-xs font-mono truncate">
            {destination.countries.join(', ')}
          </p>
        </div>

        {/* Score */}
        <div className="mb-3">
          <ScoreBadge value={score.total} max={maxScore} />
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs font-mono">
          <div className="flex items-center gap-1 text-text-secondary">
            <span>⏱️</span>
            <span>{formatDuration(destination.duration)}</span>
          </div>
          <div className="flex items-center gap-1 text-text-secondary">
            <span>✈️</span>
            <span>{formatFlightTime(destination.flightTimes[preferences.homeAirport] || 0)}</span>
          </div>
          <div className="flex items-center gap-1 text-text-secondary">
            <span>{climateIcon}</span>
            <span>{destination.climate}</span>
          </div>
          <div className="flex items-center gap-1 text-text-secondary">
            <span>{typeIcon}</span>
            <span>{destination.type}</span>
          </div>
        </div>

        {/* Stat bars */}
        <div className="space-y-1 mb-3">
          <StatBar label="Cost" value={destination.cost} max={10} inverted />
          <StatBar label="Safety" value={10 - destination.danger} max={10} />
          <StatBar label="Kid-Friendly" value={destination.easeWithChild} max={10} />
        </div>

        {/* Month heatmap */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted font-mono uppercase">Best Months</span>
          <MonthHeatmapInline
            data={destination.bestMonths}
            selectedMonth={preferences.travelMonth}
          />
        </div>
        </div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-retro-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
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
  // For inverted (like cost), lower is better
  const displayValue = inverted ? max - value : value;
  const percentage = (displayValue / max) * 100;

  // Color based on percentage
  let color = 'var(--retro-green)';
  if (percentage < 40) color = 'var(--retro-red)';
  else if (percentage < 60) color = 'var(--retro-orange)';
  else if (percentage < 80) color = 'var(--retro-cyan)';

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-text-muted font-mono uppercase w-20 truncate">
        {label}
      </span>
      <div className="flex-1 h-1.5 bg-bg-dark rounded-sm overflow-hidden">
        <div
          className="h-full rounded-sm transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
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
  const { play } = useSound();
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
        <div className="w-16 h-16 shrink-0 rounded overflow-hidden bg-bg-dark">
          <img
            src={imageUrl}
            alt={destination.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-mono font-semibold text-sm text-retro-cyan truncate group-hover:glow-cyan">
            {destination.name}
          </h3>
          <p className="text-text-muted text-xs font-mono truncate">
            {destination.countries.join(', ')}
          </p>
          <p className="text-text-muted text-[10px] font-mono truncate mt-0.5">
            {formatDuration(destination.duration)} • {formatFlightTime(destination.flightTimes[preferences.homeAirport] || 0)} flight
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
              'w-7 h-7 rounded flex items-center justify-center transition-all text-xs',
              isInCompare
                ? 'bg-retro-magenta/20 text-retro-magenta'
                : 'text-text-muted hover:text-retro-magenta'
            )}
            aria-label={isInCompare ? 'Remove from comparison' : 'Add to comparison'}
          >
            ⚖️
          </button>
          <button
            onClick={handleFavorite}
            className={cn(
              'favorite-btn w-7 h-7 rounded flex items-center justify-center transition-all',
              isFavorite
                ? 'active'
                : 'text-text-muted hover:text-retro-yellow'
            )}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? '★' : '☆'}
          </button>
        </div>
      </RetroCard>
    </Link>
  );
}
