'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { useButtonSound } from '@/hooks/useSound';
import { cn } from '@/lib/utils';

interface RetroButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  sound?: boolean;
}

export const RetroButton = forwardRef<HTMLButtonElement, RetroButtonProps>(
  ({ className, variant = 'primary', size = 'md', glow = true, sound = true, children, onClick, onMouseEnter, ...props }, ref) => {
    const buttonSound = useButtonSound();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (sound) buttonSound.onClick();
      onClick?.(e);
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (sound) buttonSound.onMouseEnter();
      onMouseEnter?.(e);
    };

    const baseStyles = `
      relative font-mono font-semibold uppercase tracking-wide
      border-2 transition-all duration-200 ease-out
      disabled:opacity-50 disabled:cursor-not-allowed
      overflow-hidden
    `;

    const variants = {
      primary: `
        border-retro-cyan text-retro-cyan bg-transparent
        hover:bg-retro-cyan/10
        ${glow ? 'hover:shadow-[0_0_20px_rgba(0,255,242,0.4)]' : ''}
      `,
      secondary: `
        border-retro-magenta text-retro-magenta bg-transparent
        hover:bg-retro-magenta/10
        ${glow ? 'hover:shadow-[0_0_20px_rgba(255,0,255,0.4)]' : ''}
      `,
      ghost: `
        border-text-muted text-text-secondary bg-transparent
        hover:border-retro-cyan hover:text-retro-cyan
      `,
      danger: `
        border-retro-red text-retro-red bg-transparent
        hover:bg-retro-red/10
        ${glow ? 'hover:shadow-[0_0_20px_rgba(255,51,102,0.4)]' : ''}
      `,
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        {...props}
      >
        {/* Sweep effect */}
        <span className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-500 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <span className="relative z-10">{children}</span>
      </button>
    );
  }
);

RetroButton.displayName = 'RetroButton';
