'use client';

import { useCallback } from 'react';
import { useToast } from '@/hooks/useToast';
import { buildShareUrl, copyToClipboard, canNativeShare, nativeShare } from '@/lib/shareUtils';
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

  const handleShare = useCallback(async () => {
    const url = buildShareUrl(destinationId, preferences);
    const title = `Travel Agent Zero - ${destinationName}`;
    const text = `Check out ${destinationName} on Travel Agent Zero!`;

    // Try native share on mobile
    if (canNativeShare()) {
      const shared = await nativeShare(title, text, url);
      if (shared) {
        toast.success('Shared successfully!');
        return;
      }
    }

    // Fall back to clipboard
    const copied = await copyToClipboard(url);
    if (copied) {
      toast.success('Link copied to clipboard!');
    } else {
      toast.error('Failed to copy link');
    }
  }, [destinationId, destinationName, preferences, toast]);

  if (variant === 'icon') {
    return (
      <button
        onClick={handleShare}
        className={cn(
          'w-8 h-8 flex items-center justify-center rounded',
          'text-text-muted hover:text-retro-cyan transition-colors',
          'border border-transparent hover:border-retro-cyan/30',
          className
        )}
        aria-label={`Share ${destinationName}`}
        title="Share this destination"
      >
        🔗
      </button>
    );
  }

  return (
    <button
      onClick={handleShare}
      className={cn(
        'px-3 py-1.5 font-mono text-xs uppercase tracking-wider rounded',
        'border border-retro-cyan/50 text-retro-cyan',
        'hover:bg-retro-cyan/10 hover:border-retro-cyan transition-all',
        className
      )}
      aria-label={`Share ${destinationName}`}
    >
      <span className="flex items-center gap-1.5">
        <span>🔗</span>
        <span>Share</span>
      </span>
    </button>
  );
}
