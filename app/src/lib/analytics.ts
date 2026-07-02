// Google Analytics (GA4) event helpers for Travel Agent Zero.
//
// Every event here is intentionally PII-free: no traveler names, no raw search
// text, and no note content are ever sent - only destination ids, coarse
// counts, and enum-valued filter selections. trackEvent no-ops unless gtag is
// present, so events are silently inert in development (GA only loads in
// production) and before analytics consent is granted.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}

export const Analytics = {
  // Client-side route change (the GA config only auto-sends the first view).
  // Send the full location (incl. basePath) + title so SPA views match the
  // initial config-sent view rather than a basePath-less page_path.
  pageView: (location: string, title: string) =>
    trackEvent('page_view', { page_location: location, page_title: title }),

  // A destination detail page was opened.
  destinationViewed: (destinationId: string) =>
    trackEvent('destination_viewed', { destination_id: destinationId }),

  // A filter changed. `value` is always an enum/number, never free text.
  filterApplied: (filterType: string, value: string) =>
    trackEvent('filter_applied', { filter_type: filterType, filter_value: value }),

  favoriteToggled: (added: boolean) =>
    trackEvent('favorite_toggled', { action: added ? 'add' : 'remove' }),

  compareToggled: (added: boolean) =>
    trackEvent('compare_toggled', { action: added ? 'add' : 'remove' }),

  // How a share resolved (Web Share API vs clipboard copy). No URL/preferences.
  shareClicked: (method: 'native' | 'clipboard') =>
    trackEvent('share', { method }),

  surpriseUsed: () => trackEvent('surprise_me'),

  // Count only - never the traveler's name.
  travelerAdded: () => trackEvent('traveler_added'),
};
