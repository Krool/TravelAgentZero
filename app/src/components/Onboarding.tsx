'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { RetroButton } from '@/components/ui/RetroButton';
import { RetroCard } from '@/components/ui/RetroCard';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { assetPath, cn } from '@/lib/utils';

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Travel Agent Zero',
    content: 'A destination planner that scores every trip against your preferences. A short tour of the main features follows.',
    image: 'globe',
  },
  {
    id: 'scoring',
    title: 'Scoring',
    content: 'Each destination gets a score from your travel month, budget, flight time, and safety settings. Higher scores are closer matches.',
    image: 'compass',
  },
  {
    id: 'filters',
    title: 'Filters',
    content: 'Narrow the list by duration, climate, trip type, and region. On mobile, open them with the Filters button.',
    image: 'map',
  },
  {
    id: 'travelers',
    title: 'Travelers',
    content: 'Add the people you travel with to record who has been where. Turn on "New Places Only" to hide destinations your group has already visited.',
    image: 'suitcase',
  },
  {
    id: 'favorites',
    title: 'Favorites and compare',
    content: 'Star a destination to save it. Add up to three to the compare panel to view them side by side.',
    image: 'passport',
  },
  {
    id: 'shortcuts',
    title: 'Keyboard shortcuts',
    content: 'Press "/" to search, "G" for grid view, "L" for list view, "F" for filters. Escape closes panels.',
    image: 'rocket',
  },
];

export function Onboarding() {
  const { hasSeenOnboarding, setHasSeenOnboarding } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasSeenOnboarding) {
        setIsVisible(true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [hasSeenOnboarding]);

  const focusTrapRef = useFocusTrap(isVisible && !hasSeenOnboarding);

  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  const handleSkip = () => {
    setHasSeenOnboarding(true);
    setIsVisible(false);
  };

  const handleNext = () => {
    if (isLastStep) {
      setHasSeenOnboarding(true);
      setIsVisible(false);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  useEffect(() => {
    if (!isVisible || hasSeenOnboarding) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleSkip();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, hasSeenOnboarding]);

  if (!isVisible || hasSeenOnboarding) {
    return null;
  }

  return (
    <div
      ref={focusTrapRef}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleSkip();
      }}
    >
      <RetroCard className="max-w-md w-full p-8">
        {/* Progress indicator */}
        <div className="flex gap-1 mb-8">
          {ONBOARDING_STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full ${
                index <= currentStep ? 'bg-retro-cyan' : 'bg-white/[0.08]'
              }`}
            />
          ))}
        </div>

        {/* Step content - every step is stacked in the same grid cell so the
            card keeps the height of the tallest step instead of resizing */}
        <div className="grid mb-6">
          {ONBOARDING_STEPS.map((s, index) => (
            <div
              key={s.id}
              className={cn(
                'col-start-1 row-start-1 text-center',
                index !== currentStep && 'invisible'
              )}
              aria-hidden={index !== currentStep}
            >
              <img
                src={assetPath(`/icons/travel/${s.image}.png`)}
                alt=""
                width={64}
                height={64}
                className="w-16 h-16 mx-auto mb-4"
                aria-hidden="true"
              />
              <div className="font-mono text-xs text-retro-cyan tracking-widest mb-4">
                {String(index + 1).padStart(2, '0')} / {String(ONBOARDING_STEPS.length).padStart(2, '0')}
              </div>
              <h2
                id={index === currentStep ? 'onboarding-title' : undefined}
                className="font-bold text-lg text-text-primary mb-3"
              >
                {s.title}
              </h2>
              <p className="text-text-secondary text-sm leading-relaxed">
                {s.content}
              </p>
            </div>
          ))}
        </div>

        {/* Navigation - Back and Skip stay in the layout when inactive so the
            row width never changes */}
        <div className="flex gap-3 justify-center">
          <RetroButton
            variant="ghost"
            size="sm"
            onClick={handlePrev}
            className={currentStep === 0 ? 'invisible' : undefined}
            disabled={currentStep === 0}
            aria-hidden={currentStep === 0}
          >
            Back
          </RetroButton>
          <RetroButton onClick={handleNext}>
            {isLastStep ? 'Done' : 'Next'}
          </RetroButton>
          <RetroButton
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className={isLastStep ? 'invisible' : undefined}
            disabled={isLastStep}
            aria-hidden={isLastStep}
          >
            Skip
          </RetroButton>
        </div>
      </RetroCard>
    </div>
  );
}

export function HelpModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const helpFocusTrapRef = useFocusTrap(isOpen);

  if (!isOpen) return null;

  return (
    <div
      ref={helpFocusTrapRef}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <RetroCard className="max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 id="help-title" className="font-bold text-lg text-text-primary">
            How It Works
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-white/[0.04]"
            aria-label="Close help"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-5">
          {ONBOARDING_STEPS.map((step) => (
            <div key={step.id} className="flex gap-4">
              <img
                src={assetPath(`/icons/travel/${step.image}.png`)}
                alt=""
                width={32}
                height={32}
                className="w-8 h-8 shrink-0"
                aria-hidden="true"
              />
              <div>
                <h3 className="font-semibold text-text-primary mb-1 text-sm">
                  {step.title}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  {step.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-white/[0.06]">
          <h3 className="font-semibold text-sm text-retro-cyan mb-3">
            Keyboard Shortcuts
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Search</span>
              <span className="kbd">/</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Grid View</span>
              <span className="kbd">G</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">List View</span>
              <span className="kbd">L</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Filters</span>
              <span className="kbd">F</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Close</span>
              <span className="kbd">Esc</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <RetroButton onClick={onClose}>Close</RetroButton>
        </div>
      </RetroCard>
    </div>
  );
}
