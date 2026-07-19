'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { useSound } from '@/hooks/useSound';
import { RetroButton } from '@/components/ui/RetroButton';
import { cn } from '@/lib/utils';

export function Header() {
  const { soundEnabled, setSoundEnabled, soundVolume, setSoundVolume } = useAppStore();
  const { play } = useSound();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close mobile menu on route change. Derived during render (rather than a
  // useEffect) so the close happens in the same commit as the navigation instead
  // of triggering a second, cascading render.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  // Close mobile menu on Escape key
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Trap focus inside mobile menu when open + lock body scroll
  useEffect(() => {
    if (!mobileMenuOpen || !menuRef.current) return;
    document.body.style.overflow = 'hidden';
    const focusable = menuRef.current.querySelectorAll<HTMLElement>(
      'a, button, input, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length > 0) focusable[0].focus();
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) {
      setTimeout(() => play('success'), 50);
    }
  };

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  return (
    <header className="border-b border-white/[0.06] bg-bg-deep/70 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-retro-cyan to-retro-blue flex items-center justify-center">
              <span className="text-bg-deep font-bold text-sm">T</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="display-title text-lg text-text-primary">
                Travel Agent
              </span>
              <span className="display-title text-lg gradient-text">
                Zero
              </span>
            </div>
          </Link>

          {/* Nav - Desktop */}
          <nav className="hidden md:flex items-center gap-1 bg-white/[0.04] rounded-full px-1.5 py-1">
            <NavLink href="/" active={pathname === '/'}>Destinations</NavLink>
            <NavLink href="/travelers" active={pathname === '/travelers'}>Travelers</NavLink>
            <NavLink href="/settings" active={pathname === '/settings'}>Settings</NavLink>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Sound toggle */}
            <button
              onClick={toggleSound}
              className={cn(
                'p-2 rounded-lg transition-all',
                soundEnabled
                  ? 'text-retro-cyan hover:bg-retro-cyan/10'
                  : 'text-text-muted hover:text-text-secondary hover:bg-white/[0.04]'
              )}
              title={soundEnabled ? 'Sound On' : 'Sound Off'}
              aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
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
                aria-label="Volume"
                className="w-16 h-1 bg-bg-dark rounded appearance-none cursor-pointer hidden sm:block
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-retro-cyan"
              />
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-all"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
          {/* Drawer */}
          <div
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="fixed top-0 right-0 h-full w-72 bg-bg-card border-l border-white/[0.06] z-50 md:hidden animate-slide-in-left shadow-2xl"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
              <span className="font-semibold text-sm text-text-secondary uppercase tracking-wider">Menu</span>
              <button
                onClick={closeMobileMenu}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.04] transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="p-4 space-y-1">
              <MobileNavLink href="/" active={pathname === '/'} onClick={closeMobileMenu}>
                Destinations
              </MobileNavLink>
              <MobileNavLink href="/travelers" active={pathname === '/travelers'} onClick={closeMobileMenu}>
                Travelers
              </MobileNavLink>
              <MobileNavLink href="/settings" active={pathname === '/settings'} onClick={closeMobileMenu}>
                Settings
              </MobileNavLink>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}

function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active?: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'px-4 py-1.5 rounded-full text-sm font-medium transition-all',
        active
          ? 'bg-retro-cyan/15 text-retro-cyan'
          : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.04]'
      )}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, children, active, onClick }: { href: string; children: React.ReactNode; active?: boolean; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'block px-4 py-3 rounded-lg text-sm font-medium transition-all',
        active
          ? 'text-retro-cyan bg-retro-cyan/10'
          : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.04]'
      )}
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
