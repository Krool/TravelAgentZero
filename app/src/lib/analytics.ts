// Google Analytics event tracking utilities for Travel Agent Zero

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
}

// Travel Agent Zero specific events
export const Analytics = {
  // Track destination viewed
  destinationViewed: (destinationId: string, destinationName: string) => {
    trackEvent("destination_viewed", {
      destination_id: destinationId,
      destination_name: destinationName,
    });
  },

  // Track trip planned
  tripPlanned: (destinationId: string, travelerCount: number) => {
    trackEvent("trip_planned", {
      destination_id: destinationId,
      traveler_count: travelerCount,
    });
  },

  // Track traveler added
  travelerAdded: () => {
    trackEvent("traveler_added");
  },

  // Track itinerary created
  itineraryCreated: (destinationId: string, dayCount: number) => {
    trackEvent("itinerary_created", {
      destination_id: destinationId,
      day_count: dayCount,
    });
  },

  // Track search performed
  searchPerformed: (query: string, resultCount: number) => {
    trackEvent("search", {
      search_term: query,
      result_count: resultCount,
    });
  },

  // Track filter applied
  filterApplied: (filterType: string, value: string) => {
    trackEvent("filter_applied", {
      filter_type: filterType,
      filter_value: value,
    });
  },
};
