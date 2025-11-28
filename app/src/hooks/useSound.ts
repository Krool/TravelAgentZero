'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { useAppStore } from '@/lib/store';

type SoundType = 'click' | 'hover' | 'success' | 'error' | 'select' | 'score' | 'toggle';

// Sound configurations - SOFTER volumes for a more pleasant experience
const SOUND_CONFIG: Record<SoundType, { src: string; baseVolume: number }> = {
  click: { src: '/audio/click.mp3', baseVolume: 0.3 },
  hover: { src: '/audio/hover.mp3', baseVolume: 0.15 },
  success: { src: '/audio/success.mp3', baseVolume: 0.4 },
  error: { src: '/audio/error.mp3', baseVolume: 0.3 },
  select: { src: '/audio/select.mp3', baseVolume: 0.25 },
  score: { src: '/audio/score.mp3', baseVolume: 0.3 },
  toggle: { src: '/audio/toggle.mp3', baseVolume: 0.25 },
};

// Create fallback sounds using Web Audio API - SOFTER, more subtle sounds
function createFallbackSound(type: SoundType): () => void {
  return () => {
    if (typeof window === 'undefined') return;

    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configure based on sound type - SOFTER, lower frequencies, quieter
    switch (type) {
      case 'click':
        // Soft click - lower frequency sine wave with quick fade
        oscillator.frequency.value = 440; // A4, more musical
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.03, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.04);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.04);
        break;
      case 'hover':
        // Very subtle hover - barely audible blip
        oscillator.frequency.value = 330; // E4
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.015, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.02);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.02);
        break;
      case 'success':
        // Gentle 2-note chime (softer arpeggio)
        const playSuccessNote = (freq: number, delay: number) => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.connect(gain);
          gain.connect(audioContext.destination);
          osc.frequency.value = freq;
          osc.type = 'sine';
          gain.gain.setValueAtTime(0.04, audioContext.currentTime + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + delay + 0.15);
          osc.start(audioContext.currentTime + delay);
          osc.stop(audioContext.currentTime + delay + 0.15);
        };
        playSuccessNote(523, 0);    // C5
        playSuccessNote(659, 0.12); // E5
        return;
      case 'error':
        // Soft low tone - not harsh
        oscillator.frequency.value = 180;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.04, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.12);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.12);
        break;
      case 'select':
        // Gentle select ping
        oscillator.frequency.value = 550;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.03, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.06);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.06);
        break;
      case 'score':
        // Subtle rising tone instead of harsh beeps
        const playScoreNote = (freq: number, delay: number) => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.connect(gain);
          gain.connect(audioContext.destination);
          osc.frequency.value = freq;
          osc.type = 'sine';
          gain.gain.setValueAtTime(0.02, audioContext.currentTime + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + delay + 0.08);
          osc.start(audioContext.currentTime + delay);
          osc.stop(audioContext.currentTime + delay + 0.08);
        };
        playScoreNote(440, 0);      // A4
        playScoreNote(523, 0.08);   // C5
        playScoreNote(659, 0.16);   // E5
        return;
      case 'toggle':
        // Soft toggle click
        oscillator.frequency.value = 400;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.025, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.05);
        break;
    }
  };
}

export function useSound() {
  const { soundEnabled, soundVolume } = useAppStore();
  const soundsRef = useRef<Map<SoundType, Howl | (() => void)>>(new Map());
  const loadedRef = useRef(false);

  // Initialize sounds
  useEffect(() => {
    if (loadedRef.current || typeof window === 'undefined') return;
    loadedRef.current = true;

    Object.entries(SOUND_CONFIG).forEach(([type, config]) => {
      try {
        const sound = new Howl({
          src: [config.src],
          volume: soundVolume * config.baseVolume,
          preload: true,
          onloaderror: () => {
            // Fall back to Web Audio API if file not found
            soundsRef.current.set(type as SoundType, createFallbackSound(type as SoundType));
          },
        });
        soundsRef.current.set(type as SoundType, sound);
      } catch {
        // Fall back to Web Audio API
        soundsRef.current.set(type as SoundType, createFallbackSound(type as SoundType));
      }
    });
  }, [soundVolume]);

  // Update volume when it changes
  useEffect(() => {
    soundsRef.current.forEach((sound, type) => {
      if (sound instanceof Howl) {
        sound.volume(soundVolume * SOUND_CONFIG[type].baseVolume);
      }
    });
  }, [soundVolume]);

  const play = useCallback(
    (type: SoundType) => {
      if (!soundEnabled) return;

      const sound = soundsRef.current.get(type);
      if (sound) {
        if (sound instanceof Howl) {
          sound.play();
        } else {
          // Fallback function
          sound();
        }
      }
    },
    [soundEnabled]
  );

  return { play, soundEnabled, soundVolume };
}

// Hook for button sounds
export function useButtonSound() {
  const { play } = useSound();

  return {
    onClick: () => play('click'),
    onMouseEnter: () => play('hover'),
  };
}
