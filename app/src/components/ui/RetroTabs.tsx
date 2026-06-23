'use client';

import { useState, useEffect } from 'react';
import { useSound } from '@/hooks/useSound';
import { cn } from '@/lib/utils';

export interface Tab {
  id: string;
  label: string;
  icon?: string;
}

interface RetroTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function RetroTabs({ tabs, activeTab, onTabChange, className }: RetroTabsProps) {
  const { play } = useSound();

  const handleTabClick = (tabId: string) => {
    if (tabId !== activeTab) {
      play('click');
      onTabChange(tabId);
    }
  };

  return (
    <div role="tablist" aria-label="Destination details" className={cn('flex bg-white/[0.03] rounded-xl p-1 overflow-x-auto', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabClick(tab.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
            activeTab === tab.id
              ? 'text-retro-cyan bg-retro-cyan/10 shadow-sm'
              : 'text-text-muted hover:text-text-secondary'
          )}
          role="tab"
          aria-selected={activeTab === tab.id}
        >
          {tab.icon && <span className="text-sm">{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// Hook to sync tab state with URL hash
export function useTabHash(defaultTab: string) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      setActiveTab(hash);
    }

    const handleHashChange = () => {
      const newHash = window.location.hash.slice(1);
      if (newHash) {
        setActiveTab(newHash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const setTab = (tabId: string) => {
    setActiveTab(tabId);
    window.history.replaceState(null, '', `#${tabId}`);
  };

  return [activeTab, setTab] as const;
}
