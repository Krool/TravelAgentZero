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
import { Analytics } from '@/lib/analytics';

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
  reduceEffects: boolean;

  // Personal notes per destination
  destinationNotes: Record<string, string>;

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
  addTraveler: (name: string, isChild?: boolean) => boolean;
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

  // Actions - Reduce effects
  setReduceEffects: (reduce: boolean) => void;

  // Actions - Notes
  setDestinationNote: (destinationId: string, note: string) => void;
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
      reduceEffects: false,
      destinationNotes: {},

      // Computed - check if any selected traveler is a child
      hasChildrenSelected: () => {
        const state = get();
        return hasChildTraveler(state.travelers, state.preferences.selectedTravelers);
      },

      // Data loading. Reconcile persisted compare/favorite ids against the
      // freshly loaded catalog so a renamed/removed destination can't leave a
      // phantom id inflating the compare count or blocking the 3-item cap.
      setDestinations: (destinations) =>
        set((state) => {
          const validIds = new Set(destinations.map((d) => d.id));
          const { compareList, favorites } = state.preferences;
          const nextCompare = compareList.filter((id) => validIds.has(id));
          const nextFavorites = favorites.filter((id) => validIds.has(id));
          const changed =
            nextCompare.length !== compareList.length ||
            nextFavorites.length !== favorites.length;
          return {
            destinations,
            preferences: changed
              ? { ...state.preferences, compareList: nextCompare, favorites: nextFavorites }
              : state.preferences,
          };
        }),
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
      setRegionPreference: (region) => {
        set((state) => ({
          preferences: { ...state.preferences, regionPreference: region },
        }));
        Analytics.filterApplied('region', region);
      },

      setBudgetSensitivity: (budget) => {
        set((state) => ({
          preferences: { ...state.preferences, budgetSensitivity: budget },
        }));
        Analytics.filterApplied('budget', budget);
      },

      setMaxFlightTime: (hours) => {
        set((state) => ({
          preferences: { ...state.preferences, maxFlightTime: hours },
        }));
        Analytics.filterApplied('flight_time', String(hours));
      },

      setClimatePreference: (climate) => {
        set((state) => ({
          preferences: { ...state.preferences, temperaturePreference: climate },
        }));
        Analytics.filterApplied('climate', climate);
      },

      setTripTypePreference: (type) => {
        set((state) => ({
          preferences: { ...state.preferences, typePreference: type },
        }));
        Analytics.filterApplied('trip_type', type);
      },

      // Search, Favorites, Compare
      setSearchQuery: (query) =>
        set((state) => ({
          preferences: { ...state.preferences, searchQuery: query },
        })),

      toggleFavorite: (destinationId) => {
        const added = !get().preferences.favorites.includes(destinationId);
        set((state) => {
          const favorites = state.preferences.favorites;
          const newFavorites = added
            ? [...favorites, destinationId]
            : favorites.filter((id) => id !== destinationId);
          return {
            preferences: { ...state.preferences, favorites: newFavorites },
          };
        });
        Analytics.favoriteToggled(added);
      },

      toggleCompare: (destinationId) => {
        const compareList = get().preferences.compareList;
        const has = compareList.includes(destinationId);
        // Max 3 items - at the cap, adding is a silent no-op (no event).
        if (!has && compareList.length >= 3) return;
        set((state) => ({
          preferences: {
            ...state.preferences,
            compareList: has
              ? state.preferences.compareList.filter((id) => id !== destinationId)
              : [...state.preferences.compareList, destinationId],
          },
        }));
        Analytics.compareToggled(!has);
      },

      clearCompareList: () =>
        set((state) => ({
          preferences: { ...state.preferences, compareList: [] },
        })),

      // Travelers. Returns false (no-op) if a traveler with the same slug id
      // already exists, so callers can surface an error instead of silently
      // "succeeding" and clearing the form.
      addTraveler: (name, isChild = false) => {
        const id = name.toLowerCase().replace(/\s+/g, '-');
        const state = get();
        if (state.travelers.some((t) => t.id === id)) {
          return false;
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
        set((s) => ({ travelers: [...s.travelers, newTraveler] }));
        return true;
      },

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

      // Reduce effects
      setReduceEffects: (reduce) => set({ reduceEffects: reduce }),

      // Notes
      setDestinationNote: (destinationId, note) =>
        set((state) => ({
          destinationNotes: {
            ...state.destinationNotes,
            [destinationId]: note,
          },
        })),
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
        reduceEffects: state.reduceEffects,
        destinationNotes: state.destinationNotes,
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
