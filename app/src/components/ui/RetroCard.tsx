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
      default: 'border-white/[0.08] hover:border-white/[0.15]',
      highlight: 'border-retro-magenta/20 hover:border-retro-magenta/40',
      warning: 'border-retro-orange/20 hover:border-retro-orange/40',
      danger: 'border-retro-red/20 hover:border-retro-red/40 bg-retro-red/[0.03]',
    };

    const glowStyles = glow
      ? 'hover:shadow-[0_4px_40px_rgba(34,211,238,0.06)]'
      : '';

    return (
      <div
        ref={ref}
        className={cn(
          'bg-[var(--glass-bg)] backdrop-blur-xl border rounded-xl transition-all duration-300',
          variants[variant],
          glowStyles,
          hoverable && 'hover:translate-y-[-1px]',
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
        'px-5 py-3.5 border-b border-white/[0.06]',
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
    <div className={cn('p-5', className)} {...props}>
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
        'px-5 py-3.5 border-t border-white/[0.06] bg-white/[0.02]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
