import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Destination,
  Traveler,
  UserPreferences,
  DEFAULT_PREFERENCES,
  AirportCode,
  Month,
  TravelerData,
  DestinationRegion,
  BudgetSensitivity,
  Climate,
  TripType,
  hasChildTraveler,
} from '@/types';

interface AppStore {
  // Data
  destinations: Destination[];
  travelers: Traveler[];
  preferences: UserPreferences;
  isLoaded: boolean;

  // Sound settings
  soundEnabled: boolean;
  soundVolume: number;

  // UI state
  hasSeenOnboarding: boolean;
  compareViewExpanded: boolean;

  // Computed - check if any selected traveler is a child
  hasChildrenSelected: () => boolean;

  // Actions - Data loading
  setDestinations: (destinations: Destination[]) => void;
  setTravelers: (travelers: Traveler[]) => void;
  setIsLoaded: (loaded: boolean) => void;

  // Actions - Preferences
  setPreferences: (preferences: Partial<UserPreferences>) => void;
  setTravelMonth: (month: Month) => void;
  setHomeAirport: (airport: AirportCode) => void;
  setSelectedTravelers: (travelerIds: string[]) => void;
  toggleTraveler: (travelerId: string) => void;
  resetPreferences: () => void;

  // Actions - New filter preferences
  setRegionPreference: (region: DestinationRegion | 'Any') => void;
  setBudgetSensitivity: (budget: BudgetSensitivity) => void;
  setMaxFlightTime: (hours: number) => void;
  setClimatePreference: (climate: Climate | 'Any') => void;
  setTripTypePreference: (type: TripType | 'Any') => void;

  // Actions - Search, Favorites, Compare
  setSearchQuery: (query: string) => void;
  toggleFavorite: (destinationId: string) => void;
  toggleCompare: (destinationId: string) => void;
  clearCompareList: () => void;

  // Actions - Travelers
  addTraveler: (name: string, isChild?: boolean) => void;
  removeTraveler: (id: string) => void;
  updateTraveler: (id: string, updates: Partial<Omit<Traveler, 'id' | 'destinations'>>) => void;
  setTravelerIsChild: (id: string, isChild: boolean) => void;
  updateTravelerDestination: (
    travelerId: string,
    destinationId: string,
    data: Partial<TravelerData>
  ) => void;
  setTravelerVisited: (travelerId: string, destinationId: string, visited: boolean) => void;
  setTravelerRating: (travelerId: string, destinationId: string, rating: number) => void;

  // Actions - Sound
  setSoundEnabled: (enabled: boolean) => void;
  setSoundVolume: (volume: number) => void;

  // Actions - Onboarding
  setHasSeenOnboarding: (seen: boolean) => void;

  // Actions - Compare view
  setCompareViewExpanded: (expanded: boolean) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      destinations: [],
      travelers: [],
      preferences: DEFAULT_PREFERENCES,
      isLoaded: false,
      soundEnabled: true,
      soundVolume: 0.08, // Reduced default volume
      hasSeenOnboarding: false,
      compareViewExpanded: false,

      // Computed - check if any selected traveler is a child
      hasChildrenSelected: () => {
        const state = get();
        return hasChildTraveler(state.travelers, state.preferences.selectedTravelers);
      },

      // Data loading
      setDestinations: (destinations) => set({ destinations }),
      setTravelers: (travelers) => set({ travelers }),
      setIsLoaded: (loaded) => set({ isLoaded: loaded }),

      // Preferences
      setPreferences: (newPrefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...newPrefs },
        })),

      setTravelMonth: (month) =>
        set((state) => ({
          preferences: { ...state.preferences, travelMonth: month },
        })),

      setHomeAirport: (airport) =>
        set((state) => ({
          preferences: { ...state.preferences, homeAirport: airport },
        })),

      setSelectedTravelers: (travelerIds) =>
        set((state) => ({
          preferences: { ...state.preferences, selectedTravelers: travelerIds },
        })),

      toggleTraveler: (travelerId) =>
        set((state) => {
          const current = state.preferences.selectedTravelers;
          const newSelected = current.includes(travelerId)
            ? current.filter((id) => id !== travelerId)
            : [...current, travelerId];
          return {
            preferences: { ...state.preferences, selectedTravelers: newSelected },
          };
        }),

      resetPreferences: () => set({ preferences: DEFAULT_PREFERENCES }),

      // New filter preferences
      setRegionPreference: (region) =>
        set((state) => ({
          preferences: { ...state.preferences, regionPreference: region },
        })),

      setBudgetSensitivity: (budget) =>
        set((state) => ({
          preferences: { ...state.preferences, budgetSensitivity: budget },
        })),

      setMaxFlightTime: (hours) =>
        set((state) => ({
          preferences: { ...state.preferences, maxFlightTime: hours },
        })),

      setClimatePreference: (climate) =>
        set((state) => ({
          preferences: { ...state.preferences, temperaturePreference: climate },
        })),

      setTripTypePreference: (type) =>
        set((state) => ({
          preferences: { ...state.preferences, typePreference: type },
        })),

      // Search, Favorites, Compare
      setSearchQuery: (query) =>
        set((state) => ({
          preferences: { ...state.preferences, searchQuery: query },
        })),

      toggleFavorite: (destinationId) =>
        set((state) => {
          const favorites = state.preferences.favorites;
          const newFavorites = favorites.includes(destinationId)
            ? favorites.filter((id) => id !== destinationId)
            : [...favorites, destinationId];
          return {
            preferences: { ...state.preferences, favorites: newFavorites },
          };
        }),

      toggleCompare: (destinationId) =>
        set((state) => {
          const compareList = state.preferences.compareList;
          if (compareList.includes(destinationId)) {
            return {
              preferences: {
                ...state.preferences,
                compareList: compareList.filter((id) => id !== destinationId),
              },
            };
          }
          // Max 3 items in compare list
          if (compareList.length >= 3) return state;
          return {
            preferences: {
              ...state.preferences,
              compareList: [...compareList, destinationId],
            },
          };
        }),

      clearCompareList: () =>
        set((state) => ({
          preferences: { ...state.preferences, compareList: [] },
        })),

      // Travelers
      addTraveler: (name, isChild = false) =>
        set((state) => {
          const id = name.toLowerCase().replace(/\s+/g, '-');
          // Check if traveler already exists
          if (state.travelers.some((t) => t.id === id)) {
            return state;
          }
          // Create new traveler with empty destinations
          const newTraveler: Traveler = {
            id,
            name,
            isChild,
            destinations: {},
          };
          // Initialize all destination data
          state.destinations.forEach((dest) => {
            newTraveler.destinations[dest.id] = {
              hasVisited: false,
              rating: 5,
            };
          });
          return {
            travelers: [...state.travelers, newTraveler],
          };
        }),

      removeTraveler: (id) =>
        set((state) => ({
          travelers: state.travelers.filter((t) => t.id !== id),
          preferences: {
            ...state.preferences,
            selectedTravelers: state.preferences.selectedTravelers.filter(
              (tid) => tid !== id
            ),
          },
        })),

      updateTraveler: (id, updates) =>
        set((state) => ({
          travelers: state.travelers.map((traveler) =>
            traveler.id === id ? { ...traveler, ...updates } : traveler
          ),
        })),

      setTravelerIsChild: (id, isChild) =>
        set((state) => ({
          travelers: state.travelers.map((traveler) =>
            traveler.id === id ? { ...traveler, isChild } : traveler
          ),
        })),

      updateTravelerDestination: (travelerId, destinationId, data) =>
        set((state) => ({
          travelers: state.travelers.map((traveler) => {
            if (traveler.id !== travelerId) return traveler;
            return {
              ...traveler,
              destinations: {
                ...traveler.destinations,
                [destinationId]: {
                  ...traveler.destinations[destinationId],
                  ...data,
                },
              },
            };
          }),
        })),

      setTravelerVisited: (travelerId, destinationId, visited) =>
        get().updateTravelerDestination(travelerId, destinationId, {
          hasVisited: visited,
        }),

      setTravelerRating: (travelerId, destinationId, rating) =>
        get().updateTravelerDestination(travelerId, destinationId, { rating }),

      // Sound
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setSoundVolume: (volume) => set({ soundVolume: volume }),

      // Onboarding
      setHasSeenOnboarding: (seen) => set({ hasSeenOnboarding: seen }),

      // Compare view
      setCompareViewExpanded: (expanded) => set({ compareViewExpanded: expanded }),
    }),
    {
      name: 'travel-agent-zero-storage',
      version: 2, // Increment version for migration
      partialize: (state) => ({
        travelers: state.travelers,
        preferences: state.preferences,
        soundEnabled: state.soundEnabled,
        soundVolume: state.soundVolume,
        hasSeenOnboarding: state.hasSeenOnboarding,
      }),
      // Migrate old stored data to new format
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Record<string, unknown>;

        if (version < 2) {
          // Migration from v1 to v2: Add new preference fields with defaults
          const oldPrefs = (state.preferences || {}) as Record<string, unknown>;

          // Merge with default preferences to add new fields
          state.preferences = {
            ...DEFAULT_PREFERENCES,
            ...oldPrefs,
            // Ensure new fields have defaults if missing
            searchQuery: oldPrefs.searchQuery ?? '',
            regionPreference: oldPrefs.regionPreference ?? 'Any',
            budgetSensitivity: oldPrefs.budgetSensitivity ?? 'moderate',
            maxFlightTime: oldPrefs.maxFlightTime ?? 0,
            favorites: oldPrefs.favorites ?? [],
            compareList: oldPrefs.compareList ?? [],
          };

          // Migrate travelers to add isChild field if missing
          const travelers = (state.travelers || []) as Array<Record<string, unknown>>;
          state.travelers = travelers.map((t) => ({
            ...t,
            isChild: t.isChild ?? false,
          }));
        }

        return state as { travelers: Traveler[]; preferences: UserPreferences; soundEnabled: boolean; soundVolume: number; hasSeenOnboarding: boolean };
      },
    }
  )
);
