import confetti from 'canvas-confetti';

// ─── Shared AudioContext (created once per session) ──────────────────────────
let _audioCtx: AudioContext | null = null;

const getAudioCtx = (): AudioContext | null => {
  try {
    if (!_audioCtx || _audioCtx.state === 'closed') {
      _audioCtx = new AudioContext();
    }
    return _audioCtx;
  } catch {
    return null;
  }
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Soft chime sound using Web Audio API – no external files needed.
 */
const createChime = (type: 'add' | 'delete') => {
  const ctx = getAudioCtx();
  if (!ctx) return;

  const now = ctx.currentTime;

  if (type === 'add') {
    // Ascending bell-like chime (C5 → E5 → G5)
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.12);
      gain.gain.setValueAtTime(0, now + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.15, now + i * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.6);
    });
  } else {
    // Gentle descending tone (G4 → E4)
    const notes = [392, 329.63];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.12, now + i * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.5);
    });
  }
};

/**
 * Celebration burst – confetti particles from the center.
 * Skipped if the user prefers reduced motion.
 */
const celebrationBurst = () => {
  const defaults = {
    spread: 360,
    ticks: 80,
    gravity: 0.6,
    decay: 0.94,
    startVelocity: 20,
    colors: ['#7c5cfc', '#38bdf8', '#6ee7b7', '#fbbf24', '#f472b6'],
  };

  confetti({
    ...defaults,
    particleCount: 40,
    scalar: 1.2,
    shapes: ['star'],
    origin: { x: 0.5, y: 0.45 },
  });

  confetti({
    ...defaults,
    particleCount: 20,
    scalar: 0.8,
    shapes: ['circle'],
    origin: { x: 0.5, y: 0.45 },
  });
};

/**
 * Subtle poof for deletions.
 */
const deletePoof = () => {
  confetti({
    particleCount: 15,
    spread: 55,
    startVelocity: 12,
    gravity: 1.2,
    ticks: 40,
    decay: 0.9,
    colors: ['#9ca3af', '#6b7280', '#4b5563'],
    shapes: ['circle'],
    origin: { x: 0.5, y: 0.5 },
    scalar: 0.6,
  });
};

export const playAddCelebration = () => {
  if (prefersReducedMotion()) return;
  try { createChime('add'); } catch {}
  celebrationBurst();
};

export const playDeleteFeedback = () => {
  if (prefersReducedMotion()) return;
  try { createChime('delete'); } catch {}
  deletePoof();
};
