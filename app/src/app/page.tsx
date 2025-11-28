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
import { MONTH_NAMES, AIRPORT_HUBS, hasChildTraveler } from '@/types';

type ViewMode = 'grid' | 'list' | 'favorites';

export default function HomePage() {
  const { destinations, travelers, preferences, isLoaded, setSearchQuery } = useAppStore();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Check if any selected travelers are children (auto-detect)
  const hasChildren = hasChildTraveler(travelers, preferences.selectedTravelers);
  const childCount = travelers
    .filter(t => preferences.selectedTravelers.includes(t.id))
    .filter(t => t.isChild)
    .length;

  // Filter and sort destinations
  const sortedDestinations = useMemo(() => {
    if (!isLoaded) return [];

    const filtered = filterDestinations(destinations, preferences, travelers);
    return sortDestinationsByScore(filtered, preferences, travelers);
  }, [destinations, travelers, preferences, isLoaded]);

  // Get favorites
  const favoriteDestinations = useMemo(() => {
    if (!isLoaded) return [];
    return sortedDestinations.filter(({ destination }) =>
      preferences.favorites.includes(destination.id)
    );
  }, [sortedDestinations, preferences.favorites, isLoaded]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'g':
          setViewMode('grid');
          break;
        case 'l':
          setViewMode('list');
          break;
        case 'f':
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

  // Check if destination is new to selected travelers
  const isNewDestination = (destinationId: string) => {
    if (preferences.selectedTravelers.length === 0) return true;

    return preferences.selectedTravelers.every((travelerId) => {
      const traveler = travelers.find((t) => t.id === travelerId);
      if (!traveler) return true;
      const destData = traveler.destinations[destinationId];
      return !destData?.hasVisited;
    });
  };

  // Determine which destinations to show
  const displayDestinations = viewMode === 'favorites' ? favoriteDestinations : sortedDestinations;

  // Helper to analyze why there are no results
  const getEmptyStateMessage = () => {
    if (preferences.searchQuery.trim()) {
      return {
        title: 'NO SEARCH RESULTS',
        message: `No destinations match "${preferences.searchQuery}"`,
        suggestion: 'Try a different search term or clear the search',
      };
    }
    if (viewMode === 'favorites') {
      return {
        title: 'NO FAVORITES YET',
        message: "You haven't saved any favorites",
        suggestion: 'Click the star on any destination to add it to your favorites',
      };
    }
    if (preferences.preferNewPlaces && preferences.selectedTravelers.length > 0) {
      return {
        title: 'ALL EXPLORED',
        message: 'Selected travelers have visited all matching destinations',
        suggestion: 'Disable "New Places Only" to see visited destinations',
      };
    }
    if (preferences.durationMax - preferences.durationMin < 2) {
      return {
        title: 'DURATION TOO NARROW',
        message: `Few trips are exactly ${preferences.durationMin}-${preferences.durationMax} days`,
        suggestion: 'Widen your duration range to see more options',
      };
    }
    return {
      title: 'NO DESTINATIONS FOUND',
      message: 'Your filters are too restrictive',
      suggestion: 'Try adjusting your filters to see more options',
    };
  };

  if (!isLoaded) {
    return null; // AppProvider shows loading screen
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-6">
        {/* Skip to content link for accessibility */}
        <a href="#destinations" className="skip-link">
          Skip to destinations
        </a>

        {/* Onboarding */}
        <Onboarding />
        <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />

        {/* Mission Briefing */}
        <div className="mb-6">
          <RetroCard className="p-4">
            <div className="flex flex-col gap-4">
              {/* Header row */}
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h1 className="font-mono font-bold text-lg text-retro-cyan mb-2 uppercase tracking-wider">
                    Mission Briefing
                  </h1>
                  <p className="font-mono text-base text-text-primary">
                    Searching for destinations in{' '}
                    <span className="text-retro-magenta">{MONTH_NAMES[preferences.travelMonth]}</span>
                    {hasChildren && (
                      <span className="text-retro-orange"> with {childCount} kid{childCount > 1 ? 's' : ''}</span>
                    )}
                    {' '}from{' '}
                    <span className="text-retro-cyan">{AIRPORT_HUBS[preferences.homeAirport].city}</span>
                    {preferences.maxFlightTime > 0 && (
                      <span className="text-text-secondary"> (max {preferences.maxFlightTime}h)</span>
                    )}
                  </p>
                  <p className="font-mono text-sm text-text-muted mt-1">
                    {displayDestinations.length} destinations match
                    {preferences.favorites.length > 0 && (
                      <span className="ml-2">
                        • <span className="text-retro-yellow">{preferences.favorites.length} favorited</span>
                      </span>
                    )}
                    {preferences.compareList.length > 0 && (
                      <span className="ml-2">
                        • <span className="text-retro-magenta">{preferences.compareList.length} comparing</span>
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <RetroButton
                    variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid view"
                    title="Grid view (G)"
                  >
                    Grid
                  </RetroButton>
                  <RetroButton
                    variant={viewMode === 'list' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    aria-label="List view"
                    title="List view (L)"
                  >
                    List
                  </RetroButton>
                  {preferences.favorites.length > 0 && (
                    <RetroButton
                      variant={viewMode === 'favorites' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode(viewMode === 'favorites' ? 'grid' : 'favorites')}
                      aria-label="Show favorites"
                    >
                      ★ {preferences.favorites.length}
                    </RetroButton>
                  )}
                  <RetroButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHelp(true)}
                    aria-label="Show help"
                    title="Help (?)"
                  >
                    ?
                  </RetroButton>
                  <RetroButton
                    variant={showFilters ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden"
                    aria-label="Toggle filters"
                    title="Filters (F)"
                  >
                    Filters
                  </RetroButton>
                </div>
              </div>

              {/* Search bar */}
              <SearchInput
                placeholder="Search destinations, countries..."
                value={preferences.searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={handleClearSearch}
              />
            </div>
          </RetroCard>
        </div>

      {/* Main content */}
      <div className="flex gap-6">
        {/* Filter sidebar - desktop */}
        <aside className="w-72 shrink-0 hidden lg:block">
          <RetroCard className="p-4 sticky top-20">
            <h2 className="font-mono font-bold text-sm text-retro-cyan mb-4 uppercase">
              Mission Control
            </h2>
            <FilterPanel />
          </RetroCard>
        </aside>

        {/* Destination grid/list */}
        <main id="destinations" className="flex-1 min-w-0" role="main" aria-label="Destination results">
          {displayDestinations.length === 0 ? (
            <RetroCard className="p-8 text-center">
              {(() => {
                const emptyState = getEmptyStateMessage();
                return (
                  <>
                    <div className="text-4xl mb-4">
                      {viewMode === 'favorites' ? '☆' : '🔍'}
                    </div>
                    <div className="font-mono font-bold text-retro-magenta text-xl mb-2">
                      {emptyState.title}
                    </div>
                    <p className="font-mono text-text-secondary mb-2">
                      {emptyState.message}
                    </p>
                    <p className="font-mono text-sm text-text-muted">
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
            <div className="space-y-2" role="list" aria-label="Destinations list">
              {/* List header */}
              <div className="flex items-center gap-4 px-3 py-2 text-xs font-mono text-text-muted uppercase border-b border-retro-cyan/20 mb-2">
                <div className="w-14 shrink-0 text-center">Score</div>
                <div className="w-16 shrink-0"></div>
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
                  isNew={isNewDestination(destination.id)}
                  preferences={preferences}
                  travelers={travelers}
                />
              ))}
            </div>
          ) : (
            <div
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
              role="list"
              aria-label="Destinations grid"
            >
              {displayDestinations.map(({ destination, score }) => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                  score={score}
                  isNew={isNewDestination(destination.id)}
                  preferences={preferences}
                  travelers={travelers}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Compare panel */}
      <ComparePanel />

      {/* Mobile filter panel */}
      {showFilters && (
        <div className="fixed inset-0 bg-bg-deep/95 z-50 lg:hidden overflow-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-mono font-bold text-base text-retro-cyan uppercase">
                Mission Control
              </h2>
              <RetroButton
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
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
                Apply Filters
              </RetroButton>
            </div>
          </div>
        </div>
      )}
      </div>
    </ErrorBoundary>
  );
}
