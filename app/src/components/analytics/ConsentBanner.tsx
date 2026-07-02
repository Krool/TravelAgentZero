'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'taz-analytics-consent';

function updateConsent(granted: boolean) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('consent', 'update', {
      analytics_storage: granted ? 'granted' : 'denied',
    });
  }
}

/**
 * Minimal GA4 Consent Mode banner. Analytics loads with consent defaulted to
 * "denied" (see layout.tsx), so nothing is stored until the visitor opts in.
 * The choice is remembered in localStorage; the banner only shows on the first
 * visit (or after the choice is cleared).
 */
export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      /* localStorage unavailable - treat as undecided */
    }
    if (stored === 'granted') {
      updateConsent(true);
    } else if (stored !== 'denied') {
      // One-time client init: localStorage isn't readable during static
      // prerender, so the banner's visibility must be decided in an effect.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
    }
  }, []);

  const choose = (granted: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, granted ? 'granted' : 'denied');
    } catch {
      /* ignore persistence failure */
    }
    updateConsent(granted);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Analytics consent"
      className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4"
    >
      <div className="max-w-3xl mx-auto rounded-xl border border-white/10 bg-[rgba(15,18,35,0.96)] backdrop-blur-xl shadow-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <p className="text-xs text-text-secondary leading-relaxed flex-1">
          We use privacy-friendly analytics (no names, no search text) to see
          which destinations are popular. Nothing is stored until you accept.{' '}
          <Link href="/privacy" className="text-retro-cyan hover:text-retro-magenta underline">
            Privacy
          </Link>
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => choose(false)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-white/15 text-text-secondary hover:bg-white/[0.06] transition-all"
          >
            Decline
          </button>
          <button
            onClick={() => choose(true)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-retro-cyan/60 text-retro-cyan bg-retro-cyan/[0.08] hover:bg-retro-cyan/15 transition-all"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
