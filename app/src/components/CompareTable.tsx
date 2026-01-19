'use client';

import { useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { calculateScore, getMaxPossibleScore } from '@/lib/scoring';
import { RetroButton } from '@/components/ui/RetroButton';
import { formatDuration, formatFlightTime, cn } from '@/lib/utils';
import { MONTH_NAMES, MONTHS_ORDERED, Month } from '@/types';
import { useSound } from '@/hooks/useSound';

interface CompareTableProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CompareTable({ isOpen, onClose }: CompareTableProps) {
  const { play } = useSound();
  const {
    destinations,
    preferences,
    travelers,
    toggleCompare,
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

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Play sound when opening
  useEffect(() => {
    if (isOpen) {
      play('select');
    }
  }, [isOpen, play]);

  if (!isOpen || compareDestinations.length === 0) return null;

  // Find best values for highlighting
  const findBest = (values: (number | null)[], higherIsBetter = true) => {
    const validValues = values.filter((v): v is number => v !== null);
    if (validValues.length === 0) return null;
    return higherIsBetter
      ? Math.max(...validValues)
      : Math.min(...validValues);
  };

  const scoreValues = scores.map((s) => s?.total ?? null);
  const durationValues = compareDestinations.map((d) => d?.duration ?? null);
  const flightValues = compareDestinations.map((d) => d?.flightTimes[preferences.homeAirport] ?? null);
  const costValues = compareDestinations.map((d) => d?.cost ?? null);
  const safetyValues = compareDestinations.map((d) => d ? 10 - d.danger : null);
  const kidFriendlyValues = compareDestinations.map((d) => d?.easeWithChild ?? null);

  const bestScore = findBest(scoreValues);
  const bestFlight = findBest(flightValues, false); // Lower is better
  const bestCost = findBest(costValues, false); // Lower is better
  const bestSafety = findBest(safetyValues);
  const bestKidFriendly = findBest(kidFriendlyValues);

  // Helper to check if value is the best
  const isBest = (value: number | null, best: number | null) =>
    value !== null && best !== null && value === best;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-deep/95 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-table-title"
    >
      <div
        className="bg-bg-card border-2 border-retro-magenta rounded-lg max-w-5xl w-full max-h-[90vh] overflow-auto shadow-[0_0_30px_rgba(255,0,255,0.3)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-retro-magenta/30 sticky top-0 bg-bg-card z-10">
          <h2
            id="compare-table-title"
            className="font-mono font-bold text-lg text-retro-magenta uppercase"
          >
            Compare Destinations
          </h2>
          <RetroButton variant="ghost" size="sm" onClick={onClose}>
            Close (ESC)
          </RetroButton>
        </div>

        {/* Table */}
        <div className="p-4 overflow-x-auto">
          <table className="w-full font-mono text-sm">
            <thead>
              <tr>
                <th className="text-left p-2 text-text-muted uppercase text-xs w-32">Attribute</th>
                {compareDestinations.map((dest) => (
                  <th key={dest!.id} className="text-center p-2 min-w-[150px]">
                    <Link
                      href={`/destination/${dest!.id}`}
                      className="text-retro-cyan hover:glow-cyan transition-all"
                    >
                      {dest!.name}
                    </Link>
                    <div className="text-[10px] text-text-muted font-normal">
                      {dest!.countries.join(', ')}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Score */}
              <TableRow label="Score">
                {scores.map((score, i) => (
                  <td
                    key={i}
                    className={cn(
                      'text-center p-2',
                      isBest(score?.total ?? null, bestScore) && 'text-retro-green font-bold'
                    )}
                  >
                    {score ? `${Math.round((score.total / maxScore) * 100)}%` : '-'}
                  </td>
                ))}
              </TableRow>

              {/* Duration */}
              <TableRow label="Duration">
                {compareDestinations.map((dest, i) => (
                  <td key={i} className="text-center p-2">
                    {dest ? formatDuration(dest.duration) : '-'}
                  </td>
                ))}
              </TableRow>

              {/* Flight Time */}
              <TableRow label="Flight Time">
                {compareDestinations.map((dest, i) => {
                  const hours = dest?.flightTimes[preferences.homeAirport];
                  return (
                    <td
                      key={i}
                      className={cn(
                        'text-center p-2',
                        isBest(hours ?? null, bestFlight) && 'text-retro-green font-bold'
                      )}
                    >
                      {hours ? formatFlightTime(hours) : '-'}
                    </td>
                  );
                })}
              </TableRow>

              {/* Cost */}
              <TableRow label="Cost">
                {compareDestinations.map((dest, i) => (
                  <td
                    key={i}
                    className={cn(
                      'text-center p-2',
                      isBest(dest?.cost ?? null, bestCost) && 'text-retro-green font-bold'
                    )}
                  >
                    {dest ? (
                      <span className={cn(
                        dest.cost <= 3 ? 'text-retro-green' :
                        dest.cost <= 6 ? 'text-retro-orange' : 'text-retro-red',
                        isBest(dest.cost, bestCost) && 'font-bold'
                      )}>
                        {'$'.repeat(Math.ceil(dest.cost / 2))}
                      </span>
                    ) : '-'}
                  </td>
                ))}
              </TableRow>

              {/* Safety */}
              <TableRow label="Safety">
                {compareDestinations.map((dest, i) => {
                  const safety = dest ? 10 - dest.danger : null;
                  return (
                    <td
                      key={i}
                      className={cn(
                        'text-center p-2',
                        isBest(safety, bestSafety) && 'text-retro-green font-bold'
                      )}
                    >
                      {safety !== null ? `${safety}/10` : '-'}
                    </td>
                  );
                })}
              </TableRow>

              {/* Kid-Friendly */}
              <TableRow label="Kid-Friendly">
                {compareDestinations.map((dest, i) => (
                  <td
                    key={i}
                    className={cn(
                      'text-center p-2',
                      isBest(dest?.easeWithChild ?? null, bestKidFriendly) && 'text-retro-green font-bold'
                    )}
                  >
                    {dest ? `${dest.easeWithChild}/10` : '-'}
                  </td>
                ))}
              </TableRow>

              {/* Climate */}
              <TableRow label="Climate">
                {compareDestinations.map((dest, i) => (
                  <td key={i} className="text-center p-2">
                    {dest?.climate || '-'}
                  </td>
                ))}
              </TableRow>

              {/* Type */}
              <TableRow label="Type">
                {compareDestinations.map((dest, i) => (
                  <td key={i} className="text-center p-2">
                    {dest?.type || '-'}
                  </td>
                ))}
              </TableRow>

              {/* Best Months */}
              <TableRow label="Best Months">
                {compareDestinations.map((dest, i) => (
                  <td key={i} className="text-center p-2 text-xs">
                    {dest ? (
                      <div className="flex flex-wrap justify-center gap-1">
                        {MONTHS_ORDERED.filter(m => dest.bestMonths[m] >= 8).map(m => (
                          <span
                            key={m}
                            className={cn(
                              'px-1 rounded text-[10px]',
                              m === preferences.travelMonth
                                ? 'bg-retro-green/20 text-retro-green'
                                : 'bg-bg-dark text-text-muted'
                            )}
                          >
                            {m.charAt(0).toUpperCase() + m.slice(1, 3)}
                          </span>
                        ))}
                      </div>
                    ) : '-'}
                  </td>
                ))}
              </TableRow>

              {/* Visa */}
              <TableRow label="Visa">
                {compareDestinations.map((dest, i) => (
                  <td key={i} className="text-center p-2 text-xs">
                    {dest?.visaRequirements.toLowerCase().includes('visa-free') ||
                     dest?.visaRequirements.toLowerCase().includes('no visa') ? (
                      <span className="text-retro-green">Visa-Free</span>
                    ) : (
                      <span className="text-text-muted">Required</span>
                    )}
                  </td>
                ))}
              </TableRow>
            </tbody>
          </table>
        </div>

        {/* Footer with actions */}
        <div className="flex items-center justify-center gap-4 p-4 border-t border-retro-magenta/30">
          {compareDestinations.map((dest) => (
            <Link key={dest!.id} href={`/destination/${dest!.id}`}>
              <RetroButton variant="primary" size="sm">
                View {dest!.name.split(' ')[0]}
              </RetroButton>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function TableRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr className="border-t border-bg-hover">
      <td className="p-2 text-text-muted uppercase text-xs">{label}</td>
      {children}
    </tr>
  );
}
