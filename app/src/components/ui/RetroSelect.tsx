'use client';

import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { useSound } from '@/hooks/useSound';

interface RetroSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  sound?: boolean;
}

export const RetroSelect = forwardRef<HTMLSelectElement, RetroSelectProps>(
  ({ className, label, sound = true, onChange, children, ...props }, ref) => {
    const { play } = useSound();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (sound) play('select');
      onChange?.(e);
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-text-secondary text-xs mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full bg-bg-dark border border-white/10 rounded-lg',
            'text-text-primary text-sm',
            'px-3 py-2 pr-8',
            'appearance-none cursor-pointer',
            'bg-no-repeat bg-right',
            'focus:outline-none focus:border-retro-cyan focus:shadow-[0_0_0_3px_rgba(34,211,238,0.1)]',
            'transition-all duration-200',
            className
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2322d3ee' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E")`,
            backgroundPosition: 'right 0.75rem center',
          }}
          onChange={handleChange}
          {...props}
        >
          {children}
        </select>
      </div>
    );
  }
);

RetroSelect.displayName = 'RetroSelect';
