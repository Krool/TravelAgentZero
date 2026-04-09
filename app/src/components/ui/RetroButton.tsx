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
      relative font-semibold tracking-wide cursor-pointer
      border transition-all duration-200 ease-out
      disabled:opacity-40 disabled:cursor-not-allowed
      rounded-lg
    `;

    const variants = {
      primary: `
        border-retro-cyan/60 text-retro-cyan bg-retro-cyan/[0.06]
        hover:bg-retro-cyan/15 hover:border-retro-cyan
        ${glow ? 'hover:shadow-[0_0_24px_rgba(34,211,238,0.15)]' : ''}
      `,
      secondary: `
        border-retro-magenta/60 text-retro-magenta bg-retro-magenta/[0.06]
        hover:bg-retro-magenta/15 hover:border-retro-magenta
        ${glow ? 'hover:shadow-[0_0_24px_rgba(232,121,249,0.15)]' : ''}
      `,
      ghost: `
        border-white/10 text-text-secondary bg-transparent
        hover:border-white/20 hover:text-text-primary hover:bg-white/[0.04]
      `,
      danger: `
        border-retro-red/60 text-retro-red bg-retro-red/[0.06]
        hover:bg-retro-red/15 hover:border-retro-red
        ${glow ? 'hover:shadow-[0_0_24px_rgba(248,113,113,0.15)]' : ''}
      `,
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-2.5 text-sm',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        {...props}
      >
        {children}
      </button>
    );
  }
);

RetroButton.displayName = 'RetroButton';
