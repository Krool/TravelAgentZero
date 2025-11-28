'use client';

import { useAppStore } from '@/lib/store';
import { RetroButton } from '@/components/ui/RetroButton';
import { RetroCard, RetroCardBody, RetroCardHeader } from '@/components/ui/RetroCard';
import { RetroToggle } from '@/components/ui/RetroCheckbox';
import { RetroSlider } from '@/components/ui/RetroSlider';
import { RetroSelect } from '@/components/ui/RetroSelect';
import { AIRPORT_HUBS, AirportCode } from '@/types';
import { useSound } from '@/hooks/useSound';

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
  } = useAppStore();

  const { play } = useSound();

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
    play('success');
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        // Validate and import data
        if (data.travelers && data.preferences) {
          useAppStore.setState({
            travelers: data.travelers,
            preferences: data.preferences,
          });
          play('success');
          alert('Data imported successfully!');
        } else {
          play('error');
          alert('Invalid backup file format');
        }
      } catch {
        play('error');
        alert('Failed to parse backup file');
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      localStorage.removeItem('travel-agent-zero-storage');
      window.location.reload();
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-pixel text-lg text-retro-cyan glow-cyan mb-2">
            SETTINGS
          </h1>
          <p className="font-mono text-text-secondary">
            Configure your Travel Agent Zero experience
          </p>
        </div>

        {/* Sound Settings */}
        <RetroCard className="mb-6">
          <RetroCardHeader>
            <h2 className="font-mono font-bold text-sm text-retro-magenta uppercase">
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

        {/* Default Preferences */}
        <RetroCard className="mb-6">
          <RetroCardHeader>
            <h2 className="font-mono font-bold text-sm text-retro-cyan uppercase">
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
            <h2 className="font-mono font-bold text-sm text-retro-orange uppercase">
              Data Management
            </h2>
          </RetroCardHeader>
          <RetroCardBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="font-mono text-sm text-text-secondary mb-2">
                  Export your traveler data and preferences
                </p>
                <RetroButton onClick={handleExportData}>Export Data</RetroButton>
              </div>

              <div>
                <p className="font-mono text-sm text-text-secondary mb-2">
                  Import data from a backup file
                </p>
                <label className="retro-btn cursor-pointer inline-block">
                  Import Data
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-retro-red/20">
              <p className="font-mono text-sm text-text-muted mb-2">
                Clear all local data (cannot be undone)
              </p>
              <RetroButton variant="danger" onClick={handleClearData}>
                Clear All Data
              </RetroButton>
            </div>
          </RetroCardBody>
        </RetroCard>

        {/* Stats */}
        <RetroCard>
          <RetroCardHeader>
            <h2 className="font-mono font-bold text-sm text-retro-green uppercase">
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
          <div className="font-pixel text-base mb-2">
            <span className="text-retro-cyan">TRAVEL AGENT</span>
            <span className="text-retro-magenta ml-2">ZERO</span>
          </div>
          <p className="font-mono text-xs text-text-muted">
            A retro-futuristic travel planning companion
          </p>
          <p className="font-mono text-[10px] text-text-muted mt-1">
            Data stored locally in your browser
          </p>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-4 bg-bg-dark rounded border border-retro-cyan/20 text-center">
      <div className="font-mono font-bold text-2xl text-retro-cyan">{value}</div>
      <div className="font-mono text-xs text-text-muted uppercase mt-1">
        {label}
      </div>
    </div>
  );
}
