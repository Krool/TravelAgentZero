'use client';

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-bg-deep/80 backdrop-blur-sm mt-8">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-retro-cyan to-retro-blue flex items-center justify-center">
              <span className="text-bg-deep font-bold text-xs">T</span>
            </div>
            <span className="font-semibold text-sm text-text-secondary">
              Travel Agent <span className="gradient-text">Zero</span>
            </span>
          </div>

          <p className="text-text-muted text-xs text-center max-w-md leading-relaxed">
            Travel scoring is based on your preferences. Always verify visa requirements and safety advisories before booking.
          </p>

          <div className="h-px w-16 bg-gradient-to-r from-transparent via-retro-cyan/30 to-transparent" />

          <p className="text-text-secondary text-sm">
            Part of{' '}
            <a
              href="https://krool.github.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-retro-cyan hover:text-retro-magenta transition-colors inline-flex items-center gap-1"
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
