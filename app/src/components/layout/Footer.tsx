'use client';

export function Footer() {
  return (
    <footer className="border-t border-retro-cyan/20 bg-bg-deep/80 backdrop-blur-sm mt-8">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center gap-3">
          <p className="text-text-muted text-xs font-mono text-center">
            Travel scoring is based on your preferences. Always verify visa requirements and safety advisories before booking.
          </p>
          <p className="text-text-secondary text-sm font-mono">
            Part of{' '}
            <a
              href="https://krool.github.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-retro-cyan hover:text-retro-magenta transition-colors inline-flex items-center gap-1 glow-cyan-subtle"
            >
              Krool World
              <svg
                className="w-3 h-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M7 17L17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
