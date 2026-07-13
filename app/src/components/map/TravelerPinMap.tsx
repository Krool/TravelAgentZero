'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { useSound } from '@/hooks/useSound';
import { RetroCard } from '@/components/ui/RetroCard';
import { WORLD_DOTS, projectPoint } from './worldDots';
import { cn } from '@/lib/utils';

// One color per traveler, cycling through the retro palette.
const PIN_COLORS = [
  'var(--retro-cyan)',
  'var(--retro-magenta)',
  'var(--retro-yellow)',
  'var(--retro-green)',
  'var(--retro-orange)',
  'var(--retro-blue)',
  'var(--retro-red)',
];

interface Pin {
  key: string;
  destinationId: string;
  destinationName: string;
  travelerId: string;
  travelerName: string;
  color: string;
  x: number;
  y: number;
}

export function TravelerPinMap() {
  const { travelers, destinations, preferences } = useAppStore();
  const { play } = useSound();
  const router = useRouter();

  // Legend visibility: start from the travelers checked into scoring; if none
  // are checked, show everyone so the board never starts empty for no reason.
  const [hidden, setHidden] = useState<Set<string>>(() => {
    const selected = new Set(preferences.selectedTravelers);
    if (selected.size === 0) return new Set();
    return new Set(travelers.filter((t) => !selected.has(t.id)).map((t) => t.id));
  });

  const travelerColor = useMemo(() => {
    const map = new Map<string, string>();
    travelers.forEach((t, i) => map.set(t.id, PIN_COLORS[i % PIN_COLORS.length]));
    return map;
  }, [travelers]);

  // The dot-matrix landmass as a single path: one zero-length segment per dot,
  // drawn with round linecaps. One DOM node instead of ~4000 circles.
  const landPath = useMemo(
    () => WORLD_DOTS.map((d) => `M${d.x} ${d.y}l0 0`).join(''),
    []
  );

  // A faint marker at every destination. Doubles as land for small islands
  // (Tahiti, Hawaii, Maldives...) that fall through the 2-degree dot grid.
  const destinationDotsPath = useMemo(
    () =>
      destinations
        .filter((d) => d.coordinates)
        .map((d) => {
          const { x, y } = projectPoint(d.coordinates!.lat, d.coordinates!.lng);
          return `M${Math.round(x * 10) / 10} ${Math.round(y * 10) / 10}l0 0`;
        })
        .join(''),
    [destinations]
  );

  const pins = useMemo(() => {
    const result: Pin[] = [];
    const byDestination = new Map<string, number>();

    for (const traveler of travelers) {
      if (hidden.has(traveler.id)) continue;
      const color = travelerColor.get(traveler.id)!;
      for (const [destId, data] of Object.entries(traveler.destinations)) {
        if (!data.hasVisited) continue;
        const dest = destinations.find((d) => d.id === destId);
        if (!dest?.coordinates) continue;
        const { x, y } = projectPoint(dest.coordinates.lat, dest.coordinates.lng);
        // Several travelers on one destination: fan the pins out sideways so
        // every color stays visible.
        const slot = byDestination.get(destId) ?? 0;
        byDestination.set(destId, slot + 1);
        result.push({
          key: `${traveler.id}:${destId}`,
          destinationId: destId,
          destinationName: dest.name,
          travelerId: traveler.id,
          travelerName: traveler.name,
          color,
          x: x + slot * 9,
          y,
        });
      }
    }
    return result;
  }, [travelers, destinations, hidden, travelerColor]);

  // Animate only pins that appeared after the initial render (a checkbox was
  // just ticked), and ping a sound with them. First paint gets a quiet
  // staggered cascade instead.
  const [newKeys, setNewKeys] = useState<Set<string>>(new Set());
  const prevKeysRef = useRef<Set<string> | null>(null);
  useEffect(() => {
    const current = new Set(pins.map((p) => p.key));
    const prev = prevKeysRef.current;
    prevKeysRef.current = current;
    if (!prev) return;
    const added = [...current].filter((k) => !prev.has(k));
    if (added.length > 0) {
      setNewKeys(new Set(added));
      play('success');
    }
  }, [pins, play]);

  const toggleTravelerPins = (id: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (travelers.length === 0) return null;

  return (
    <RetroCard className="mb-6 overflow-hidden">
      <div className="px-5 pt-4 pb-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-sm text-retro-cyan">Pin Board</h2>
          <p className="telemetry mt-0.5">
            <span className="telemetry-key">Pins:</span>{' '}
            <span className="telemetry-value">{pins.length}</span>
          </p>
        </div>
        {/* Legend: one chip per traveler, click to show/hide their pins */}
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Toggle traveler pins">
          {travelers.map((t) => {
            const isHidden = hidden.has(t.id);
            const visited = Object.values(t.destinations).filter((d) => d.hasVisited).length;
            return (
              <button
                key={t.id}
                onClick={() => toggleTravelerPins(t.id)}
                aria-pressed={!isHidden}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border transition-all',
                  isHidden
                    ? 'border-white/10 text-text-muted opacity-50'
                    : 'border-white/15 text-text-primary'
                )}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: travelerColor.get(t.id), opacity: isHidden ? 0.4 : 1 }}
                  aria-hidden="true"
                />
                {t.name}
                <span className="text-text-muted">{visited}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-2 pb-3">
        <svg
          viewBox="40 20 920 440"
          className="w-full h-auto"
          role="img"
          aria-label={`World map with ${pins.length} pins marking visited destinations`}
        >
          {/* Landmass dot matrix */}
          <path
            d={landPath}
            stroke="rgba(34, 211, 238, 0.16)"
            strokeWidth={2.4}
            strokeLinecap="round"
            fill="none"
          />

          {/* Every destination as a faint marker */}
          <path
            d={destinationDotsPath}
            stroke="rgba(34, 211, 238, 0.45)"
            strokeWidth={2.6}
            strokeLinecap="round"
            fill="none"
          />

          {/* Pins */}
          {pins.map((pin, i) => {
            const isNew = newKeys.has(pin.key);
            return (
              <g
                key={pin.key}
                transform={`translate(${pin.x}, ${pin.y})`}
                className="pin cursor-pointer"
                onClick={() => router.push(`/destination/${pin.destinationId}`)}
                tabIndex={0}
                role="link"
                aria-label={`${pin.destinationName}, visited by ${pin.travelerName}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    router.push(`/destination/${pin.destinationId}`);
                  }
                }}
              >
                <title>{`${pin.destinationName} - ${pin.travelerName}`}</title>
                {/* Inner group carries the drop animation so the outer
                    positioning transform is never overridden by CSS. */}
                <g
                  className={isNew ? 'pin-drop-now' : 'pin-drop-initial'}
                  style={isNew ? undefined : { animationDelay: `${Math.min(i * 35, 1400)}ms` }}
                >
                  {isNew && (
                    <circle className="pin-ping" cx={0} cy={0} r={5} fill="none" stroke={pin.color} strokeWidth={1.5} />
                  )}
                  <line x1={0} y1={0} x2={0} y2={-11} stroke={pin.color} strokeWidth={1.8} />
                  <circle cx={0} cy={-14} r={7.5} fill={pin.color} opacity={0.18} />
                  <circle className="pin-head" cx={0} cy={-14} r={4} fill={pin.color} />
                  <circle cx={0} cy={0} r={1.6} fill={pin.color} opacity={0.9} />
                </g>
              </g>
            );
          })}
        </svg>
        {pins.length === 0 && (
          <p className="text-text-muted text-xs text-center -mt-6 pb-4">
            No pins yet. Expand a traveler below and check off where they have been.
          </p>
        )}
      </div>
    </RetroCard>
  );
}
