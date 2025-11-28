'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { calculateScore, getMaxPossibleScore, getDurationRecommendation } from '@/lib/scoring';
import { RetroButton } from '@/components/ui/RetroButton';
import { RetroCard, RetroCardBody, RetroCardHeader } from '@/components/ui/RetroCard';
import { ScoreGauge, ScoreBadge } from '@/components/ui/ScoreGauge';
import { MonthHeatmap } from '@/components/ui/MonthHeatmap';
import { PriceHeatmap, AirportPriceComparison } from '@/components/ui/PriceHeatmap';
import { RetroCheckbox } from '@/components/ui/RetroCheckbox';
import { RetroSlider } from '@/components/ui/RetroSlider';
import { formatDuration, formatFlightTime, cn } from '@/lib/utils';
import { AIRPORT_HUBS, AirportCode } from '@/types';

export default function DestinationClient() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const {
    destinations,
    travelers,
    preferences,
    isLoaded,
    setTravelerVisited,
    setTravelerRating,
    setTravelMonth,
  } = useAppStore();

  const destination = useMemo(() => {
    return destinations.find((d) => d.id === id);
  }, [destinations, id]);

  const score = useMemo(() => {
    if (!destination) return null;
    return calculateScore(destination, preferences, travelers);
  }, [destination, preferences, travelers]);

  if (!isLoaded) return null;

  if (!destination || !score) {
    return (
      <div className="container mx-auto px-4 py-8">
        <RetroCard className="p-8 text-center">
          <div className="font-mono font-bold text-retro-red text-xl mb-4">
            DESTINATION NOT FOUND
          </div>
          <RetroButton onClick={() => router.push('/')}>
            Return to Base
          </RetroButton>
        </RetroCard>
      </div>
    );
  }

  const maxScore = getMaxPossibleScore();

  // Flight time and duration recommendation
  const flightHours = destination.flightTimes[preferences.homeAirport] || 0;
  const durationRec = getDurationRecommendation(destination.duration, flightHours);

  // Climate and type icons
  const climateInfo = {
    Hot: { icon: '☀️', desc: 'Hot / Tropical' },
    Cold: { icon: '❄️', desc: 'Cold / Alpine' },
    Temperate: { icon: '🌤️', desc: 'Temperate' },
    Mix: { icon: '🌡️', desc: 'Variable' },
  }[destination.climate];

  const typeInfo = {
    Urban: { icon: '🏙️', desc: 'Urban / City' },
    Nature: { icon: '🌲', desc: 'Nature / Outdoors' },
    Mix: { icon: '🗺️', desc: 'Mixed Experience' },
  }[destination.type];

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-retro-cyan font-mono mb-4 transition-colors"
      >
        ← Back to Destinations
      </Link>

      {/* Header */}
      <div className="mb-6">
        <RetroCard className="p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="font-pixel text-lg text-retro-cyan glow-cyan mb-2">
                {destination.name}
              </h1>
              <p className="font-mono text-text-secondary text-lg">
                {destination.countries.join(', ')}
                {destination.region && (
                  <span className="text-text-muted"> • {destination.region}</span>
                )}
              </p>
              <div className="flex items-center gap-4 mt-3 text-sm font-mono text-text-muted">
                <span className="flex items-center gap-1">
                  ⏱️ {formatDuration(destination.duration)}
                </span>
                <span className="flex items-center gap-1">
                  {climateInfo.icon} {climateInfo.desc}
                </span>
                <span className="flex items-center gap-1">
                  {typeInfo.icon} {typeInfo.desc}
                </span>
              </div>
            </div>
            <div className="shrink-0">
              <ScoreBadge value={score.total} max={maxScore} className="text-lg" />
            </div>
          </div>
        </RetroCard>
      </div>

      {/* Duration Recommendation based on flight time */}
      {flightHours > 0 && (
        <div className="mb-6">
          <RetroCard
            variant={
              durationRec.status === 'good'
                ? 'default'
                : durationRec.status === 'warning'
                ? 'warning'
                : 'danger'
            }
            className="p-4"
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'text-3xl',
                  durationRec.status === 'good' && 'text-retro-green',
                  durationRec.status === 'warning' && 'text-retro-orange',
                  durationRec.status === 'poor' && 'text-retro-red'
                )}
              >
                {durationRec.status === 'good'
                  ? '✓'
                  : durationRec.status === 'warning'
                  ? '⚠'
                  : '✗'}
              </div>
              <div>
                <div className="font-mono font-bold text-xs text-text-muted uppercase mb-1">
                  Duration Recommendation
                </div>
                <p className="font-mono text-text-primary">
                  {durationRec.message}
                </p>
                <p className="font-mono text-xs text-text-muted mt-1">
                  Flight from {AIRPORT_HUBS[preferences.homeAirport].city}: ~{flightHours}h • Suggested stay: {durationRec.recommended}+ days • This trip: {destination.duration} days
                </p>
              </div>
            </div>
          </RetroCard>
        </div>
      )}

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Itinerary Summary */}
          <RetroCard>
            <RetroCardHeader>
              <h2 className="font-mono font-bold text-sm text-retro-magenta uppercase">
                Itinerary Summary
              </h2>
            </RetroCardHeader>
            <RetroCardBody>
              <p className="font-mono text-text-primary leading-relaxed">
                {destination.itinerarySummary}
              </p>
            </RetroCardBody>
          </RetroCard>

          {/* Important Considerations */}
          <RetroCard variant="warning">
            <RetroCardHeader>
              <h2 className="font-mono font-bold text-sm text-retro-orange uppercase">
                Important Considerations
              </h2>
            </RetroCardHeader>
            <RetroCardBody>
              <p className="font-mono text-text-primary leading-relaxed">
                {destination.considerations}
              </p>
            </RetroCardBody>
          </RetroCard>

          {/* Visa Requirements */}
          <RetroCard>
            <RetroCardHeader>
              <h2 className="font-mono font-bold text-sm text-retro-cyan uppercase">
                Visa Requirements
              </h2>
            </RetroCardHeader>
            <RetroCardBody>
              <p className="font-mono text-text-primary">
                {destination.visaRequirements}
              </p>
            </RetroCardBody>
          </RetroCard>

          {/* Best Time to Visit */}
          <RetroCard>
            <RetroCardHeader>
              <h2 className="font-mono font-bold text-sm text-retro-green uppercase">
                Best Time to Visit
              </h2>
            </RetroCardHeader>
            <RetroCardBody>
              <p className="font-mono text-text-secondary mb-4">
                {destination.bestTimeDescription}
              </p>
              <MonthHeatmap
                data={destination.bestMonths}
                selectedMonth={preferences.travelMonth}
                onMonthClick={(month) => setTravelMonth(month)}
                size="lg"
              />
              <p className="text-xs text-text-muted mt-2 font-mono">
                Click a month to update your travel preferences
              </p>
            </RetroCardBody>
          </RetroCard>

          {/* Flight Times */}
          <RetroCard>
            <RetroCardHeader>
              <h2 className="font-mono font-bold text-sm text-retro-cyan uppercase">
                Flight Times from Major Hubs
              </h2>
            </RetroCardHeader>
            <RetroCardBody>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {(Object.entries(destination.flightTimes) as [AirportCode, number][]).map(
                  ([code, hours]) => (
                    <div
                      key={code}
                      className={cn(
                        'p-2 rounded border text-center',
                        code === preferences.homeAirport
                          ? 'border-retro-cyan bg-retro-cyan/10'
                          : 'border-bg-hover'
                      )}
                    >
                      <div className="font-mono text-sm text-text-primary">
                        {formatFlightTime(hours)}
                      </div>
                      <div className="font-mono text-[10px] text-text-muted">
                        {AIRPORT_HUBS[code]?.city || code}
                      </div>
                    </div>
                  )
                )}
              </div>
            </RetroCardBody>
          </RetroCard>

          {/* Historical Flight Prices */}
          {destination.avgFlightPrices && destination.avgFlightPrices[preferences.homeAirport] && (
            <RetroCard>
              <RetroCardHeader>
                <h2 className="font-mono font-bold text-sm text-retro-yellow uppercase">
                  Estimated Flight Prices
                </h2>
              </RetroCardHeader>
              <RetroCardBody>
                <PriceHeatmap
                  prices={destination.avgFlightPrices[preferences.homeAirport]!}
                  selectedMonth={preferences.travelMonth}
                />
                {Object.keys(destination.avgFlightPrices).length > 1 && (
                  <div className="mt-4 pt-4 border-t border-bg-hover">
                    <AirportPriceComparison
                      prices={destination.avgFlightPrices}
                      selectedMonth={preferences.travelMonth}
                    />
                  </div>
                )}
                <p className="text-[10px] text-text-muted mt-3 font-mono">
                  * Prices are estimates based on historical averages. Actual prices may vary.
                </p>
              </RetroCardBody>
            </RetroCard>
          )}
        </div>

        {/* Right column - Stats & Tracking */}
        <div className="space-y-6">
          {/* Score Breakdown */}
          <RetroCard>
            <RetroCardHeader>
              <h2 className="font-mono font-bold text-sm text-retro-cyan uppercase">
                Score Breakdown
              </h2>
            </RetroCardHeader>
            <RetroCardBody className="space-y-3">
              <ScoreGauge
                value={score.monthMatch}
                max={20}
                label="Month Match"
                size="sm"
              />
              <ScoreGauge
                value={score.newPlace}
                max={15}
                label="New Place Bonus"
                size="sm"
              />
              <ScoreGauge
                value={score.personalRating}
                max={15}
                label="Personal Rating"
                size="sm"
              />
              <ScoreGauge
                value={score.childFriendly}
                max={12}
                label="Child Friendly"
                size="sm"
              />
              <ScoreGauge
                value={score.costMatch}
                max={10}
                label="Budget Fit"
                size="sm"
              />
              <ScoreGauge
                value={score.safetyScore}
                max={8}
                label="Safety"
                size="sm"
              />
              <ScoreGauge
                value={score.durationMatch}
                max={8}
                label="Duration Fit"
                size="sm"
              />
              <ScoreGauge
                value={score.flightTime}
                max={5}
                label="Flight Time"
                size="sm"
              />
            </RetroCardBody>
          </RetroCard>

          {/* Destination Stats */}
          <RetroCard>
            <RetroCardHeader>
              <h2 className="font-mono font-bold text-sm text-retro-magenta uppercase">
                Destination Stats
              </h2>
            </RetroCardHeader>
            <RetroCardBody className="space-y-3">
              <StatRow
                label="Cost Level"
                value={destination.cost}
                max={10}
                inverted
              />
              <StatRow
                label="Safety"
                value={10 - destination.danger}
                max={10}
              />
              <StatRow
                label="Kid-Friendly"
                value={destination.easeWithChild}
                max={10}
              />
              <StatRow label="Urgency" value={destination.urgency} max={10} />
            </RetroCardBody>
          </RetroCard>

          {/* Traveler Tracking */}
          <RetroCard>
            <RetroCardHeader>
              <h2 className="font-mono font-bold text-sm text-retro-green uppercase">
                Traveler Tracking
              </h2>
            </RetroCardHeader>
            <RetroCardBody>
              {travelers.length === 0 ? (
                <p className="text-text-muted text-sm italic">
                  No travelers added yet.{' '}
                  <Link href="/travelers" className="text-retro-cyan underline">
                    Add travelers
                  </Link>
                </p>
              ) : (
                <div className="space-y-4">
                  {travelers.map((traveler) => {
                    const data = traveler.destinations[destination.id] || {
                      hasVisited: false,
                      rating: 5,
                    };
                    return (
                      <div
                        key={traveler.id}
                        className="p-3 border border-bg-hover rounded"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-text-primary flex items-center gap-2">
                            {traveler.name}
                            {traveler.isChild && (
                              <span className="text-[9px] px-1 py-0.5 bg-retro-orange/20 text-retro-orange rounded uppercase font-bold">
                                Child
                              </span>
                            )}
                          </span>
                          <RetroCheckbox
                            checked={data.hasVisited}
                            onChange={(e) =>
                              setTravelerVisited(
                                traveler.id,
                                destination.id,
                                e.target.checked
                              )
                            }
                            label="Been here"
                          />
                        </div>
                        <RetroSlider
                          label="Interest Rating"
                          min={1}
                          max={10}
                          value={data.rating}
                          onChange={(e) =>
                            setTravelerRating(
                              traveler.id,
                              destination.id,
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </RetroCardBody>
          </RetroCard>
        </div>
      </div>
    </div>
  );
}

function StatRow({
  label,
  value,
  max,
  inverted = false,
}: {
  label: string;
  value: number;
  max: number;
  inverted?: boolean;
}) {
  const displayValue = inverted ? max - value + 1 : value;
  const percentage = (displayValue / max) * 100;

  let color = 'var(--retro-green)';
  if (percentage < 40) color = 'var(--retro-red)';
  else if (percentage < 60) color = 'var(--retro-orange)';
  else if (percentage < 80) color = 'var(--retro-cyan)';

  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-xs text-text-muted uppercase w-24">
        {label}
      </span>
      <div className="flex-1 h-2 bg-bg-dark rounded overflow-hidden">
        <div
          className="h-full rounded transition-all"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
      <span className="font-mono text-xs text-text-secondary w-8 text-right">
        {value}/{max}
      </span>
    </div>
  );
}
