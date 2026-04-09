'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSound } from '@/hooks/useSound';
import { cn } from '@/lib/utils';

interface SurpriseButtonProps {
  destinationIds: string[];
  disabled?: boolean;
  className?: string;
}

export function SurpriseButton({ destinationIds, disabled, className }: SurpriseButtonProps) {
  const router = useRouter();
  const { play } = useSound();
  const [isSpinning, setIsSpinning] = useState(false);

  const handleClick = useCallback(() => {
    if (disabled || isSpinning || destinationIds.length === 0) return;

    setIsSpinning(true);
    play('score');

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * destinationIds.length);
      const selectedId = destinationIds[randomIndex];
      router.push(`/destination/${selectedId}`);
    }, 500);
  }, [destinationIds, disabled, isSpinning, play, router]);

  const isDisabled = disabled || destinationIds.length === 0;

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled || isSpinning}
      className={cn(
        'relative px-4 py-2 text-sm font-medium rounded-lg',
        'border transition-all duration-200',
        isDisabled
          ? 'border-white/10 text-text-muted cursor-not-allowed opacity-40'
          : 'border-retro-yellow/40 text-retro-yellow bg-retro-yellow/[0.06] hover:bg-retro-yellow/15 hover:border-retro-yellow/60 hover:shadow-[0_0_20px_rgba(251,191,36,0.1)]',
        isSpinning && 'animate-pulse',
        className
      )}
      title={isDisabled ? 'No destinations match your filters' : 'Pick a random destination'}
      aria-label="Pick a random destination from filtered results"
    >
      <span className="flex items-center gap-2">
        <span
          className={cn(
            'inline-block transition-transform',
            isSpinning && 'animate-spin'
          )}
        >
          🎲
        </span>
        <span className="hidden sm:inline">{isSpinning ? 'Picking...' : 'Surprise Me'}</span>
      </span>
    </button>
  );
}
