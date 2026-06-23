'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { filterDestinations, sortDestinationsByScore } from '@/lib/scoring';
import { DestinationCard, DestinationCardCompact } from '@/components/destinations/DestinationCard';
import { FilterPanel } from '@/components/filters/FilterPanel';
import { RetroButton } from '@/components/ui/RetroButton';
import { RetroCard } from '@/components/ui/RetroCard';
import { SearchInput } from '@/components/ui/SearchInput';
import { ComparePanel } from '@/components/ComparePanel';
import { Onboarding, HelpModal } from '@/components/Onboarding';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ActiveFilterChips, FilterCountBadge } from '@/components/ui/ActiveFilterChips';
import { SurpriseButton } from '@/components/ui/SurpriseButton';
import { getActiveFilterCount } from '@/lib/filterUtils';
import { cn } from '@/lib/utils';
import { MONTH_NAMES, AIRPORT_HUBS, hasChildTraveler } from '@/types';

type ViewMode = 'grid' | 'list' | 'favorites';
type SortMode = 'score' | 'name' | 'cost' | 'flight' | 'duration';

const PAGE_SIZE = 24;

export default function HomePage() {
  const { destinations, travelers, preferences, isLoaded, setSearchQuery } = useAppStore();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('score');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const hasChildren = hasChildTraveler(travelers, preferences.selectedTravelers);
  const childCount = travelers
    .filter(t => preferences.selectedTravelers.includes(t.id))
    .filter(t => t.isChild)
    .length;

  const sortedDestinations = useMemo(() => {
    if (!isLoaded) return [];

    const filtered = filterDestinations(destinations, preferences, travelers);
    const scored = sortDestinationsByScore(filtered, preferences, travelers);

    if (sortMode === 'score') return scored;

    return [...scored].sort((a, b) => {
      switch (sortMode) {
        case 'name':
          return a.destination.name.localeCompare(b.destination.name);
        case 'cost':
          return a.destination.cost - b.destination.cost;
        case 'flight': {
          const fa = a.destination.flightTimes[preferences.homeAirport] || 99;
          const fb = b.destination.flightTimes[preferences.homeAirport] || 99;
          return fa - fb;
        }
        case 'duration':
          return a.destination.duration - b.destination.duration;
        default:
          return 0;
      }
    });
  }, [destinations, travelers, preferences, isLoaded, sortMode]);

  const favoriteDestinations = useMemo(() => {
    if (!isLoaded) return [];
    return sortedDestinations.filter(({ destination }) =>
      preferences.favorites.includes(destination.id)
    );
  }, [sortedDestinations, preferences.favorites, isLoaded]);

  const activeFilterCount = getActiveFilterCount(preferences);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      switch (e.key) {
        case '/':
          e.preventDefault();
          document.querySelector<HTMLInputElement>('input[type="search"]')?.focus();
          break;
        case 'g':
        case 'G':
          setViewMode('grid');
          break;
        case 'l':
        case 'L':
          setViewMode('list');
          break;
        case 'f':
        case 'F':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            setShowFilters((prev) => !prev);
          }
          break;
        case '?':
          setShowHelp(true);
          break;
        case 'escape':
          setShowFilters(false);
          setShowHelp(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, [setSearchQuery]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [sortMode, viewMode, preferences.travelMonth, preferences.homeAirport, preferences.searchQuery,
      preferences.regionPreference, preferences.temperaturePreference, preferences.typePreference,
      preferences.budgetSensitivity, preferences.maxFlightTime, preferences.maxDanger,
      preferences.durationMin, preferences.durationMax, preferences.visaFreeOnly, preferences.preferNewPlaces]);

  const allDisplayDestinations = viewMode === 'favorites' ? favoriteDestinations : sortedDestinations;
  const displayDestinations = allDisplayDestinations.slice(0, visibleCount);
  const hasMore = visibleCount < allDisplayDestinations.length;

  const getEmptyStateMessage = () => {
    if (preferences.searchQuery.trim()) {
      return {
        title: 'No search results',
        message: `No destinations match "${preferences.searchQuery}"`,
        suggestion: 'Try a different search term or clear the search',
      };
    }
    if (viewMode === 'favorites') {
      return {
        title: 'No favorites yet',
        message: "You haven't saved any favorites",
        suggestion: 'Click the star on any destination to add it to your favorites',
      };
    }
    if (preferences.preferNewPlaces && preferences.selectedTravelers.length > 0) {
      return {
        title: 'All explored',
        message: 'Selected travelers have visited all matching destinations',
        suggestion: 'Disable "New Places Only" to see visited destinations',
      };
    }
    if (preferences.durationMax - preferences.durationMin < 2) {
      return {
        title: 'Duration too narrow',
        message: `Few trips are exactly ${preferences.durationMin}-${preferences.durationMax} days`,
        suggestion: 'Widen your duration range to see more options',
      };
    }
    return {
      title: 'No destinations found',
      message: 'Your filters are too restrictive',
      suggestion: 'Try adjusting your filters to see more options',
    };
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <div className={cn("container mx-auto px-4 py-6", preferences.compareList.length > 0 && "pb-80")}>
        <a href="#destinations" className="skip-link">
          Skip to destinations
        </a>

        <Onboarding />
        <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />

        {/* Hero / Mission Briefing */}
        <div className="mb-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-text-primary mb-1">
              Explore Destinations
            </h1>
            <p className="text-text-secondary text-sm">
              Searching for trips in{' '}
              <span className="text-retro-cyan font-medium">{MONTH_NAMES[preferences.travelMonth]}</span>
              {hasChildren && (
                <span className="text-retro-orange font-medium"> with {childCount} kid{childCount > 1 ? 's' : ''}</span>
              )}
              {' '}from{' '}
              <span className="text-retro-cyan font-medium">{AIRPORT_HUBS[preferences.homeAirport].city}</span>
              {preferences.maxFlightTime > 0 && (
                <span className="text-text-muted"> (max {preferences.maxFlightTime}h)</span>
              )}
              <span className="text-text-muted ml-2">
                · {allDisplayDestinations.length} results
                {preferences.favorites.length > 0 && (
                  <span className="ml-1.5">· <span className="text-retro-yellow">{preferences.favorites.length} saved</span></span>
                )}
              </span>
            </p>
          </div>

          {/* Controls bar */}
          <RetroCard className="p-4">
            <div className="flex flex-col gap-3">
              {/* Search + Actions */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <SearchInput
                    placeholder="Search destinations, countries..."
                    value={preferences.searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClear={handleClearSearch}
                  />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <SurpriseButton
                    destinationIds={allDisplayDestinations.map(({ destination }) => destination.id)}
                    disabled={allDisplayDestinations.length === 0}
                  />
                  <select
                    value={sortMode}
                    onChange={(e) => setSortMode(e.target.value as SortMode)}
                    className="retro-select text-xs py-2 px-3 pr-8 hidden sm:block"
                    aria-label="Sort destinations by"
                  >
                    <option value="score">Sort: Score</option>
                    <option value="name">Sort: Name</option>
                    <option value="cost">Sort: Cost</option>
                    <option value="flight">Sort: Flight</option>
                    <option value="duration">Sort: Duration</option>
                  </select>
                </div>
              </div>

              {/* View toggles + filter controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <ViewToggle
                    active={viewMode === 'grid'}
                    onClick={() => setViewMode('grid')}
                    label="Grid view (G)"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                  </ViewToggle>
                  <ViewToggle
                    active={viewMode === 'list'}
                    onClick={() => setViewMode('list')}
                    label="List view (L)"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                    </svg>
                  </ViewToggle>
                  {preferences.favorites.length > 0 && (
                    <ViewToggle
                      active={viewMode === 'favorites'}
                      onClick={() => setViewMode(viewMode === 'favorites' ? 'grid' : 'favorites')}
                      label="Show favorites"
                    >
                      <span className="text-xs">★ {preferences.favorites.length}</span>
                    </ViewToggle>
                  )}
                  <button
                    onClick={() => setShowHelp(true)}
                    className="p-2 rounded-lg text-text-muted hover:text-text-secondary hover:bg-white/[0.04] transition-all"
                    aria-label="Show help"
                    title="Help (?)"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                      <path d="M12 17h.01" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Mobile sort */}
                  <select
                    value={sortMode}
                    onChange={(e) => setSortMode(e.target.value as SortMode)}
                    className="retro-select text-xs py-1.5 px-2 pr-7 sm:hidden"
                    aria-label="Sort destinations by"
                  >
                    <option value="score">Score</option>
                    <option value="name">Name</option>
                    <option value="cost">Cost</option>
                    <option value="flight">Flight</option>
                    <option value="duration">Days</option>
                  </select>

                  <RetroButton
                    variant={showFilters ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden relative"
                    aria-label="Toggle filters"
                    title="Filters (F)"
                  >
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                      </svg>
                      Filters
                    </span>
                    <FilterCountBadge count={activeFilterCount} />
                  </RetroButton>
                </div>
              </div>

              {/* Active filter chips */}
              <ActiveFilterChips />
            </div>
          </RetroCard>
        </div>

        {/* Live region announcing result count for screen readers */}
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {allDisplayDestinations.length} destination{allDisplayDestinations.length === 1 ? '' : 's'} found
        </div>

        {/* Main content */}
        <div className="flex gap-6">
          {/* Filter sidebar - desktop */}
          <aside className="w-72 shrink-0 hidden lg:block">
            <RetroCard className="p-5 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
              <h2 className="font-semibold text-sm text-text-primary mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-retro-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                </svg>
                Filters
              </h2>
              <FilterPanel />
            </RetroCard>
          </aside>

          {/* Destination grid/list */}
          <section id="destinations" className="flex-1 min-w-0" role="region" aria-label="Destination results">
            {displayDestinations.length === 0 ? (
              <RetroCard className="p-12 text-center">
                {(() => {
                  const emptyState = getEmptyStateMessage();
                  return (
                    <>
                      <div className="text-4xl mb-4 opacity-60">
                        {viewMode === 'favorites' ? '☆' : '🔍'}
                      </div>
                      <div className="font-semibold text-text-primary text-lg mb-2">
                        {emptyState.title}
                      </div>
                      <p className="text-text-secondary text-sm mb-1">
                        {emptyState.message}
                      </p>
                      <p className="text-text-muted text-xs">
                        {emptyState.suggestion}
                      </p>
                      {preferences.searchQuery && (
                        <RetroButton
                          variant="ghost"
                          size="sm"
                          className="mt-4"
                          onClick={handleClearSearch}
                        >
                          Clear Search
                        </RetroButton>
                      )}
                    </>
                  );
                })()}
              </RetroCard>
            ) : viewMode === 'list' ? (
              <div className="space-y-1.5" role="list" aria-label="Destinations list">
                {/* List header */}
                <div className="flex items-center gap-4 px-3 py-2 text-xs text-text-muted uppercase border-b border-white/[0.06] mb-2">
                  <div className="w-14 shrink-0 text-center">Score</div>
                  <div className="w-14 shrink-0"></div>
                  <div className="flex-1 min-w-0">Destination</div>
                  <div className="w-28 shrink-0 text-center hidden sm:block">
                    <span className="text-retro-green">●</span> Good Months
                  </div>
                  <div className="w-20 shrink-0 text-right">Actions</div>
                </div>
                {displayDestinations.map(({ destination, score }) => (
                  <DestinationCardCompact
                    key={destination.id}
                    destination={destination}
                    score={score}
                    preferences={preferences}
                    travelers={travelers}
                  />
                ))}
              </div>
            ) : (
              <div
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
                role="list"
                aria-label="Destinations grid"
              >
                {displayDestinations.map(({ destination, score }) => (
                  <DestinationCard
                    key={destination.id}
                    destination={destination}
                    score={score}
                    preferences={preferences}
                    travelers={travelers}
                  />
                ))}
              </div>
            )}

            {/* Load More */}
            {hasMore && displayDestinations.length > 0 && (
              <div className="mt-8 text-center">
                <RetroButton
                  variant="ghost"
                  onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                >
                  Load More ({allDisplayDestinations.length - visibleCount} remaining)
                </RetroButton>
              </div>
            )}
          </section>
        </div>

        {/* Compare panel */}
        <ComparePanel />

        {/* Mobile filter panel */}
        {showFilters && (
          <div
            className="fixed inset-0 bg-bg-deep/95 backdrop-blur-sm z-50 lg:hidden overflow-auto animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-label="Filter destinations"
          >
            <div className="p-5 pb-[max(1rem,env(safe-area-inset-bottom))] animate-slide-up">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-base text-text-primary flex items-center gap-2">
                  <svg className="w-4 h-4 text-retro-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                  </svg>
                  Filters
                </h2>
                <RetroButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                  aria-label="Close filters"
                >
                  Close
                </RetroButton>
              </div>
              <FilterPanel />
              <div className="mt-6">
                <RetroButton
                  variant="primary"
                  className="w-full"
                  onClick={() => setShowFilters(false)}
                >
                  Show {allDisplayDestinations.length} Results
                </RetroButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

function ViewToggle({ active, onClick, label, children }: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'p-2 rounded-lg transition-all',
        active
          ? 'bg-retro-cyan/15 text-retro-cyan'
          : 'text-text-muted hover:text-text-secondary hover:bg-white/[0.04]'
      )}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}
