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
    <div className={cn('flex border-b border-retro-cyan/30 overflow-x-auto', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabClick(tab.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-3 font-mono text-xs uppercase tracking-wider whitespace-nowrap transition-all relative',
            activeTab === tab.id
              ? 'text-retro-cyan border-b-2 border-retro-cyan bg-retro-cyan/5'
              : 'text-text-muted hover:text-text-secondary border-b-2 border-transparent'
          )}
          role="tab"
          aria-selected={activeTab === tab.id}
        >
          {tab.icon && <span>{tab.icon}</span>}
          {tab.label}
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-retro-cyan shadow-[0_0_8px_rgba(0,255,242,0.8)]" />
          )}
        </button>
      ))}
    </div>
  );
}

// Hook to sync tab state with URL hash
export function useTabHash(defaultTab: string) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    // Check hash on mount
    const hash = window.location.hash.slice(1);
    if (hash) {
      setActiveTab(hash);
    }

    // Listen for hash changes
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
    // Update URL hash without scrolling
    window.history.replaceState(null, '', `#${tabId}`);
  };

  return [activeTab, setTab] as const;
}
