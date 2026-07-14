'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Destination, Traveler } from '@/types';
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
    setSelectedTravelers,
    reduceEffects,
  } = useAppStore();
  const [loading, setLoading] = useState(true);
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
        const destResponse = await fetch(assetPath('/data/destinations.json'));
        if (!destResponse.ok) throw new Error(`destinations.json ${destResponse.status}`);
        const destinations: Destination[] = await destResponse.json();
        if (!Array.isArray(destinations) || destinations.length === 0) {
          throw new Error('destinations.json is empty or malformed');
        }
        setDestinations(destinations);

        const currentTravelers = useAppStore.getState().travelers;
        if (currentTravelers.length === 0) {
          const travelerResponse = await fetch(assetPath('/data/travelers.json'));
          if (!travelerResponse.ok) throw new Error(`travelers.json ${travelerResponse.status}`);
          const defaultTravelers: Traveler[] = await travelerResponse.json();
          if (!Array.isArray(defaultTravelers)) {
            throw new Error('travelers.json is malformed');
          }
          setTravelers(defaultTravelers);
          setSelectedTravelers(defaultTravelers.map(t => t.id));
        }

        setIsLoaded(true);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load destination data. Please reload the page.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [setDestinations, setTravelers, setIsLoaded, setSelectedTravelers]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen message={error} />;
  }

  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
}

function LoadingScreen() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-bg-deep flex items-center justify-center">
      <div className="text-center boot-animation">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-retro-cyan to-retro-blue flex items-center justify-center">
            <span className="text-bg-deep font-bold text-lg">T</span>
          </div>
        </div>
        <div className="text-xl font-bold mb-1">
          <span className="text-text-primary">Travel Agent </span>
          <span className="gradient-text">Zero</span>
        </div>
        <div className="text-text-muted text-sm mb-8">
          Loading{dots}
        </div>
        <div className="w-48 h-1 bg-white/[0.06] rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-gradient-to-r from-retro-cyan to-retro-magenta loading-bar rounded-full" />
        </div>
      </div>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-bg-deep flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="w-12 h-12 rounded-xl bg-retro-red/15 flex items-center justify-center mx-auto mb-4">
          <span className="text-retro-red text-xl">!</span>
        </div>
        <h1 className="text-lg font-bold text-text-primary mb-2">
          Something went wrong
        </h1>
        <p className="text-text-secondary text-sm mb-6">
          {message}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 font-semibold text-sm rounded-lg border border-retro-cyan/60 text-retro-cyan bg-retro-cyan/[0.06] hover:bg-retro-cyan/15 transition-all"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
