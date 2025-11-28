'use client';

import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useSound } from '@/hooks/useSound';

interface RetroCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  sound?: boolean;
}

export const RetroCheckbox = forwardRef<HTMLInputElement, RetroCheckboxProps>(
  ({ className, label, sound = true, onChange, ...props }, ref) => {
    const { play } = useSound();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (sound) play('toggle');
      onChange?.(e);
    };

    return (
      <label className="flex items-center gap-2 cursor-pointer group">
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            className={cn(
              'appearance-none w-5 h-5 border-2 border-retro-cyan rounded-sm',
              'bg-transparent cursor-pointer',
              'checked:bg-retro-cyan checked:border-retro-cyan',
              'focus:outline-none focus:ring-2 focus:ring-retro-cyan/50',
              'transition-all duration-200',
              'group-hover:shadow-[0_0_8px_rgba(0,255,242,0.3)]',
              className
            )}
            onChange={handleChange}
            {...props}
          />
          {/* Checkmark */}
          <svg
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-bg-deep pointer-events-none opacity-0 peer-checked:opacity-100"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M2 6l3 3 5-6" />
          </svg>
        </div>
        {label && (
          <span className="text-text-primary font-mono text-sm group-hover:text-retro-cyan transition-colors">
            {label}
          </span>
        )}
      </label>
    );
  }
);

RetroCheckbox.displayName = 'RetroCheckbox';

// Toggle switch variant
export const RetroToggle = forwardRef<HTMLInputElement, RetroCheckboxProps>(
  ({ className, label, sound = true, onChange, ...props }, ref) => {
    const { play } = useSound();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (sound) play('toggle');
      onChange?.(e);
    };

    return (
      <label className="flex items-center gap-3 cursor-pointer group">
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            className="sr-only peer"
            onChange={handleChange}
            {...props}
          />
          <div
            className={cn(
              'w-10 h-5 rounded-full transition-all duration-300',
              'bg-bg-dark border border-retro-cyan/30',
              'peer-checked:bg-retro-cyan/20 peer-checked:border-retro-cyan',
              'group-hover:shadow-[0_0_8px_rgba(0,255,242,0.2)]',
              className
            )}
          />
          <div
            className={cn(
              'absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-all duration-300',
              'bg-text-muted peer-checked:bg-retro-cyan peer-checked:translate-x-5',
              'peer-checked:shadow-[0_0_8px_var(--retro-cyan)]'
            )}
          />
        </div>
        {label && (
          <span className="text-text-primary font-mono text-sm group-hover:text-retro-cyan transition-colors">
            {label}
          </span>
        )}
      </label>
    );
  }
);

RetroToggle.displayName = 'RetroToggle';
