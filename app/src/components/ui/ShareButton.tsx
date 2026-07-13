'use client';

import { useCallback, useState } from 'react';
import { useToast } from '@/hooks/useToast';
import { buildShareUrl, copyToClipboard, canNativeShare, nativeShare } from '@/lib/shareUtils';
import { Analytics } from '@/lib/analytics';
import { UserPreferences } from '@/types';
import { cn } from '@/lib/utils';

interface ShareButtonProps {
  destinationId: string;
  destinationName: string;
  preferences: UserPreferences;
  className?: string;
  variant?: 'icon' | 'button';
}

export function ShareButton({
  destinationId,
  destinationName,
  preferences,
  className,
  variant = 'button',
}: ShareButtonProps) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const handleShare = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      const url = buildShareUrl(destinationId, preferences);
      const title = `Travel Agent Zero - ${destinationName}`;
      const text = `${destinationName} on Travel Agent Zero`;

      if (canNativeShare()) {
        const shared = await nativeShare(title, text, url);
        if (shared) {
          Analytics.shareClicked('native');
          toast.success('Shared');
          return;
        }
      }

      const copied = await copyToClipboard(url);
      if (copied) {
        Analytics.shareClicked('clipboard');
        toast.success('Link copied');
      } else {
        toast.error('Failed to copy link');
      }
    } finally {
      setBusy(false);
    }
  }, [busy, destinationId, destinationName, preferences, toast]);

  if (variant === 'icon') {
    return (
      <button
        onClick={handleShare}
        className={cn(
          'w-8 h-8 flex items-center justify-center rounded-lg',
          'text-text-muted hover:text-retro-cyan transition-colors',
          'hover:bg-white/[0.04]',
          className
        )}
        aria-label={`Share ${destinationName}`}
        title="Share this destination"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={handleShare}
      className={cn(
        'px-3 py-1.5 text-xs font-medium rounded-lg',
        'border border-retro-cyan/40 text-retro-cyan bg-retro-cyan/[0.06]',
        'hover:bg-retro-cyan/15 hover:border-retro-cyan/60 transition-all',
        className
      )}
      aria-label={`Share ${destinationName}`}
    >
      <span className="flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
        <span>Share</span>
      </span>
    </button>
  );
}
