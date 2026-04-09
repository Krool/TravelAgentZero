'use client';

import { useEffect, useState } from 'react';
import { useToastStore, Toast as ToastType } from '@/lib/toastStore';
import { cn } from '@/lib/utils';

const toastStyles = {
  success: {
    border: 'border-retro-green/40',
    bg: 'bg-retro-green/[0.08]',
    text: 'text-retro-green',
    icon: '✓',
  },
  error: {
    border: 'border-retro-red/40',
    bg: 'bg-retro-red/[0.08]',
    text: 'text-retro-red',
    icon: '✕',
  },
  info: {
    border: 'border-retro-cyan/40',
    bg: 'bg-retro-cyan/[0.08]',
    text: 'text-retro-cyan',
    icon: 'i',
  },
  warning: {
    border: 'border-retro-orange/40',
    bg: 'bg-retro-orange/[0.08]',
    text: 'text-retro-orange',
    icon: '!',
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
        'flex items-center gap-3 px-4 py-3 rounded-xl border text-sm',
        'backdrop-blur-xl transition-all duration-200',
        'bg-[rgba(15,18,35,0.9)]',
        style.border,
        isExiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0',
        'animate-slide-in'
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <span
        className={cn(
          'w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold border',
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
        className="w-5 h-5 flex items-center justify-center rounded transition-colors text-text-muted hover:text-text-primary"
        aria-label="Dismiss notification"
      >
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
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

export { useToastStore } from '@/lib/toastStore';
