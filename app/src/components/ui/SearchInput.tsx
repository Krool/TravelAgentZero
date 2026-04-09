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
        if (
          e.key === shortcutKey &&
          document.activeElement?.tagName !== 'INPUT' &&
          document.activeElement?.tagName !== 'TEXTAREA'
        ) {
          e.preventDefault();
          combinedRef.current?.focus();
        }
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
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
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
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {hasValue ? (
            <button
              type="button"
              onClick={onClear}
              className="text-text-muted hover:text-text-primary transition-colors p-1 rounded"
              aria-label="Clear search"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
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
