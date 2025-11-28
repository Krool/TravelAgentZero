'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Destination, Traveler } from '@/types';

// Get base path for asset URLs
const basePath = process.env.NODE_ENV === 'production' ? '/TravelAgentZero' : '';

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const {
    setDestinations,
    setTravelers,
    setIsLoaded,
    isLoaded,
    travelers,
    setSelectedTravelers,
    preferences
  } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Load destinations
        const destResponse = await fetch(`${basePath}/data/destinations.json`);
        const destinations: Destination[] = await destResponse.json();
        setDestinations(destinations);

        // Load travelers if not already in localStorage
        const currentTravelers = useAppStore.getState().travelers;
        if (currentTravelers.length === 0) {
          const travelerResponse = await fetch(`${basePath}/data/travelers.json`);
          const defaultTravelers: Traveler[] = await travelerResponse.json();
          setTravelers(defaultTravelers);

          // Auto-select both travelers by default
          setSelectedTravelers(defaultTravelers.map(t => t.id));
        }

        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [setDestinations, setTravelers, setIsLoaded, setSelectedTravelers]);

  if (loading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

function LoadingScreen() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-bg-deep flex items-center justify-center">
      <div className="text-center boot-animation">
        <div className="font-pixel text-2xl mb-4">
          <span className="text-retro-cyan glow-cyan">TRAVEL AGENT</span>
          <span className="text-retro-magenta glow-magenta ml-2">ZERO</span>
        </div>
        <div className="font-terminal text-text-secondary text-lg">
          INITIALIZING SYSTEM{dots}
        </div>
        <div className="mt-6 w-64 h-2 bg-bg-dark rounded overflow-hidden mx-auto">
          <div className="h-full bg-gradient-to-r from-retro-cyan to-retro-magenta loading-bar" />
        </div>
        <div className="mt-4 font-mono text-xs text-text-muted">
          Loading destination database...
        </div>
      </div>
    </div>
  );
}
