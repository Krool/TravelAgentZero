'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { calculateScore, getMaxPossibleScore } from '@/lib/scoring';
import { RetroButton } from '@/components/ui/RetroButton';
import { ScoreGauge } from '@/components/ui/ScoreGauge';
import { MonthHeatmap } from '@/components/ui/MonthHeatmap';
import { CompareTable } from '@/components/CompareTable';
import { formatDuration, formatFlightTime, cn } from '@/lib/utils';
import { AIRPORT_HUBS } from '@/types';

export function ComparePanel() {
  const {
    destinations,
    preferences,
    travelers,
    clearCompareList,
    toggleCompare,
    compareViewExpanded,
    setCompareViewExpanded,
  } = useAppStore();

  const compareDestinations = useMemo(() => {
    return preferences.compareList
      .map((id) => destinations.find((d) => d.id === id))
      .filter(Boolean);
  }, [destinations, preferences.compareList]);

  const scores = useMemo(() => {
    return compareDestinations.map((dest) =>
      dest ? calculateScore(dest, preferences, travelers) : null
    );
  }, [compareDestinations, preferences, travelers]);

  const maxScore = getMaxPossibleScore();

  if (preferences.compareList.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 compare-panel">
      <div className="bg-bg-card border-t-2 border-retro-magenta shadow-lg">
        <div className="container mx-auto px-4 py-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-sm text-retro-magenta uppercase">
                Comparing {preferences.compareList.length} Destinations
              </span>
              {/* Slot indicator */}
              <CompareSlotIndicator count={preferences.compareList.length} max={3} />
            </div>
            <div className="flex items-center gap-2">
              <RetroButton
                variant="secondary"
                size="sm"
                onClick={() => setCompareViewExpanded(true)}
              >
                Expand
              </RetroButton>
              <RetroButton variant="ghost" size="sm" onClick={clearCompareList}>
                Clear All
              </RetroButton>
            </div>
          </div>

          {/* Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {compareDestinations.map((dest, index) => {
              if (!dest) return null;
              const score = scores[index];
              const flightHours = dest.flightTimes[preferences.homeAirport] || 0;

              return (
                <div
                  key={dest.id}
                  className="bg-bg-dark border border-retro-cyan/30 rounded p-3 relative"
                >
                  {/* Remove button */}
                  <button
                    onClick={() => toggleCompare(dest.id)}
                    className="absolute top-2 right-2 text-text-muted hover:text-retro-red transition-colors"
                    aria-label={`Remove ${dest.name} from comparison`}
                  >
                    ✕
                  </button>

                  {/* Name and score */}
                  <Link
                    href={`/destination/${dest.id}`}
                    className="block hover:text-retro-cyan transition-colors"
                  >
                    <h3 className="font-mono font-semibold text-text-primary pr-6 mb-1">
                      {dest.name}
                    </h3>
                  </Link>
                  <p className="font-mono text-xs text-text-muted mb-3">
                    {dest.countries.join(', ')}
                  </p>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-3">
                    <div>
                      <span className="text-text-muted">Score: </span>
                      <span className="text-retro-cyan">
                        {score ? Math.round((score.total / maxScore) * 100) : 0}%
                      </span>
                    </div>
                    <div>
                      <span className="text-text-muted">Duration: </span>
                      <span className="text-text-primary">{formatDuration(dest.duration)}</span>
                    </div>
                    <div>
                      <span className="text-text-muted">Flight: </span>
                      <span className="text-text-primary">{formatFlightTime(flightHours)}</span>
                    </div>
                    <div>
                      <span className="text-text-muted">Cost: </span>
                      <span className={cn(
                        dest.cost <= 3 ? 'text-retro-green' :
                        dest.cost <= 6 ? 'text-retro-orange' : 'text-retro-red'
                      )}>
                        {'$'.repeat(Math.ceil(dest.cost / 2))}
                      </span>
                    </div>
                  </div>

                  {/* Score Bars */}
                  {score && (
                    <div className="space-y-1">
                      <ScoreGauge value={score.monthMatch} max={20} label="Month" size="sm" animate={false} />
                      <ScoreGauge value={score.childFriendly} max={12} label="Kid-Friendly" size="sm" animate={false} />
                      <ScoreGauge value={score.safetyScore} max={8} label="Safety" size="sm" animate={false} />
                    </div>
                  )}

                  {/* Best Months Mini */}
                  <div className="mt-3">
                    <MonthHeatmap data={dest.bestMonths} size="sm" />
                  </div>
                </div>
              );
            })}

            {/* Empty slots */}
            {Array.from({ length: 3 - preferences.compareList.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="border border-dashed border-text-muted/30 rounded p-3 flex items-center justify-center min-h-[200px]"
              >
                <span className="font-mono text-sm text-text-muted">
                  Add destination to compare
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expanded table view */}
      <CompareTable
        isOpen={compareViewExpanded}
        onClose={() => setCompareViewExpanded(false)}
      />
    </div>
  );
}

// Slot indicator showing filled/empty circles
function CompareSlotIndicator({ count, max }: { count: number; max: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => {
        const isFilled = i < count;
        const isWarning = count === 2;
        const isFull = count === 3;

        return (
          <div
            key={i}
            className={cn(
              'w-3 h-3 rounded-full border-2 transition-all',
              isFilled
                ? isFull
                  ? 'bg-retro-red border-retro-red shadow-[0_0_8px_rgba(255,51,102,0.5)]'
                  : isWarning
                  ? 'bg-retro-orange border-retro-orange shadow-[0_0_8px_rgba(255,107,53,0.5)]'
                  : 'bg-retro-magenta border-retro-magenta'
                : 'border-text-muted/50 bg-transparent'
            )}
          />
        );
      })}
    </div>
  );
}
