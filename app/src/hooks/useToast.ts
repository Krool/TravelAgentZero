'use client';

import { useCallback } from 'react';
import { useToastStore, ToastType } from '@/lib/toastStore';
import { useSound } from '@/hooks/useSound';

export function useToast() {
  const { addToast, removeToast, clearToasts, toasts } = useToastStore();
  const { play } = useSound();

  const toast = useCallback(
    (type: ToastType, message: string, duration?: number) => {
      // Play appropriate sound based on toast type
      const soundMap: Record<ToastType, 'success' | 'error' | 'click' | 'toggle'> = {
        success: 'success',
        error: 'error',
        info: 'click',
        warning: 'toggle',
      };
      play(soundMap[type]);

      addToast({ type, message, duration });
    },
    [addToast, play]
  );

  const success = useCallback(
    (message: string, duration?: number) => toast('success', message, duration),
    [toast]
  );

  const error = useCallback(
    (message: string, duration?: number) => toast('error', message, duration),
    [toast]
  );

  const info = useCallback(
    (message: string, duration?: number) => toast('info', message, duration),
    [toast]
  );

  const warning = useCallback(
    (message: string, duration?: number) => toast('warning', message, duration),
    [toast]
  );

  return {
    toast,
    success,
    error,
    info,
    warning,
    remove: removeToast,
    clear: clearToasts,
    toasts,
  };
}
