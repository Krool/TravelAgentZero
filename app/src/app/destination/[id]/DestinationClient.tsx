'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { calculateScore, getMaxPossibleScore, getDurationRecommendation, filterDestinations, sortDestinationsByScore } from '@/lib/scoring';
import { decodeShareParams } from '@/lib/shareUtils';
import { Analytics } from '@/lib/analytics';
import { RetroButton } from '@/components/ui/RetroButton';
import { RetroCard, RetroCardBody, RetroCardHeader } from '@/components/ui/RetroCard';
import { ScoreGauge, ScoreBadge } from '@/components/ui/ScoreGauge';
import { MonthHeatmap } from '@/components/ui/MonthHeatmap';
import { PriceHeatmap, AirportPriceComparison } from '@/components/ui/PriceHeatmap';
import { RetroCheckbox } from '@/components/ui/RetroCheckbox';
import { RetroSlider } from '@/components/ui/RetroSlider';
import { RetroTabs, useTabHash, Tab } from '@/components/ui/RetroTabs';
import { ShareButton } from '@/components/ui/ShareButton';
import { PrintButton, PrintableContent } from '@/components/PrintView';
import { formatDuration, formatFlightTime, cn } from '@/lib/utils';
import { AIRPORT_HUBS, AirportCode, UserPreferences, DEFAULT_PREFERENCES, getDestinationImageUrl } from '@/types';

const TABS: Tab[] = [
  { id: 'overview', label: 'Overview', icon: '📋' },
  { id: 'planning', label: 'Planning', icon: '🗓️' },
  { id: 'costs', label: 'Costs', icon: '💰' },
  { id: 'notes', label: 'Your Notes', icon: '📝' },
];

export default function DestinationClient() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useTabHash('overview');

  const {
    destinations,
    travelers,
    preferences,
    isLoaded,
    setTravelerVisited,
    setTravelerRating,
    setTravelMonth,
    setPreferences,
    destinationNotes,
    setDestinationNote,
  } = useAppStore();

  const destination = useMemo(() => {
    return destinations.find((d) => d.id === id);
  }, [destinations, id]);

  const score = useMemo(() => {
    if (!destination) return null;
    return calculateScore(destination, preferences, travelers);
  }, [destination, preferences, travelers]);

  const { prevDest, nextDest } = useMemo(() => {
    if (!destination) return { prevDest: null, nextDest: null };
    const filtered = filterDestinations(destinations, preferences, travelers);
    const sorted = sortDestinationsByScore(filtered, preferences, travelers);
    const currentIndex = sorted.findIndex(({ destination: d }) => d.id === destination.id);
    // The current destination may be excluded by active filters (e.g. a shared
    // link into a filtered-out place) - then there are no meaningful neighbors.
    if (currentIndex === -1) return { prevDest: null, nextDest: null };
    return {
      prevDest: currentIndex > 0 ? sorted[currentIndex - 1].destination : null,
      nextDest: currentIndex < sorted.length - 1 ? sorted[currentIndex + 1].destination : null,
    };
  }, [destination, destinations, preferences, travelers]);

  // Apply preferences carried in a shared link (?m=&a=&d=) once, after load.
  // Reads window.location.search rather than useSearchParams() to avoid the
  // Suspense-boundary requirement that would deopt this statically-exported page.
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    // Only adopt a shared link's context if the visitor hasn't set their own
    // month/airport/duration yet. Never silently overwrite saved settings for
    // a returning user who opens someone else's link.
    const untouched =
      preferences.travelMonth === DEFAULT_PREFERENCES.travelMonth &&
      preferences.homeAirport === DEFAULT_PREFERENCES.homeAirport &&
      preferences.durationMin === DEFAULT_PREFERENCES.durationMin &&
      preferences.durationMax === DEFAULT_PREFERENCES.durationMax;
    if (!untouched) return;
    const decoded = decodeShareParams(new URLSearchParams(window.location.search));
    const patch: Partial<UserPreferences> = {};
    if (decoded.month) patch.travelMonth = decoded.month;
    if (decoded.airport) patch.homeAirport = decoded.airport;
    if (decoded.durationMin != null) patch.durationMin = decoded.durationMin;
    if (decoded.durationMax != null) patch.durationMax = decoded.durationMax;
    if (Object.keys(patch).length > 0) setPreferences(patch);
    // Run once when data becomes available; not on every preference change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  // Count a detail-page view once the destination resolves.
  useEffect(() => {
    if (destination) Analytics.destinationViewed(destination.id);
  }, [destination]);

  if (!isLoaded) return null;

  if (!destination || !score) {
    return (
      <div className="container mx-auto px-4 py-8">
        <RetroCard className="p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-retro-red/15 flex items-center justify-center mx-auto mb-4">
            <span className="text-retro-red text-xl">!</span>
          </div>
          <div className="font-semibold text-text-primary text-lg mb-2">
            Destination not found
          </div>
          <RetroButton onClick={() => router.push('/')}>
            Back to destinations
          </RetroButton>
        </RetroCard>
      </div>
    );
  }

  const maxScore = getMaxPossibleScore();
  const flightHours = destination.flightTimes[preferences.homeAirport] ?? 0;
  const durationRec = getDurationRecommendation(destination.duration, flightHours);

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
        className="inline-flex items-center gap-2 text-text-secondary hover:text-retro-cyan text-sm mb-5 transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Destinations
      </Link>

      {/* Hero */}
      <div className="mb-6">
        <RetroCard className="overflow-hidden">
          <div className="relative h-56 sm:h-72 md:h-80">
            <img
              src={getDestinationImageUrl(destination, 'hero')}
              srcSet={`${getDestinationImageUrl(destination, 'card')} 800w, ${getDestinationImageUrl(destination, 'hero')} 1600w`}
              sizes="100vw"
              alt={destination.name}
              className="w-full h-full object-cover"
              decoding="async"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-deep via-bg-deep/50 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
              <p className="eyebrow text-retro-cyan mb-1.5">
                {destination.region} · {destination.countries.join(', ')}
              </p>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h1 className="display-title text-2xl sm:text-4xl text-text-primary">
                  {destination.name}
                </h1>
                <div className="shrink-0 flex items-center gap-3">
                  <PrintButton destination={destination} preferences={preferences} className="hidden sm:block" />
                  <ShareButton
                    destinationId={destination.id}
                    destinationName={destination.name}
                    preferences={preferences}
                  />
                  <ScoreBadge value={score.total} max={maxScore} className="text-lg" />
                </div>
              </div>
            </div>
          </div>
          <div className="px-5 sm:px-6 py-3 border-t border-white/[0.06] flex flex-wrap items-center gap-x-4 gap-y-1.5 telemetry">
            <span>
              <span className="telemetry-key">Trip:</span>{' '}
              <span className="telemetry-value">{formatDuration(destination.duration)}</span>
            </span>
            <span>
              <span className="telemetry-key">Climate:</span>{' '}
              <span className="telemetry-value">{climateInfo.icon} {climateInfo.desc}</span>
            </span>
            <span>
              <span className="telemetry-key">Style:</span>{' '}
              <span className="telemetry-value">{typeInfo.icon} {typeInfo.desc}</span>
            </span>
          </div>
        </RetroCard>
      </div>

      {/* Duration Recommendation */}
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
            className="p-5"
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0',
                  durationRec.status === 'good' && 'bg-retro-green/15 text-retro-green',
                  durationRec.status === 'warning' && 'bg-retro-orange/15 text-retro-orange',
                  durationRec.status === 'poor' && 'bg-retro-red/15 text-retro-red'
                )}
              >
                {durationRec.status === 'good' ? '✓' : durationRec.status === 'warning' ? '⚠' : '✗'}
              </div>
              <div>
                <div className="text-xs text-text-muted uppercase tracking-wider mb-1 font-medium">
                  Duration Recommendation
                </div>
                <p className="text-text-primary text-sm">
                  {durationRec.message}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Flight from {AIRPORT_HUBS[preferences.homeAirport]?.city ?? preferences.homeAirport}: ~{flightHours}h · Suggested: {durationRec.recommended}+ days · This trip: {destination.duration} days
                </p>
              </div>
            </div>
          </RetroCard>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <RetroTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab
          destination={destination}
          score={score}
          maxScore={maxScore}
        />
      )}

      {activeTab === 'planning' && (
        <PlanningTab
          destination={destination}
          preferences={preferences}
          setTravelMonth={setTravelMonth}
        />
      )}

      {activeTab === 'costs' && (
        <CostsTab
          destination={destination}
          preferences={preferences}
        />
      )}

      {activeTab === 'notes' && (
        <NotesTab
          destination={destination}
          travelers={travelers}
          setTravelerVisited={setTravelerVisited}
          setTravelerRating={setTravelerRating}
          note={destinationNotes[destination.id] || ''}
          setNote={(note: string) => setDestinationNote(destination.id, note)}
        />
      )}

      {/* Prev/Next Navigation */}
      {(prevDest || nextDest) && (
        <div className="mt-8 flex items-center justify-between gap-4">
          {prevDest ? (
            <Link
              href={`/destination/${prevDest.id}`}
              className="flex items-center gap-2 text-text-secondary hover:text-retro-cyan text-sm transition-colors min-w-0"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span className="truncate">{prevDest.name}</span>
            </Link>
          ) : (
            <div />
          )}
          {nextDest ? (
            <Link
              href={`/destination/${nextDest.id}`}
              className="flex items-center gap-2 text-text-secondary hover:text-retro-cyan text-sm transition-colors min-w-0 text-right"
            >
              <span className="truncate">{nextDest.name}</span>
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <div />
          )}
        </div>
      )}

      <PrintableContent destination={destination} preferences={preferences} />
    </div>
  );
}

// Overview Tab
function OverviewTab({
  destination,
  score,
  maxScore,
}: {
  destination: ReturnType<typeof useAppStore.getState>['destinations'][0];
  score: NonNullable<ReturnType<typeof calculateScore>>;
  maxScore: number;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {destination.highlights && destination.highlights.length > 0 && (
          <RetroCard>
            <RetroCardHeader>
              <h2 className="font-semibold text-sm text-retro-green">
                Why You&apos;ll Love It
              </h2>
            </RetroCardHeader>
            <RetroCardBody>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                {destination.highlights.map((highlight, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm">
                    <span className="text-retro-green mt-0.5 shrink-0">✦</span>
                    <span className="text-text-primary">{highlight}</span>
                  </li>
                ))}
              </ul>
            </RetroCardBody>
          </RetroCard>
        )}

        <RetroCard>
          <RetroCardHeader>
            <h2 className="font-semibold text-sm text-retro-magenta">
              Itinerary Summary
            </h2>
          </RetroCardHeader>
          <RetroCardBody>
            <p className="text-text-primary leading-relaxed text-sm">
              {destination.itinerarySummary}
            </p>
          </RetroCardBody>
        </RetroCard>

        <RetroCard variant="warning">
          <RetroCardHeader>
            <h2 className="font-semibold text-sm text-retro-orange">
              Important Considerations
            </h2>
          </RetroCardHeader>
          <RetroCardBody>
            <p className="text-text-primary leading-relaxed text-sm">
              {destination.considerations}
            </p>
          </RetroCardBody>
        </RetroCard>

        <RetroCard>
          <RetroCardHeader>
            <h2 className="font-semibold text-sm text-text-primary">
              Destination Stats
            </h2>
          </RetroCardHeader>
          <RetroCardBody className="space-y-3">
            <StatRow label="Cost Level" value={destination.cost} max={10} inverted />
            <StatRow label="Safety" value={10 - destination.danger} max={10} />
            <StatRow label="Kid-Friendly" value={destination.easeWithChild} max={10} />
            <StatRow label="Urgency" value={destination.urgency} max={10} />
          </RetroCardBody>
        </RetroCard>
      </div>

      <div className="space-y-6">
        <RetroCard>
          <RetroCardHeader>
            <h2 className="font-semibold text-sm text-retro-cyan">
              Score Breakdown
            </h2>
          </RetroCardHeader>
          <RetroCardBody className="space-y-3">
            <ScoreGauge value={score.monthMatch} max={20} label="Month Match" size="sm" />
            <ScoreGauge value={score.newPlace} max={15} label="New Place Bonus" size="sm" />
            <ScoreGauge value={score.personalRating} max={15} label="Personal Rating" size="sm" />
            <ScoreGauge value={score.childFriendly} max={12} label="Child Friendly" size="sm" />
            <ScoreGauge value={score.costMatch} max={10} label="Budget Fit" size="sm" />
            <ScoreGauge value={score.safetyScore} max={8} label="Safety" size="sm" />
            <ScoreGauge value={score.durationMatch} max={8} label="Duration Fit" size="sm" />
            <ScoreGauge value={score.flightTime} max={5} label="Flight Time" size="sm" />
            <ScoreGauge value={score.climateMatch} max={4} label="Climate Match" size="sm" />
            <ScoreGauge value={score.typeMatch} max={3} label="Trip Style Match" size="sm" />
          </RetroCardBody>
        </RetroCard>
      </div>
    </div>
  );
}

// Planning Tab
function PlanningTab({
  destination,
  preferences,
  setTravelMonth,
}: {
  destination: ReturnType<typeof useAppStore.getState>['destinations'][0];
  preferences: ReturnType<typeof useAppStore.getState>['preferences'];
  setTravelMonth: (month: typeof preferences.travelMonth) => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <RetroCard>
        <RetroCardHeader>
          <h2 className="font-semibold text-sm text-retro-green">
            Best Time to Visit
          </h2>
        </RetroCardHeader>
        <RetroCardBody>
          <p className="text-text-secondary text-sm mb-4">
            {destination.bestTimeDescription}
          </p>
          <MonthHeatmap
            data={destination.bestMonths}
            selectedMonth={preferences.travelMonth}
            onMonthClick={(month) => setTravelMonth(month)}
            size="lg"
          />
          <p className="text-xs text-text-muted mt-2">
            Click a month to update your travel preferences
          </p>
        </RetroCardBody>
      </RetroCard>

      <RetroCard>
        <RetroCardHeader>
          <h2 className="font-semibold text-sm text-retro-cyan">
            Visa Requirements
          </h2>
        </RetroCardHeader>
        <RetroCardBody>
          <p className="text-text-primary text-sm">
            {destination.visaRequirements}
          </p>
        </RetroCardBody>
      </RetroCard>

      <RetroCard className="lg:col-span-2">
        <RetroCardHeader>
          <h2 className="font-semibold text-sm text-retro-cyan">
            Flight Times from Major Hubs
          </h2>
        </RetroCardHeader>
        <RetroCardBody>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {(Object.entries(destination.flightTimes) as [AirportCode, number][]).map(
              ([code, hours]) => (
                <div
                  key={code}
                  className={cn(
                    'p-3 rounded-lg border text-center',
                    code === preferences.homeAirport
                      ? 'border-retro-cyan/40 bg-retro-cyan/[0.06]'
                      : 'border-white/[0.06]'
                  )}
                >
                  <div className="text-sm text-text-primary font-medium">
                    {formatFlightTime(hours)}
                  </div>
                  <div className="text-[10px] text-text-muted mt-0.5">
                    {AIRPORT_HUBS[code]?.city || code}
                  </div>
                </div>
              )
            )}
          </div>
        </RetroCardBody>
      </RetroCard>

      <RetroCard>
        <RetroCardHeader>
          <h2 className="font-semibold text-sm text-retro-magenta">
            Neighborhoods &amp; Areas
          </h2>
        </RetroCardHeader>
        <RetroCardBody>
          {destination.neighborhoods && destination.neighborhoods.length > 0 ? (
            <div className="space-y-4">
              {destination.neighborhoods.map((hood, i) => (
                <div key={i} className="border-l-2 border-retro-cyan/20 pl-3">
                  <h3 className="font-semibold text-sm text-retro-cyan">{hood.name}</h3>
                  <p className="text-text-secondary text-sm mt-1">{hood.description}</p>
                  {(hood.bestFor?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {hood.bestFor!.map((tag, j) => (
                        <span key={j} className="px-2 py-0.5 text-[10px] bg-white/[0.04] text-text-muted rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-muted text-sm">
              No area guide for this destination yet.
            </p>
          )}
        </RetroCardBody>
      </RetroCard>

      <RetroCard>
        <RetroCardHeader>
          <h2 className="font-semibold text-sm text-retro-magenta">
            Getting Around
          </h2>
        </RetroCardHeader>
        <RetroCardBody>
          {destination.gettingAround ? (
            <div>
              <p className="text-text-secondary text-sm mb-4">
                {destination.gettingAround.summary}
              </p>
              <div className="space-y-3">
                {destination.gettingAround.options.map((opt, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-retro-cyan text-xs mt-1">●</span>
                    <div>
                      <span className="font-medium text-sm text-text-primary">{opt.type}</span>
                      {opt.cost && <span className="text-text-muted text-xs ml-2">({opt.cost})</span>}
                      <p className="text-text-muted text-sm">{opt.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-text-muted text-sm">
              No transport guide for this destination yet.
            </p>
          )}
        </RetroCardBody>
      </RetroCard>
    </div>
  );
}

// Costs Tab
function CostsTab({
  destination,
  preferences,
}: {
  destination: ReturnType<typeof useAppStore.getState>['destinations'][0];
  preferences: ReturnType<typeof useAppStore.getState>['preferences'];
}) {
  const hasPrices = destination.avgFlightPrices && destination.avgFlightPrices[preferences.homeAirport];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {hasPrices ? (
        <RetroCard className="lg:col-span-2">
          <RetroCardHeader>
            <h2 className="font-semibold text-sm text-retro-yellow">
              Estimated Flight Prices
            </h2>
          </RetroCardHeader>
          <RetroCardBody>
            <PriceHeatmap
              prices={destination.avgFlightPrices![preferences.homeAirport]!}
              selectedMonth={preferences.travelMonth}
            />
            {Object.keys(destination.avgFlightPrices!).length > 1 && (
              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <AirportPriceComparison
                  prices={destination.avgFlightPrices!}
                  selectedMonth={preferences.travelMonth}
                />
              </div>
            )}
            <p className="text-[10px] text-text-muted mt-3">
              * Prices are estimates based on historical averages. Actual prices may vary.
            </p>
          </RetroCardBody>
        </RetroCard>
      ) : (
        <RetroCard>
          <RetroCardHeader>
            <h2 className="font-semibold text-sm text-retro-yellow">
              Flight Prices
            </h2>
          </RetroCardHeader>
          <RetroCardBody>
            <p className="text-text-muted italic text-sm">
              Flight price data not available for this destination.
            </p>
          </RetroCardBody>
        </RetroCard>
      )}

      <RetroCard>
        <RetroCardHeader>
          <h2 className="font-semibold text-sm text-retro-orange">
            Cost Breakdown
          </h2>
        </RetroCardHeader>
        <RetroCardBody>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Overall Cost Level:</span>
              <span className={cn(
                destination.cost <= 3 ? 'text-retro-green' :
                destination.cost <= 6 ? 'text-retro-orange' : 'text-retro-red'
              )}>
                {'$'.repeat(Math.ceil(destination.cost / 2))} ({destination.cost}/10)
              </span>
            </div>
            {destination.costBreakdown ? (
              <div className="mt-4 space-y-4">
                <div>
                  <h3 className="text-xs text-text-muted uppercase mb-2 font-medium">Accommodation (per night)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                    <div className="p-3 bg-white/[0.03] rounded-lg">
                      <div className="text-retro-green text-xs font-medium">Budget</div>
                      <div className="text-text-primary">{destination.costBreakdown.accommodation.budget}</div>
                    </div>
                    <div className="p-3 bg-white/[0.03] rounded-lg">
                      <div className="text-retro-cyan text-xs font-medium">Mid-range</div>
                      <div className="text-text-primary">{destination.costBreakdown.accommodation.mid}</div>
                    </div>
                    <div className="p-3 bg-white/[0.03] rounded-lg">
                      <div className="text-retro-magenta text-xs font-medium">Luxury</div>
                      <div className="text-text-primary">{destination.costBreakdown.accommodation.luxury}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs text-text-muted uppercase mb-2 font-medium">Meals (per day)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                    <div className="p-3 bg-white/[0.03] rounded-lg">
                      <div className="text-retro-green text-xs font-medium">Budget</div>
                      <div className="text-text-primary">{destination.costBreakdown.meals.budget}</div>
                    </div>
                    <div className="p-3 bg-white/[0.03] rounded-lg">
                      <div className="text-retro-cyan text-xs font-medium">Mid-range</div>
                      <div className="text-text-primary">{destination.costBreakdown.meals.mid}</div>
                    </div>
                    <div className="p-3 bg-white/[0.03] rounded-lg">
                      <div className="text-retro-magenta text-xs font-medium">Luxury</div>
                      <div className="text-text-primary">{destination.costBreakdown.meals.luxury}</div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-text-muted uppercase mb-1 font-medium">Activities</div>
                    <div className="text-text-primary">{destination.costBreakdown.activities}</div>
                  </div>
                  <div>
                    <div className="text-xs text-text-muted uppercase mb-1 font-medium">Local Transport</div>
                    <div className="text-text-primary">{destination.costBreakdown.transport}</div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-text-muted text-sm mt-4">
                No detailed cost breakdown for this destination yet.
              </p>
            )}
          </div>
        </RetroCardBody>
      </RetroCard>

      <RetroCard>
        <RetroCardHeader>
          <h2 className="font-semibold text-sm text-retro-green">
            Budget Tips
          </h2>
        </RetroCardHeader>
        <RetroCardBody>
          {destination.costBreakdown?.tips && destination.costBreakdown.tips.length > 0 ? (
            <ul className="space-y-2">
              {destination.costBreakdown.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-retro-green mt-0.5">✓</span>
                  <span className="text-text-secondary">{tip}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-text-muted text-sm">
              No budget tips for this destination yet.
            </p>
          )}
        </RetroCardBody>
      </RetroCard>
    </div>
  );
}

// Notes Tab
function NotesTab({
  destination,
  travelers,
  setTravelerVisited,
  setTravelerRating,
  note,
  setNote,
}: {
  destination: ReturnType<typeof useAppStore.getState>['destinations'][0];
  travelers: ReturnType<typeof useAppStore.getState>['travelers'];
  setTravelerVisited: (travelerId: string, destinationId: string, visited: boolean) => void;
  setTravelerRating: (travelerId: string, destinationId: string, rating: number) => void;
  note: string;
  setNote: (note: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <RetroCard>
        <RetroCardHeader>
          <h2 className="font-semibold text-sm text-retro-green">
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
                  <div key={traveler.id} className="p-3 border border-white/[0.06] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-text-primary text-sm flex items-center gap-2">
                        {traveler.name}
                        {traveler.isChild && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-retro-orange/15 text-retro-orange rounded-full font-semibold">
                            Child
                          </span>
                        )}
                      </span>
                      <RetroCheckbox
                        checked={data.hasVisited}
                        onChange={(e) =>
                          setTravelerVisited(traveler.id, destination.id, e.target.checked)
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
                        setTravelerRating(traveler.id, destination.id, Number(e.target.value))
                      }
                    />
                  </div>
                );
              })}
            </div>
          )}
        </RetroCardBody>
      </RetroCard>

      <RetroCard>
        <RetroCardHeader>
          <h2 className="font-semibold text-sm text-retro-magenta">
            Personal Notes
          </h2>
        </RetroCardHeader>
        <RetroCardBody>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add your notes about this destination... (restaurants, tips, things to remember)"
            className="w-full h-40 retro-input rounded-lg resize-y text-sm leading-relaxed"
            aria-label={`Personal notes for ${destination.name}`}
          />
          <p className="text-[10px] text-text-muted mt-2">
            Notes are saved automatically to your browser
          </p>
        </RetroCardBody>
      </RetroCard>
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
  const displayValue = inverted ? max - value : value;
  const percentage = (displayValue / max) * 100;

  let color = 'var(--retro-green)';
  if (percentage < 40) color = 'var(--retro-red)';
  else if (percentage < 60) color = 'var(--retro-orange)';
  else if (percentage < 80) color = 'var(--retro-cyan)';

  return (
    <div className="flex items-center gap-3" role="meter" aria-label={label} aria-valuenow={displayValue} aria-valuemin={0} aria-valuemax={max}>
      <span className="text-xs text-text-muted w-24">
        {label}
      </span>
      <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
      <span className="font-mono text-xs text-text-secondary w-8 text-right">
        {value}/{max}
      </span>
    </div>
  );
}
