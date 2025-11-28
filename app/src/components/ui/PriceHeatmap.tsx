'use client';

import { MonthlyPricing, Month, MONTH_SHORT, formatPrice } from '@/types';
import { cn } from '@/lib/utils';

interface PriceHeatmapProps {
  prices: MonthlyPricing;
  selectedMonth?: Month;
  className?: string;
  showLabels?: boolean;
}

/**
 * Get price level color based on value relative to min/max
 */
function getPriceColor(price: number, min: number, max: number): string {
  const range = max - min;
  if (range === 0) return 'var(--retro-cyan)';

  const normalized = (price - min) / range;

  // Green (cheap) to Yellow to Red (expensive)
  if (normalized < 0.33) return 'var(--retro-green)';
  if (normalized < 0.66) return 'var(--retro-yellow)';
  return 'var(--retro-red)';
}

/**
 * Compact inline price heatmap for cards
 */
export function PriceHeatmapInline({
  prices,
  selectedMonth,
  className,
}: PriceHeatmapProps) {
  const months: Month[] = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const values = months.map(m => prices[m]);
  const min = Math.min(...values);
  const max = Math.max(...values);

  return (
    <div className={cn('flex gap-0.5', className)} title="Flight price by month">
      {months.map((month) => {
        const price = prices[month];
        const isSelected = month === selectedMonth;

        return (
          <div
            key={month}
            className={cn(
              'w-2 h-3 rounded-sm transition-all',
              isSelected && 'ring-1 ring-white scale-110'
            )}
            style={{
              backgroundColor: getPriceColor(price, min, max),
              opacity: isSelected ? 1 : 0.7,
            }}
            title={`${MONTH_SHORT[month]}: ${formatPrice(price)}`}
          />
        );
      })}
    </div>
  );
}

/**
 * Full price heatmap with labels and values
 */
export function PriceHeatmap({
  prices,
  selectedMonth,
  className,
  showLabels = true,
}: PriceHeatmapProps) {
  const months: Month[] = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const values = months.map(m => prices[m]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);

  return (
    <div className={cn('space-y-2', className)}>
      {/* Header */}
      <div className="flex justify-between items-center text-xs font-mono text-text-muted">
        <span>Avg Flight Price by Month</span>
        <span className="text-retro-cyan">Avg: {formatPrice(avg)}</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-12 gap-1">
        {months.map((month) => {
          const price = prices[month];
          const isSelected = month === selectedMonth;
          const color = getPriceColor(price, min, max);

          return (
            <div key={month} className="text-center">
              {showLabels && (
                <div className="text-[8px] font-mono text-text-muted mb-0.5 uppercase">
                  {MONTH_SHORT[month]}
                </div>
              )}
              <div
                className={cn(
                  'h-8 rounded flex items-center justify-center text-[9px] font-mono font-bold transition-all cursor-default',
                  isSelected && 'ring-2 ring-white scale-105'
                )}
                style={{
                  backgroundColor: color,
                  color: price > (min + max) / 2 ? '#fff' : '#000',
                }}
                title={`${MONTH_SHORT[month]}: ${formatPrice(price)}`}
              >
                {price}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-between items-center text-[10px] font-mono">
        <div className="flex items-center gap-1">
          <div className="w-3 h-2 rounded-sm bg-retro-green" />
          <span className="text-text-muted">Cheaper ({formatPrice(min)})</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-2 rounded-sm bg-retro-red" />
          <span className="text-text-muted">Pricier ({formatPrice(max)})</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Airport price comparison component
 */
interface AirportPriceComparisonProps {
  prices: Partial<Record<string, MonthlyPricing>>;
  selectedMonth: Month;
  className?: string;
}

export function AirportPriceComparison({
  prices,
  selectedMonth,
  className,
}: AirportPriceComparisonProps) {
  const airports = Object.entries(prices);

  if (airports.length === 0) {
    return null;
  }

  // Get prices for selected month and sort
  const monthPrices = airports
    .map(([code, monthlyPrices]) => ({
      code,
      price: monthlyPrices?.[selectedMonth] || 0,
    }))
    .filter(a => a.price > 0)
    .sort((a, b) => a.price - b.price);

  if (monthPrices.length === 0) {
    return null;
  }

  const minPrice = monthPrices[0]?.price || 0;
  const maxPrice = monthPrices[monthPrices.length - 1]?.price || 0;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="text-xs font-mono text-text-muted uppercase">
        Est. Flight Prices for {MONTH_SHORT[selectedMonth]}
      </div>
      <div className="space-y-1">
        {monthPrices.map(({ code, price }) => {
          const isCheapest = price === minPrice;
          const barWidth = maxPrice > 0 ? (price / maxPrice) * 100 : 0;

          return (
            <div key={code} className="flex items-center gap-2">
              <span className={cn(
                'w-8 text-xs font-mono',
                isCheapest ? 'text-retro-green font-bold' : 'text-text-secondary'
              )}>
                {code}
              </span>
              <div className="flex-1 h-4 bg-bg-dark rounded overflow-hidden">
                <div
                  className="h-full rounded transition-all"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: getPriceColor(price, minPrice, maxPrice),
                  }}
                />
              </div>
              <span className={cn(
                'w-16 text-right text-xs font-mono',
                isCheapest ? 'text-retro-green font-bold' : 'text-text-secondary'
              )}>
                {formatPrice(price)}
                {isCheapest && ' *'}
              </span>
            </div>
          );
        })}
      </div>
      {minPrice < maxPrice && (
        <p className="text-[10px] text-text-muted font-mono">
          * Best departure airport for this month
        </p>
      )}
    </div>
  );
}
