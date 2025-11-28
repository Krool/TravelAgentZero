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
          <label className="block text-text-secondary font-mono text-xs uppercase mb-1">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full bg-bg-dark border border-retro-cyan/30 rounded',
            'text-text-primary font-mono text-sm',
            'px-3 py-2 pr-8',
            'appearance-none cursor-pointer',
            'bg-no-repeat bg-right',
            'focus:outline-none focus:border-retro-cyan focus:shadow-[0_0_10px_rgba(0,255,242,0.2)]',
            'transition-all duration-200',
            className
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2300fff2' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E")`,
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
