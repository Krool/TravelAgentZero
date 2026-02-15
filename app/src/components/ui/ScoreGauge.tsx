'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { getScoreColor } from '@/lib/utils';

interface ScoreGaugeProps {
  value: number;
  max: number;
  label?: string;
  showValue?: boolean;
  showPercentage?: boolean;
  animate?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ScoreGauge({
  value,
  max,
  label,
  showValue = true,
  showPercentage = false,
  animate = true,
  size = 'md',
  className,
}: ScoreGaugeProps) {
  // Respect prefers-reduced-motion
  const prefersReducedMotion = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const shouldAnimate = animate && !prefersReducedMotion;

  const [displayValue, setDisplayValue] = useState(shouldAnimate ? 0 : value);
  const percentage = (displayValue / max) * 100;
  const color = getScoreColor(displayValue, max);

  useEffect(() => {
    if (!shouldAnimate) {
      setDisplayValue(value);
      return;
    }

    // Animate from 0 to value
    const duration = 800;
    const steps = 30;
    const increment = value / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const current = Math.min(value, increment * step);
      setDisplayValue(current);
      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, shouldAnimate]);

  const sizes = {
    sm: { height: 'h-2', text: 'text-xs', padding: 'px-1' },
    md: { height: 'h-3', text: 'text-xs', padding: 'px-2' },
    lg: { height: 'h-4', text: 'text-sm', padding: 'px-3' },
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className={cn('font-mono text-text-secondary uppercase', sizes[size].text)}>
            {label}
          </span>
          {showValue && (
            <span className={cn('font-mono', sizes[size].text)} style={{ color }}>
              {showPercentage
                ? `${Math.round(percentage)}%`
                : `${displayValue.toFixed(1)}/${max}`}
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          'w-full bg-bg-dark border border-retro-cyan/30 rounded-sm overflow-hidden',
          sizes[size].height
        )}
        role="meter"
        aria-label={label || 'Score'}
        aria-valuenow={Math.round(value * 10) / 10}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out',
            animate && 'score-bar'
          )}
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}`,
          }}
        />
      </div>
      {!label && showValue && (
        <div className={cn('text-center mt-1 font-mono', sizes[size].text)} style={{ color }}>
          {showPercentage
            ? `${Math.round(percentage)}%`
            : displayValue.toFixed(1)}
        </div>
      )}
    </div>
  );
}

// Compact score display for cards
export function ScoreBadge({
  value,
  max,
  className,
}: {
  value: number;
  max: number;
  className?: string;
}) {
  const percentage = (value / max) * 100;
  const color = getScoreColor(value, max);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 rounded font-mono font-bold text-sm',
        className
      )}
      style={{
        backgroundColor: `${color}20`,
        border: `1px solid ${color}`,
        color: color,
        boxShadow: `0 0 10px ${color}40`,
      }}
    >
      <span>{Math.round(percentage)}</span>
      <span className="text-xs opacity-70">PTS</span>
    </div>
  );
}
