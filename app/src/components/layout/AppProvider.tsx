'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { DestinationSummary, Traveler } from '@/types';
import { ToastContainer } from '@/components/ui/Toast';
import { assetPath } from '@/lib/utils';

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const {
    setDestinations,
    setTravelers,
    setIsLoaded,
    setHydrated,
    reduceEffects,
  } = useAppStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (reduceEffects) {
      document.documentElement.classList.add('reduce-effects');
    } else {
      document.documentElement.classList.remove('reduce-effects');
    }
  }, [reduceEffects]);

  useEffect(() => {
    async function loadData() {
      try {
        // Saved state first: the traveler check and the catalog reconcile
        // below both depend on it.
        await useAppStore.persist.rehydrate();
        setHydrated();

        // Fetch both files in parallel; travelers.json is only needed on a first visit.
        const needTravelers = useAppStore.getState().travelers.length === 0;
        const [destResponse, travelerResponse] = await Promise.all([
          fetch(assetPath('/data/destinations-index.json')),
          needTravelers ? fetch(assetPath('/data/travelers.json')) : null,
        ]);
        if (!destResponse.ok) throw new Error(`destinations-index.json ${destResponse.status}`);
        const destinations: DestinationSummary[] = await destResponse.json();
        if (!Array.isArray(destinations) || destinations.length === 0) {
          throw new Error('destinations-index.json is empty or malformed');
        }
        setDestinations(destinations);

        if (travelerResponse) {
          if (!travelerResponse.ok) throw new Error(`travelers.json ${travelerResponse.status}`);
          const defaultTravelers: Traveler[] = await travelerResponse.json();
          if (!Array.isArray(defaultTravelers)) {
            throw new Error('travelers.json is malformed');
          }
          // Sample travelers are loaded as examples but left unselected, so a new
          // user's results and scores are not shaped by someone else's history.
          setTravelers(defaultTravelers);
        }

        setIsLoaded(true);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError(
          typeof navigator !== 'undefined' && !navigator.onLine
            ? 'You appear to be offline. Reconnect and try again.'
            : 'Failed to load destination data. Please reload the page.'
        );
      }
    }

    loadData();
  }, [setDestinations, setTravelers, setIsLoaded, setHydrated]);

  // Pages render immediately (the static HTML already has their content);
  // the ones that need the catalog show their own loading state.
  return (
    <>
      {error && <ErrorBanner message={error} />}
      {children}
      <ToastContainer />
    </>
  );
}

/** Skeleton for pages that wait on the destination catalog. */
export function LoadingScreen() {
  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center" role="status">
      <div className="text-center">
        <div className="text-text-muted text-sm mb-4">Loading destinations</div>
        <div className="w-48 h-1 bg-white/[0.06] rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-gradient-to-r from-retro-cyan to-retro-magenta loading-bar rounded-full" />
        </div>
      </div>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div role="alert" className="bg-retro-red/10 border-b border-retro-red/30">
      <div className="container mx-auto px-4 py-2.5 flex items-center justify-between gap-4 text-sm">
        <span className="text-text-primary">{message}</span>
        <button
          onClick={() => window.location.reload()}
          className="shrink-0 px-3 py-1 text-xs font-semibold rounded-lg border border-retro-cyan/60 text-retro-cyan hover:bg-retro-cyan/15 transition-all"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
