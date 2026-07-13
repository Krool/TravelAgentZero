'use client';

import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { RetroButton } from '@/components/ui/RetroButton';
import { RetroCard, RetroCardBody, RetroCardHeader } from '@/components/ui/RetroCard';
import { RetroToggle } from '@/components/ui/RetroCheckbox';
import { RetroSlider } from '@/components/ui/RetroSlider';
import { RetroSelect } from '@/components/ui/RetroSelect';
import { AIRPORT_HUBS, AirportCode } from '@/types';
import { useSound } from '@/hooks/useSound';
import { useToast } from '@/hooks/useToast';

export default function SettingsPage() {
  const {
    soundEnabled,
    soundVolume,
    setSoundEnabled,
    setSoundVolume,
    preferences,
    setHomeAirport,
    resetPreferences,
    travelers,
    destinations,
    reduceEffects,
    setReduceEffects,
  } = useAppStore();

  const { play } = useSound();
  const toast = useToast();

  const handleExportData = () => {
    const data = {
      travelers,
      preferences,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'travel-agent-zero-backup.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully!');
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (
          !data ||
          !Array.isArray(data.travelers) ||
          typeof data.preferences !== 'object' ||
          data.preferences === null
        ) {
          toast.error('Invalid backup file format');
          return;
        }
        const validTravelers = data.travelers.every(
          (t: unknown) =>
            typeof t === 'object' &&
            t !== null &&
            typeof (t as Record<string, unknown>).id === 'string' &&
            typeof (t as Record<string, unknown>).name === 'string'
        );
        if (!validTravelers) {
          toast.error('Invalid traveler data in backup file');
          return;
        }
        useAppStore.setState({
          travelers: data.travelers,
          preferences: { ...preferences, ...data.preferences },
        });
        toast.success('Data imported successfully!');
      } catch {
        toast.error('Failed to parse backup file');
      }
    };
    reader.readAsText(file);
  };

  // Confirm-in-place (same pattern as removing a traveler): first click arms
  // the button, second click within 4s clears. No native confirm() dialog.
  const [confirmClear, setConfirmClear] = useState(false);
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (confirmTimer.current) clearTimeout(confirmTimer.current); }, []);

  const handleClearData = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      confirmTimer.current = setTimeout(() => setConfirmClear(false), 4000);
      return;
    }
    if (confirmTimer.current) clearTimeout(confirmTimer.current);
    localStorage.removeItem('travel-agent-zero-storage');
    toast.info('Data cleared. Reloading...');
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="display-title text-3xl text-text-primary mb-1">
            Settings
          </h1>
          <p className="text-text-secondary text-sm">
            Configure your Travel Agent Zero experience
          </p>
        </div>

        {/* Sound Settings */}
        <RetroCard className="mb-6">
          <RetroCardHeader>
            <h2 className="font-semibold text-sm text-retro-magenta">
              Sound Settings
            </h2>
          </RetroCardHeader>
          <RetroCardBody className="space-y-4">
            <RetroToggle
              label="Enable Sound Effects"
              checked={soundEnabled}
              onChange={(e) => {
                setSoundEnabled(e.target.checked);
                if (e.target.checked) {
                  setTimeout(() => play('success'), 50);
                }
              }}
            />

            {soundEnabled && (
              <RetroSlider
                label="Volume"
                min={0}
                max={0.5}
                step={0.05}
                value={soundVolume}
                onChange={(e) => setSoundVolume(Number(e.target.value))}
                showValue
                valuePrefix=""
                valueSuffix=""
              />
            )}

            <div className="pt-2">
              <RetroButton
                variant="ghost"
                size="sm"
                onClick={() => {
                  play('click');
                  setTimeout(() => play('success'), 200);
                }}
                disabled={!soundEnabled}
              >
                Test Sounds
              </RetroButton>
            </div>
          </RetroCardBody>
        </RetroCard>

        {/* Visual Effects */}
        <RetroCard className="mb-6">
          <RetroCardHeader>
            <h2 className="font-semibold text-sm text-retro-magenta">
              Visual Effects
            </h2>
          </RetroCardHeader>
          <RetroCardBody className="space-y-4">
            <RetroToggle
              label="Reduce Visual Effects"
              checked={reduceEffects}
              onChange={(e) => setReduceEffects(e.target.checked)}
            />
            <p className="text-xs text-text-muted">
              Disables scanlines and glow effects for a calmer experience
            </p>
          </RetroCardBody>
        </RetroCard>

        {/* Default Preferences */}
        <RetroCard className="mb-6">
          <RetroCardHeader>
            <h2 className="font-semibold text-sm text-retro-cyan">
              Default Settings
            </h2>
          </RetroCardHeader>
          <RetroCardBody className="space-y-4">
            <RetroSelect
              label="Default Home Airport"
              value={preferences.homeAirport}
              onChange={(e) => setHomeAirport(e.target.value as AirportCode)}
            >
              {Object.entries(AIRPORT_HUBS).map(([code, info]) => (
                <option key={code} value={code}>
                  {info.city} ({code}) - {info.region}
                </option>
              ))}
            </RetroSelect>

            <div className="pt-2">
              <RetroButton variant="ghost" size="sm" onClick={resetPreferences}>
                Reset All Preferences
              </RetroButton>
            </div>
          </RetroCardBody>
        </RetroCard>

        {/* Data Management */}
        <RetroCard className="mb-6">
          <RetroCardHeader>
            <h2 className="font-semibold text-sm text-retro-orange">
              Data Management
            </h2>
          </RetroCardHeader>
          <RetroCardBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-text-secondary mb-3">
                  Export your traveler data and preferences
                </p>
                <RetroButton onClick={handleExportData}>Export Data</RetroButton>
              </div>

              <div>
                <p className="text-sm text-text-secondary mb-3">
                  Import data from a backup file
                </p>
                <label className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg border border-retro-cyan/60 text-retro-cyan bg-retro-cyan/[0.06] hover:bg-retro-cyan/15 transition-all cursor-pointer" role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') e.currentTarget.click(); }}>
                  Import Data
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                    aria-label="Import data from JSON backup file"
                  />
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.06]">
              <p className="text-sm text-text-muted mb-3">
                Clear all local data (cannot be undone)
              </p>
              <RetroButton variant="danger" onClick={handleClearData}>
                {confirmClear ? 'Click again to confirm' : 'Clear All Data'}
              </RetroButton>
            </div>
          </RetroCardBody>
        </RetroCard>

        {/* Stats */}
        <RetroCard className="mb-6">
          <RetroCardHeader>
            <h2 className="font-semibold text-sm text-retro-green">
              Statistics
            </h2>
          </RetroCardHeader>
          <RetroCardBody>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <StatBox label="Destinations" value={destinations.length} />
              <StatBox label="Travelers" value={travelers.length} />
              <StatBox
                label="Total Visits"
                value={travelers.reduce(
                  (acc, t) =>
                    acc +
                    Object.values(t.destinations).filter((d) => d.hasVisited).length,
                  0
                )}
              />
            </div>
          </RetroCardBody>
        </RetroCard>

        {/* About */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-retro-cyan to-retro-blue flex items-center justify-center">
              <span className="text-bg-deep font-bold text-xs">T</span>
            </div>
            <span className="font-bold text-base">
              <span className="text-text-primary">Travel Agent </span>
              <span className="gradient-text">Zero</span>
            </span>
          </div>
          <p className="text-xs text-text-muted">
            Data stored locally in your browser
          </p>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.06] text-center">
      <div className="font-bold text-2xl gradient-text">{value}</div>
      <div className="text-xs text-text-muted uppercase mt-1 font-medium">
        {label}
      </div>
    </div>
  );
}
