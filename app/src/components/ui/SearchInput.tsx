'use client';

import { useRef, useEffect, forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onClear?: () => void;
  shortcutKey?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onClear, shortcutKey = '/', ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const combinedRef = (ref as React.RefObject<HTMLInputElement>) || inputRef;

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Focus search on "/" key (unless already in an input)
        if (
          e.key === shortcutKey &&
          document.activeElement?.tagName !== 'INPUT' &&
          document.activeElement?.tagName !== 'TEXTAREA'
        ) {
          e.preventDefault();
          combinedRef.current?.focus();
        }
        // Clear and blur on Escape
        if (e.key === 'Escape' && document.activeElement === combinedRef.current) {
          onClear?.();
          combinedRef.current?.blur();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcutKey, onClear, combinedRef]);

    const hasValue = value && String(value).length > 0;

    return (
      <div className="search-input-wrapper w-full">
        <span className="search-icon" aria-hidden="true">
          🔍
        </span>
        <input
          ref={combinedRef}
          type="search"
          value={value}
          className={cn(
            'retro-input w-full pr-16',
            className
          )}
          aria-label="Search destinations"
          {...props}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {hasValue ? (
            <button
              type="button"
              onClick={onClear}
              className="text-text-muted hover:text-retro-cyan transition-colors p-1"
              aria-label="Clear search"
            >
              ✕
            </button>
          ) : (
            <span className="kbd" aria-hidden="true">/</span>
          )}
        </div>
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
