'use client';

import { useAppStore } from '@/lib/store';
import { RetroSelect } from '@/components/ui/RetroSelect';
import { RetroCheckbox, RetroToggle } from '@/components/ui/RetroCheckbox';
import { RetroSlider, RetroDualSlider } from '@/components/ui/RetroSlider';
import { RetroButton } from '@/components/ui/RetroButton';
import {
  MONTH_NAMES,
  AIRPORT_HUBS,
  Month,
  AirportCode,
  Climate,
  TripType,
  BudgetSensitivity,
  BUDGET_OPTIONS,
  DESTINATION_REGIONS,
  DestinationRegion,
  FLIGHT_TIME_OPTIONS,
  PASSPORTS,
  PassportCode,
  hasChildTraveler,
} from '@/types';
import { cn } from '@/lib/utils';

interface FilterPanelProps {
  className?: string;
}

export function FilterPanel({ className }: FilterPanelProps) {
  const {
    preferences,
    travelers,
    setPreferences,
    setTravelMonth,
    setHomeAirport,
    setRegionPreference,
    setBudgetSensitivity,
    setMaxFlightTime,
    setClimatePreference,
    setTripTypePreference,
    toggleTraveler,
    resetPreferences,
  } = useAppStore();

  const hasChildren = hasChildTraveler(travelers, preferences.selectedTravelers);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section: When */}
      <FilterSection title="When">
        <RetroSelect
          label="Travel Month"
          value={preferences.travelMonth}
          onChange={(e) => setTravelMonth(e.target.value as Month)}
        >
          {Object.entries(MONTH_NAMES).map(([key, name]) => (
            <option key={key} value={key}>
              {name}
            </option>
          ))}
        </RetroSelect>

        <RetroDualSlider
          label="Trip Duration"
          min={3}
          max={21}
          minValue={preferences.durationMin}
          maxValue={preferences.durationMax}
          onMinChange={(v) => setPreferences({ durationMin: v })}
          onMaxChange={(v) => setPreferences({ durationMax: v })}
          valueSuffix=" days"
        />
      </FilterSection>

      {/* Section: Travelers */}
      <FilterSection title="Travelers">
        <div className="space-y-2">
          {travelers.length > 0 ? (
            <>
              {travelers.map((traveler) => (
                <div key={traveler.id} className="flex items-center gap-2">
                  <RetroCheckbox
                    label={
                      <span className="flex items-center gap-1.5">
                        {traveler.name}
                        {traveler.isChild && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-retro-orange/15 text-retro-orange rounded-full font-semibold">
                            Child
                          </span>
                        )}
                      </span>
                    }
                    checked={preferences.selectedTravelers.includes(traveler.id)}
                    onChange={() => toggleTraveler(traveler.id)}
                  />
                </div>
              ))}
              {preferences.selectedTravelers.length === 0 && (
                <p className="text-xs text-text-muted mt-2">
                  Tick who is going to hide places they have visited and use their ratings.
                </p>
              )}
              {hasChildren && (
                <p className="text-xs text-retro-orange mt-2 flex items-center gap-1">
                  <span>*</span> Child-friendly destinations prioritized
                </p>
              )}
            </>
          ) : (
            <p className="text-text-muted text-xs italic">
              No travelers added yet. Add travelers to track visits.
            </p>
          )}
        </div>
      </FilterSection>

      {/* Section: Origin & Distance */}
      <FilterSection title="Origin">
        <RetroSelect
          label="Home Airport"
          value={preferences.homeAirport}
          onChange={(e) => setHomeAirport(e.target.value as AirportCode)}
        >
          {Object.entries(AIRPORT_HUBS).map(([code, info]) => (
            <option key={code} value={code}>
              {info.city} ({code})
            </option>
          ))}
        </RetroSelect>

        <RetroSelect
          label="Passport"
          value={preferences.passport}
          onChange={(e) => setPreferences({ passport: e.target.value as PassportCode })}
        >
          {Object.entries(PASSPORTS).map(([code, name]) => (
            <option key={code} value={code}>{name}</option>
          ))}
        </RetroSelect>

        <RetroSelect
          label="Max Flight Time"
          value={String(preferences.maxFlightTime || 0)}
          onChange={(e) => setMaxFlightTime(Number(e.target.value))}
        >
          {FLIGHT_TIME_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </RetroSelect>
      </FilterSection>

      {/* Section: Destination */}
      <FilterSection title="Destination">
        <RetroSelect
          label="Region"
          value={preferences.regionPreference || 'Any'}
          onChange={(e) =>
            setRegionPreference(e.target.value as DestinationRegion | 'Any')
          }
        >
          <option value="Any">Any Region</option>
          {DESTINATION_REGIONS.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </RetroSelect>

        <RetroSelect
          label="Climate"
          value={preferences.temperaturePreference}
          onChange={(e) => setClimatePreference(e.target.value as Climate | 'Any')}
        >
          <option value="Any">Any Climate</option>
          <option value="Hot">Hot / Tropical</option>
          <option value="Cold">Cold / Alpine</option>
          <option value="Temperate">Temperate</option>
          <option value="Mix">Mixed</option>
        </RetroSelect>

        <RetroSelect
          label="Trip Style"
          value={preferences.typePreference}
          onChange={(e) => setTripTypePreference(e.target.value as TripType | 'Any')}
        >
          <option value="Any">Any Style</option>
          <option value="Urban">Urban / City</option>
          <option value="Nature">Nature / Outdoors</option>
          <option value="Mix">Mix of Both</option>
        </RetroSelect>
      </FilterSection>

      {/* Section: Budget & Safety */}
      <FilterSection title="Budget & Safety">
        <RetroSelect
          label="Budget"
          value={preferences.budgetSensitivity || 'moderate'}
          onChange={(e) =>
            setBudgetSensitivity(e.target.value as BudgetSensitivity)
          }
        >
          {Object.entries(BUDGET_OPTIONS).map(([key, opt]) => (
            <option key={key} value={key}>
              {opt.label} - {opt.description}
            </option>
          ))}
        </RetroSelect>

        <RetroSlider
          label="Max Risk Level"
          min={1}
          max={10}
          value={preferences.maxDanger}
          onChange={(e) =>
            setPreferences({ maxDanger: Number(e.target.value) })
          }
        />
        <p className="text-xs text-text-muted -mt-1">
          1 = very safe, 10 = high risk. Destinations above this are hidden.
        </p>
      </FilterSection>

      {/* Section: Filters */}
      <FilterSection title="Preferences">
        <RetroToggle
          label="New Places Only"
          checked={preferences.preferNewPlaces}
          onChange={(e) =>
            setPreferences({ preferNewPlaces: e.target.checked })
          }
        />

        <RetroToggle
          label="Visa-Free Only"
          checked={preferences.visaFreeOnly}
          onChange={(e) =>
            setPreferences({ visaFreeOnly: e.target.checked })
          }
        />
      </FilterSection>

      {/* Reset button */}
      <RetroButton
        variant="ghost"
        size="sm"
        className="w-full"
        onClick={resetPreferences}
      >
        Reset Filters
      </RetroButton>
    </div>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
