'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface RetroCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'highlight' | 'warning' | 'danger';
  glow?: boolean;
  hoverable?: boolean;
}

export const RetroCard = forwardRef<HTMLDivElement, RetroCardProps>(
  ({ className, variant = 'default', glow = false, hoverable = true, children, ...props }, ref) => {
    const variants = {
      default: 'border-retro-cyan/20 hover:border-retro-cyan/50',
      highlight: 'border-retro-magenta/30 hover:border-retro-magenta',
      warning: 'border-retro-orange/30 hover:border-retro-orange',
      danger: 'border-retro-red/30 hover:border-retro-red bg-retro-red/5',
    };

    const glowStyles = glow
      ? 'shadow-[0_0_20px_rgba(0,255,242,0.1)] hover:shadow-[0_0_30px_rgba(0,255,242,0.2)]'
      : '';

    return (
      <div
        ref={ref}
        className={cn(
          'bg-bg-card border rounded transition-all duration-300',
          variants[variant],
          glowStyles,
          hoverable && 'hover:translate-y-[-2px]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

RetroCard.displayName = 'RetroCard';

// Card header component
export function RetroCardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'px-4 py-3 border-b border-retro-cyan/20',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Card body component
export function RetroCardBody({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-4', className)} {...props}>
      {children}
    </div>
  );
}

// Card footer component
export function RetroCardFooter({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'px-4 py-3 border-t border-retro-cyan/20 bg-bg-dark/50',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
