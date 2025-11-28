'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface RetroSliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  showValue?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
}

export const RetroSlider = forwardRef<HTMLInputElement, RetroSliderProps>(
  ({ className, label, showValue = true, valuePrefix = '', valueSuffix = '', value, ...props }, ref) => {
    return (
      <div className="w-full">
        {(label || showValue) && (
          <div className="flex justify-between items-center mb-2">
            {label && (
              <label className="text-text-secondary font-mono text-xs uppercase">
                {label}
              </label>
            )}
            {showValue && (
              <span className="text-retro-cyan font-mono text-sm">
                {valuePrefix}{value}{valueSuffix}
              </span>
            )}
          </div>
        )}
        <input
          ref={ref}
          type="range"
          value={value}
          className={cn(
            'w-full h-2 rounded appearance-none cursor-pointer',
            'bg-bg-dark border border-retro-cyan/30',
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4',
            '[&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:bg-retro-cyan',
            '[&::-webkit-slider-thumb]:cursor-pointer',
            '[&::-webkit-slider-thumb]:shadow-[0_0_10px_var(--retro-cyan)]',
            '[&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-200',
            '[&::-webkit-slider-thumb]:hover:scale-110',
            '[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4',
            '[&::-moz-range-thumb]:rounded-sm [&::-moz-range-thumb]:bg-retro-cyan',
            '[&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer',
            'focus:outline-none',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

RetroSlider.displayName = 'RetroSlider';

// Dual range slider for min/max values
interface DualSliderProps {
  label?: string;
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
  step?: number;
  valuePrefix?: string;
  valueSuffix?: string;
  className?: string;
}

export function RetroDualSlider({
  label,
  min,
  max,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  step = 1,
  valuePrefix = '',
  valueSuffix = '',
  className,
}: DualSliderProps) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <label className="text-text-secondary font-mono text-xs uppercase">
            {label}
          </label>
          <span className="text-retro-cyan font-mono text-sm">
            {valuePrefix}{minValue}{valueSuffix} - {valuePrefix}{maxValue}{valueSuffix}
          </span>
        </div>
      )}
      <div className="relative pt-1">
        {/* Track background */}
        <div className="h-2 bg-bg-dark border border-retro-cyan/30 rounded" />

        {/* Active range indicator */}
        <div
          className="absolute top-1 h-2 bg-retro-cyan/30 rounded"
          style={{
            left: `${((minValue - min) / (max - min)) * 100}%`,
            width: `${((maxValue - minValue) / (max - min)) * 100}%`,
          }}
        />

        {/* Min slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minValue}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (value < maxValue) onMinChange(value);
          }}
          className={cn(
            'absolute top-0 w-full h-2 appearance-none bg-transparent cursor-pointer',
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4',
            '[&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:bg-retro-cyan',
            '[&::-webkit-slider-thumb]:cursor-pointer',
            '[&::-webkit-slider-thumb]:shadow-[0_0_10px_var(--retro-cyan)]',
            'pointer-events-auto'
          )}
        />

        {/* Max slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxValue}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (value > minValue) onMaxChange(value);
          }}
          className={cn(
            'absolute top-0 w-full h-2 appearance-none bg-transparent cursor-pointer',
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4',
            '[&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:bg-retro-magenta',
            '[&::-webkit-slider-thumb]:cursor-pointer',
            '[&::-webkit-slider-thumb]:shadow-[0_0_10px_var(--retro-magenta)]',
            'pointer-events-auto'
          )}
        />
      </div>
    </div>
  );
}
