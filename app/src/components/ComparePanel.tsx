'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { calculateScore, getMaxPossibleScore } from '@/lib/scoring';
import { RetroButton } from '@/components/ui/RetroButton';
import { ScoreGauge } from '@/components/ui/ScoreGauge';
import { MonthHeatmap } from '@/components/ui/MonthHeatmap';
import { CompareTable } from '@/components/CompareTable';
import { formatDuration, formatFlightTime, cn } from '@/lib/utils';

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

  const [mobileExpanded, setMobileExpanded] = useState(false);

  if (preferences.compareList.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 compare-panel">
      <div className="bg-[rgba(15,18,35,0.95)] backdrop-blur-xl border-t border-retro-magenta/30 shadow-[0_-8px_32px_rgba(0,0,0,0.4)]">
        <div className="container mx-auto px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {/* Header */}
          <div className="flex items-center justify-between mb-0 md:mb-4">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-sm text-retro-magenta">
                Comparing {preferences.compareList.length} Destinations
              </span>
              <CompareSlotIndicator count={preferences.compareList.length} max={3} />
            </div>
            <div className="flex items-center gap-2">
              <RetroButton
                variant="secondary"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileExpanded(!mobileExpanded)}
              >
                {mobileExpanded ? 'Collapse' : 'View'}
              </RetroButton>
              <RetroButton
                variant="secondary"
                size="sm"
                className="hidden md:inline-flex"
                onClick={() => setCompareViewExpanded(true)}
              >
                Expand
              </RetroButton>
              <RetroButton variant="ghost" size="sm" onClick={clearCompareList}>
                Clear
              </RetroButton>
            </div>
          </div>

          {/* Mobile expanded view */}
          {mobileExpanded && (
            <div className="md:hidden space-y-3 mt-4 max-h-[60vh] overflow-y-auto">
              {compareDestinations.map((dest, index) => {
                if (!dest) return null;
                const score = scores[index];
                const flightHours = dest.flightTimes[preferences.homeAirport];
                return (
                  <div key={dest.id} className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 relative">
                    <button
                      onClick={() => toggleCompare(dest.id)}
                      className="absolute top-2 right-2 text-text-muted hover:text-retro-red transition-colors p-1"
                      aria-label={`Remove ${dest.name} from comparison`}
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                    <Link href={`/destination/${dest.id}`} className="block hover:text-retro-cyan transition-colors">
                      <h3 className="font-semibold text-text-primary pr-6 mb-1">{dest.name}</h3>
                    </Link>
                    <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                      <div><span className="text-text-muted">Score: </span><span className="text-retro-cyan">{score ? Math.round((score.total / maxScore) * 100) : 0}%</span></div>
                      <div><span className="text-text-muted">Duration: </span><span className="text-text-primary">{formatDuration(dest.duration)}</span></div>
                      <div><span className="text-text-muted">Flight: </span><span className="text-text-primary">{flightHours != null ? formatFlightTime(flightHours) : '-'}</span></div>
                      <div><span className="text-text-muted">Cost: </span><span className={cn(dest.cost <= 3 ? 'text-retro-green' : dest.cost <= 6 ? 'text-retro-orange' : 'text-retro-red')}>{'$'.repeat(Math.ceil(dest.cost / 2))}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Desktop: Full comparison grid */}
          <div className="hidden md:grid grid-cols-3 gap-4">
            {compareDestinations.map((dest, index) => {
              if (!dest) return null;
              const score = scores[index];
              const flightHours = dest.flightTimes[preferences.homeAirport];

              return (
                <div
                  key={dest.id}
                  className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 relative"
                >
                  <button
                    onClick={() => toggleCompare(dest.id)}
                    className="absolute top-3 right-3 text-text-muted hover:text-retro-red transition-colors p-1"
                    aria-label={`Remove ${dest.name} from comparison`}
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                  <Link href={`/destination/${dest.id}`} className="block hover:text-retro-cyan transition-colors">
                    <h3 className="font-semibold text-text-primary pr-6 mb-1">{dest.name}</h3>
                  </Link>
                  <p className="text-xs text-text-muted mb-3">{dest.countries.join(', ')}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div><span className="text-text-muted">Score: </span><span className="text-retro-cyan">{score ? Math.round((score.total / maxScore) * 100) : 0}%</span></div>
                    <div><span className="text-text-muted">Duration: </span><span className="text-text-primary">{formatDuration(dest.duration)}</span></div>
                    <div><span className="text-text-muted">Flight: </span><span className="text-text-primary">{flightHours != null ? formatFlightTime(flightHours) : '-'}</span></div>
                    <div><span className="text-text-muted">Cost: </span><span className={cn(dest.cost <= 3 ? 'text-retro-green' : dest.cost <= 6 ? 'text-retro-orange' : 'text-retro-red')}>{'$'.repeat(Math.ceil(dest.cost / 2))}</span></div>
                  </div>
                  {score && (
                    <div className="space-y-1.5">
                      <ScoreGauge value={score.monthMatch} max={20} label="Month" size="sm" animate={false} />
                      <ScoreGauge value={score.childFriendly} max={12} label="Kid-Friendly" size="sm" animate={false} />
                      <ScoreGauge value={score.safetyScore} max={8} label="Safety" size="sm" animate={false} />
                    </div>
                  )}
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
                className="border border-dashed border-white/10 rounded-xl p-3 flex items-center justify-center min-h-[200px]"
              >
                <span className="text-sm text-text-muted">
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

function CompareSlotIndicator({ count, max }: { count: number; max: number }) {
  return (
    <div className="flex items-center gap-1" role="status" aria-label={`${count} of ${max} comparison slots used`}>
      {Array.from({ length: max }).map((_, i) => {
        const isFilled = i < count;

        return (
          <div
            key={i}
            className={cn(
              'w-2.5 h-2.5 rounded-full transition-all',
              isFilled
                ? 'bg-retro-magenta shadow-[0_0_6px_rgba(232,121,249,0.4)]'
                : 'border border-white/20 bg-transparent'
            )}
          />
        );
      })}
    </div>
  );
}
