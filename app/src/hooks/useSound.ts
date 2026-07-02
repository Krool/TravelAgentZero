'use client';

import { useCallback } from 'react';
import { useAppStore } from '@/lib/store';

type SoundType = 'click' | 'hover' | 'success' | 'error' | 'select' | 'score' | 'toggle';

// Single, lazily-created AudioContext shared by every hook instance. Creating
// one per component (the old behavior) meant ~150+ AudioContext objects on
// the homepage alone.
let sharedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!sharedAudioContext) {
    sharedAudioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  if (sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume();
  }
  return sharedAudioContext;
}

// Synthesize sounds using the Web Audio API - SOFTER, more subtle sounds.
// `scale` adjusts the base gains relative to the default soundVolume (0.08)
// so the volume slider still has an effect; callers clamp it to keep things
// subtle and avoid clipping.
function playSynthSound(type: SoundType, scale: number): void {
  const audioContext = getAudioContext();
  if (!audioContext) return;

  const scaledGain = (base: number) => Math.min(base * scale, 1);

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
      gainNode.gain.setValueAtTime(scaledGain(0.03), audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.04);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.04);
      break;
    case 'hover':
      // Very subtle hover - barely audible blip
      oscillator.frequency.value = 330; // E4
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(scaledGain(0.015), audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.02);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.02);
      break;
    case 'success': {
      // Gentle 2-note chime (softer arpeggio)
      const playSuccessNote = (freq: number, delay: number) => {
        const osc = audioContext.createOscillator();
        const noteGain = audioContext.createGain();
        osc.connect(noteGain);
        noteGain.connect(audioContext.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        noteGain.gain.setValueAtTime(scaledGain(0.04), audioContext.currentTime + delay);
        noteGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + delay + 0.15);
        osc.start(audioContext.currentTime + delay);
        osc.stop(audioContext.currentTime + delay + 0.15);
      };
      playSuccessNote(523, 0);    // C5
      playSuccessNote(659, 0.12); // E5
      break;
    }
    case 'error':
      // Soft low tone - not harsh
      oscillator.frequency.value = 180;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(scaledGain(0.04), audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.12);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.12);
      break;
    case 'select':
      // Gentle select ping
      oscillator.frequency.value = 550;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(scaledGain(0.03), audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.06);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.06);
      break;
    case 'score': {
      // Subtle rising tone instead of harsh beeps
      const playScoreNote = (freq: number, delay: number) => {
        const osc = audioContext.createOscillator();
        const noteGain = audioContext.createGain();
        osc.connect(noteGain);
        noteGain.connect(audioContext.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        noteGain.gain.setValueAtTime(scaledGain(0.02), audioContext.currentTime + delay);
        noteGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + delay + 0.08);
        osc.start(audioContext.currentTime + delay);
        osc.stop(audioContext.currentTime + delay + 0.08);
      };
      playScoreNote(440, 0);      // A4
      playScoreNote(523, 0.08);   // C5
      playScoreNote(659, 0.16);   // E5
      break;
    }
    case 'toggle':
      // Soft toggle click
      oscillator.frequency.value = 400;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(scaledGain(0.025), audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.05);
      break;
  }
}

export function useSound() {
  const { soundEnabled, soundVolume } = useAppStore();

  const play = useCallback(
    (type: SoundType) => {
      if (!soundEnabled) return;

      // Scale gains relative to the default soundVolume (0.08) so the slider
      // still has an audible effect; clamp to stay subtle and avoid clipping.
      const scale = Math.min(Math.max(soundVolume / 0.08, 0), 3);
      playSynthSound(type, scale);
    },
    [soundEnabled, soundVolume]
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
