'use client';

import { useEffect, useState } from 'react';
import { useToastStore, Toast as ToastType } from '@/lib/toastStore';
import { cn } from '@/lib/utils';

const toastStyles = {
  success: {
    border: 'border-retro-green',
    bg: 'bg-retro-green/10',
    text: 'text-retro-green',
    icon: '✓',
    glow: 'shadow-[0_0_15px_rgba(0,255,0,0.3)]',
  },
  error: {
    border: 'border-retro-red',
    bg: 'bg-retro-red/10',
    text: 'text-retro-red',
    icon: '✕',
    glow: 'shadow-[0_0_15px_rgba(255,51,102,0.3)]',
  },
  info: {
    border: 'border-retro-cyan',
    bg: 'bg-retro-cyan/10',
    text: 'text-retro-cyan',
    icon: 'i',
    glow: 'shadow-[0_0_15px_rgba(0,255,242,0.3)]',
  },
  warning: {
    border: 'border-retro-orange',
    bg: 'bg-retro-orange/10',
    text: 'text-retro-orange',
    icon: '!',
    glow: 'shadow-[0_0_15px_rgba(255,107,53,0.3)]',
  },
};

function ToastItem({ toast, onClose }: { toast: ToastType; onClose: () => void }) {
  const [isExiting, setIsExiting] = useState(false);
  const style = toastStyles[toast.type];

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 200);
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded border-2 font-mono text-sm',
        'backdrop-blur-sm transition-all duration-200',
        style.border,
        style.bg,
        style.glow,
        isExiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0',
        'animate-slide-in'
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <span
        className={cn(
          'w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold',
          style.border,
          style.text
        )}
      >
        {style.icon}
      </span>

      {/* Message */}
      <span className="text-text-primary flex-1">{toast.message}</span>

      {/* Close button */}
      <button
        onClick={handleClose}
        className={cn(
          'w-5 h-5 flex items-center justify-center rounded transition-colors',
          'text-text-muted hover:text-text-primary'
        )}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onClose={() => removeToast(toast.id)} />
        </div>
      ))}
    </div>
  );
}

// Export a simple toast function for direct use
export { useToastStore } from '@/lib/toastStore';
