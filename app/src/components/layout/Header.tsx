'use client';

import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { useSound } from '@/hooks/useSound';
import { RetroButton } from '@/components/ui/RetroButton';
import { cn } from '@/lib/utils';

export function Header() {
  const { soundEnabled, setSoundEnabled, soundVolume, setSoundVolume } = useAppStore();
  const { play } = useSound();

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) {
      // Will play after state updates
      setTimeout(() => play('success'), 50);
    }
  };

  return (
    <header className="border-b border-retro-cyan/20 bg-bg-dark/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <span className="font-pixel text-lg text-retro-cyan glow-cyan tracking-wider">
                TRAVEL AGENT
              </span>
              <span className="font-pixel text-lg text-retro-magenta glow-magenta ml-2">
                ZERO
              </span>
            </div>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-4">
            <NavLink href="/">Destinations</NavLink>
            <NavLink href="/travelers">Travelers</NavLink>
            <NavLink href="/settings">Settings</NavLink>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Sound toggle */}
            <button
              onClick={toggleSound}
              className={cn(
                'p-2 rounded border transition-all',
                soundEnabled
                  ? 'border-retro-cyan text-retro-cyan hover:bg-retro-cyan/10'
                  : 'border-text-muted text-text-muted hover:border-retro-cyan'
              )}
              title={soundEnabled ? 'Sound On' : 'Sound Off'}
            >
              {soundEnabled ? (
                <SoundOnIcon className="w-4 h-4" />
              ) : (
                <SoundOffIcon className="w-4 h-4" />
              )}
            </button>

            {/* Volume slider (visible when sound enabled) */}
            {soundEnabled && (
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={soundVolume}
                onChange={(e) => setSoundVolume(Number(e.target.value))}
                className="w-16 h-1 bg-bg-dark rounded appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-retro-cyan"
              />
            )}

            {/* Mobile menu button */}
            <RetroButton
              variant="ghost"
              size="sm"
              className="md:hidden"
            >
              ☰
            </RetroButton>
          </div>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="font-mono text-sm font-medium text-text-secondary hover:text-retro-cyan transition-colors uppercase tracking-wider"
    >
      {children}
    </Link>
  );
}

function SoundOnIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  );
}

function SoundOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
    </svg>
  );
}
