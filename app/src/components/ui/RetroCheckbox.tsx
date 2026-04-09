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
      <label className="flex items-center gap-2.5 cursor-pointer group">
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            className={cn(
              'peer appearance-none w-[18px] h-[18px] border border-white/20 rounded-[5px]',
              'bg-transparent cursor-pointer',
              'checked:bg-retro-cyan checked:border-retro-cyan',
              'focus:outline-none focus:ring-2 focus:ring-retro-cyan/30',
              'transition-all duration-200',
              'group-hover:border-retro-cyan/50',
              className
            )}
            onChange={handleChange}
            {...props}
          />
          <svg
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 text-bg-deep pointer-events-none opacity-0 peer-checked:opacity-100"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M2 6l3 3 5-6" />
          </svg>
        </div>
        {label && (
          <span className="text-text-primary text-sm group-hover:text-retro-cyan transition-colors">
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
              'w-10 h-[22px] rounded-full transition-all duration-300',
              'bg-white/[0.08] border border-white/10',
              'peer-checked:bg-retro-cyan/20 peer-checked:border-retro-cyan/40',
              'group-hover:border-white/20',
              className
            )}
          />
          <div
            className={cn(
              'absolute top-[3px] left-[3px] w-4 h-4 rounded-full transition-all duration-300',
              'bg-text-muted peer-checked:bg-retro-cyan peer-checked:translate-x-[18px]',
              'peer-checked:shadow-[0_0_8px_rgba(34,211,238,0.4)]'
            )}
          />
        </div>
        {label && (
          <span className="text-text-primary text-sm group-hover:text-retro-cyan transition-colors">
            {label}
          </span>
        )}
      </label>
    );
  }
);

RetroToggle.displayName = 'RetroToggle';
