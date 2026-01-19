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

    // Random selection with spin animation
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
        'relative px-4 py-2 font-mono text-sm uppercase tracking-wider rounded',
        'border-2 transition-all duration-200',
        isDisabled
          ? 'border-text-muted/50 text-text-muted cursor-not-allowed opacity-50'
          : 'border-retro-yellow text-retro-yellow hover:bg-retro-yellow/10 hover:shadow-[0_0_20px_rgba(255,255,0,0.3)]',
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
        <span>{isSpinning ? 'Picking...' : 'Surprise Me!'}</span>
      </span>
    </button>
  );
}
