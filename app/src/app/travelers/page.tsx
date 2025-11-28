'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { RetroButton } from '@/components/ui/RetroButton';
import { RetroCard, RetroCardBody, RetroCardHeader } from '@/components/ui/RetroCard';
import { RetroCheckbox, RetroToggle } from '@/components/ui/RetroCheckbox';
import { SearchInput } from '@/components/ui/SearchInput';
import { cn } from '@/lib/utils';

export default function TravelersPage() {
  const {
    travelers,
    destinations,
    preferences,
    addTraveler,
    removeTraveler,
    toggleTraveler,
    setTravelerVisited,
    setTravelerIsChild,
  } = useAppStore();

  const [newTravelerName, setNewTravelerName] = useState('');
  const [newTravelerIsChild, setNewTravelerIsChild] = useState(false);
  const [expandedTraveler, setExpandedTraveler] = useState<string | null>(null);
  const [destinationSearch, setDestinationSearch] = useState('');

  const handleAddTraveler = () => {
    if (newTravelerName.trim()) {
      addTraveler(newTravelerName.trim(), newTravelerIsChild);
      setNewTravelerName('');
      setNewTravelerIsChild(false);
    }
  };

  // Filter destinations based on search
  const filteredDestinations = useMemo(() => {
    if (!destinationSearch.trim()) return destinations;
    const query = destinationSearch.toLowerCase();
    return destinations.filter(dest =>
      dest.name.toLowerCase().includes(query) ||
      dest.countries.some(c => c.toLowerCase().includes(query)) ||
      dest.region?.toLowerCase().includes(query)
    );
  }, [destinations, destinationSearch]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-pixel text-lg text-retro-cyan glow-cyan mb-2">
            TRAVELERS
          </h1>
          <p className="font-mono text-text-secondary">
            Manage travelers and track which destinations everyone has visited.
            Mark travelers as children to prioritize child-friendly destinations.
          </p>
        </div>

        {/* Add new traveler */}
        <RetroCard className="mb-6">
          <RetroCardHeader>
            <h2 className="font-mono font-bold text-sm text-retro-magenta uppercase">
              Add New Traveler
            </h2>
          </RetroCardHeader>
          <RetroCardBody>
            <div className="space-y-3">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newTravelerName}
                  onChange={(e) => setNewTravelerName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTraveler()}
                  placeholder="Enter traveler name..."
                  className="flex-1 retro-input"
                />
                <RetroButton onClick={handleAddTraveler} disabled={!newTravelerName.trim()}>
                  Add
                </RetroButton>
              </div>
              <div className="flex items-center gap-3">
                <RetroToggle
                  label="This traveler is a child (under 18)"
                  checked={newTravelerIsChild}
                  onChange={(e) => setNewTravelerIsChild(e.target.checked)}
                />
              </div>
            </div>
          </RetroCardBody>
        </RetroCard>

        {/* Traveler list */}
        {travelers.length === 0 ? (
          <RetroCard className="p-8 text-center">
            <div className="font-mono font-bold text-retro-magenta text-xl mb-2">
              NO TRAVELERS YET
            </div>
            <p className="font-mono text-text-muted">
              Add travelers above to start tracking visits
            </p>
          </RetroCard>
        ) : (
          <div className="space-y-4">
            {travelers.map((traveler) => {
              const visitedCount = Object.values(traveler.destinations).filter(
                (d) => d.hasVisited
              ).length;
              const totalCount = destinations.length;
              const isSelected = preferences.selectedTravelers.includes(traveler.id);
              const isExpanded = expandedTraveler === traveler.id;

              return (
                <RetroCard key={traveler.id} variant={isSelected ? 'highlight' : 'default'}>
                  <RetroCardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <RetroCheckbox
                          checked={isSelected}
                          onChange={() => toggleTraveler(traveler.id)}
                          label=""
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-mono font-semibold text-lg text-text-primary">
                              {traveler.name}
                            </h3>
                            {traveler.isChild && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-retro-orange/20 text-retro-orange rounded uppercase font-bold">
                                Child
                              </span>
                            )}
                          </div>
                          <p className="font-mono text-xs text-text-muted">
                            {visitedCount} / {totalCount} destinations visited
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <RetroToggle
                          label="Child"
                          checked={traveler.isChild}
                          onChange={(e) => setTravelerIsChild(traveler.id, e.target.checked)}
                        />
                        <RetroButton
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setExpandedTraveler(isExpanded ? null : traveler.id)
                          }
                        >
                          {isExpanded ? 'Collapse' : 'Edit Visits'}
                        </RetroButton>
                        <RetroButton
                          variant="danger"
                          size="sm"
                          onClick={() => removeTraveler(traveler.id)}
                        >
                          Remove
                        </RetroButton>
                      </div>
                    </div>
                  </RetroCardHeader>

                  {isExpanded && (
                    <RetroCardBody>
                      {/* Progress bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs font-mono text-text-muted mb-1">
                          <span>Travel Progress</span>
                          <span>{Math.round((visitedCount / totalCount) * 100)}%</span>
                        </div>
                        <div className="h-2 bg-bg-dark rounded overflow-hidden">
                          <div
                            className="h-full bg-retro-green"
                            style={{
                              width: `${(visitedCount / totalCount) * 100}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Search destinations */}
                      <div className="mb-4">
                        <SearchInput
                          value={destinationSearch}
                          onChange={(e) => setDestinationSearch(e.target.value)}
                          onClear={() => setDestinationSearch('')}
                          placeholder="Search destinations..."
                        />
                      </div>

                      {/* Destination checklist */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                        {filteredDestinations.map((dest) => {
                          const data = traveler.destinations[dest.id] || {
                            hasVisited: false,
                            rating: 5,
                          };
                          return (
                            <div
                              key={dest.id}
                              className={cn(
                                'p-2 rounded border text-sm',
                                data.hasVisited
                                  ? 'border-retro-green/30 bg-retro-green/5'
                                  : 'border-bg-hover'
                              )}
                            >
                              <RetroCheckbox
                                checked={data.hasVisited}
                                onChange={(e) =>
                                  setTravelerVisited(
                                    traveler.id,
                                    dest.id,
                                    e.target.checked
                                  )
                                }
                                label={dest.name}
                              />
                            </div>
                          );
                        })}
                      </div>
                      {filteredDestinations.length === 0 && destinationSearch && (
                        <p className="text-text-muted text-sm font-mono text-center py-4">
                          No destinations match &quot;{destinationSearch}&quot;
                        </p>
                      )}
                    </RetroCardBody>
                  )}
                </RetroCard>
              );
            })}
          </div>
        )}

        {/* Help text */}
        <div className="mt-6 p-4 border border-retro-cyan/20 rounded">
          <h3 className="font-mono font-bold text-xs text-retro-cyan uppercase mb-2">
            How It Works
          </h3>
          <ul className="font-mono text-sm text-text-muted space-y-1">
            <li>Check the checkbox to include a traveler in destination scoring</li>
            <li>Toggle &quot;Child&quot; to mark travelers under 18 - child-friendly destinations will be prioritized automatically</li>
            <li>Click &quot;Edit Visits&quot; to mark which destinations each traveler has visited</li>
            <li>Use the search bar to quickly find destinations when editing visits</li>
            <li>Visited destinations will be filtered out when &quot;New Places Only&quot; is enabled</li>
            <li>All data is saved locally in your browser</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
