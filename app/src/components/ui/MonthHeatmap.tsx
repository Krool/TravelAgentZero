'use client';

import { MonthlyData, Month, MONTH_SHORT } from '@/types';
import { cn } from '@/lib/utils';

interface MonthHeatmapProps {
  data: MonthlyData;
  selectedMonth?: Month;
  onMonthClick?: (month: Month) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const MONTHS: Month[] = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

export function MonthHeatmap({
  data,
  selectedMonth,
  onMonthClick,
  size = 'md',
  className,
}: MonthHeatmapProps) {
  const sizes = {
    sm: { cell: 'w-5 h-5', text: 'text-[6px]', gap: 'gap-0.5' },
    md: { cell: 'w-7 h-7', text: 'text-[8px]', gap: 'gap-1' },
    lg: { cell: 'w-9 h-9', text: 'text-[10px]', gap: 'gap-1.5' },
  };

  return (
    <div className={cn('flex flex-wrap', sizes[size].gap, className)}>
      {MONTHS.map((month) => {
        const isGood = data[month] === 1;
        const isSelected = selectedMonth === month;

        return (
          <button
            key={month}
            onClick={() => onMonthClick?.(month)}
            disabled={!onMonthClick}
            className={cn(
              'flex items-center justify-center rounded-sm transition-all duration-200',
              sizes[size].cell,
              sizes[size].text,
              'font-terminal uppercase',
              isGood
                ? 'bg-retro-green/80 text-bg-deep shadow-[0_0_8px_var(--retro-green)]'
                : 'bg-bg-hover text-text-muted',
              isSelected && 'ring-2 ring-retro-cyan ring-offset-1 ring-offset-bg-deep',
              onMonthClick && 'cursor-pointer hover:scale-110',
              !onMonthClick && 'cursor-default'
            )}
          >
            {MONTH_SHORT[month].charAt(0)}
          </button>
        );
      })}
    </div>
  );
}

// Inline version for cards
export function MonthHeatmapInline({
  data,
  selectedMonth,
  className,
}: {
  data: MonthlyData;
  selectedMonth?: Month;
  className?: string;
}) {
  return (
    <div className={cn('flex gap-0.5', className)}>
      {MONTHS.map((month) => {
        const isGood = data[month] === 1;
        const isSelected = selectedMonth === month;

        return (
          <div
            key={month}
            className={cn(
              'w-2 h-2 rounded-sm',
              isGood
                ? 'bg-retro-green shadow-[0_0_4px_var(--retro-green)]'
                : 'bg-bg-hover',
              isSelected && 'ring-1 ring-retro-cyan'
            )}
            title={MONTH_SHORT[month]}
          />
        );
      })}
    </div>
  );
}
