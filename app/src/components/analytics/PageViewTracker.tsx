'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Analytics } from '@/lib/analytics';

/**
 * Sends a GA4 page_view on client-side navigation. The initial GA `config`
 * call already counts the first page, so the very first render is skipped to
 * avoid double-counting. Uses usePathname (no Suspense requirement) so it works
 * under `output: 'export'`.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    Analytics.pageView(window.location.href, document.title);
  }, [pathname]);

  return null;
}
