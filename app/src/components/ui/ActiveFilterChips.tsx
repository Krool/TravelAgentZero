'use client';

import { useAppStore } from '@/lib/store';
import { getActiveFilters, ActiveFilter } from '@/lib/filterUtils';
import { DEFAULT_PREFERENCES } from '@/types';
import { useSound } from '@/hooks/useSound';
import { cn } from '@/lib/utils';

export function ActiveFilterChips() {
  const { preferences, setPreferences } = useAppStore();
  const { play } = useSound();
  const activeFilters = getActiveFilters(preferences);

  if (activeFilters.length === 0) return null;

  const handleClearFilter = (filter: ActiveFilter) => {
    play('click');

    switch (filter.clearAction) {
      case 'travelMonth':
        setPreferences({ travelMonth: DEFAULT_PREFERENCES.travelMonth });
        break;
      case 'regionPreference':
        setPreferences({ regionPreference: 'Any' });
        break;
      case 'temperaturePreference':
        setPreferences({ temperaturePreference: 'Any' });
        break;
      case 'typePreference':
        setPreferences({ typePreference: 'Any' });
        break;
      case 'budgetSensitivity':
        setPreferences({ budgetSensitivity: DEFAULT_PREFERENCES.budgetSensitivity });
        break;
      case 'maxFlightTime':
        setPreferences({ maxFlightTime: 0 });
        break;
      case 'durationRange':
        setPreferences({
          durationMin: DEFAULT_PREFERENCES.durationMin,
          durationMax: DEFAULT_PREFERENCES.durationMax,
        });
        break;
      case 'visaFreeOnly':
        setPreferences({ visaFreeOnly: false });
        break;
      case 'preferNewPlaces':
        setPreferences({ preferNewPlaces: DEFAULT_PREFERENCES.preferNewPlaces });
        break;
      case 'homeAirport':
        setPreferences({ homeAirport: DEFAULT_PREFERENCES.homeAirport });
        break;
    }
  };

  const handleClearAll = () => {
    play('click');
    setPreferences({
      travelMonth: DEFAULT_PREFERENCES.travelMonth,
      regionPreference: 'Any',
      temperaturePreference: 'Any',
      typePreference: 'Any',
      budgetSensitivity: DEFAULT_PREFERENCES.budgetSensitivity,
      maxFlightTime: 0,
      durationMin: DEFAULT_PREFERENCES.durationMin,
      durationMax: DEFAULT_PREFERENCES.durationMax,
      visaFreeOnly: false,
      preferNewPlaces: DEFAULT_PREFERENCES.preferNewPlaces,
      homeAirport: DEFAULT_PREFERENCES.homeAirport,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {activeFilters.map((filter) => (
        <FilterChip key={filter.key} filter={filter} onClear={() => handleClearFilter(filter)} />
      ))}

      {activeFilters.length >= 2 && (
        <button
          onClick={handleClearAll}
          className="px-3 py-1.5 text-xs rounded-full border border-retro-red/30 text-retro-red hover:bg-retro-red/10 transition-colors"
        >
          Clear All
        </button>
      )}
    </div>
  );
}

function FilterChip({
  filter,
  onClear,
}: {
  filter: ActiveFilter;
  onClear: () => void;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full',
        'border border-retro-cyan/30 bg-retro-cyan/[0.06] text-retro-cyan'
      )}
    >
      <span className="text-text-muted">{filter.label}:</span>
      <span className="font-medium">{filter.value}</span>
      <button
        onClick={onClear}
        className="ml-0.5 w-4 h-4 flex items-center justify-center rounded-full hover:bg-retro-cyan/20 transition-colors"
        aria-label={`Clear ${filter.label} filter`}
      >
        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}

// Filter count badge for the Filters button
export function FilterCountBadge({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <span
      className={cn(
        'absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center',
        'text-[10px] font-bold rounded-full',
        'bg-retro-magenta text-white'
      )}
    >
      {count}
    </span>
  );
}
