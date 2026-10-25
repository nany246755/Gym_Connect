import type { RestTimerState, RestTimerStatus } from '@/types/rest-timer';

// Pure state transitions for the rest timer. `now` is passed in so the timer survives the app
// being closed: a running timer stores when it ends, not how much is left.

export const PRESETS_SEC = [30, 60, 90, 120];
export const ADJUST_SEC = 15;
const MIN_DURATION_SEC = 15;
const MAX_DURATION_SEC = 600;

export const initialRestTimer: RestTimerState = {
  durationSec: 60,
  endsAt: null,
  pausedRemainingMs: null,
  totalMs: 60_000,
  setNumber: 1,
  checkInId: null,
  vibrate: true,
};

export function getStatus(s: RestTimerState): RestTimerStatus {
  if (s.endsAt !== null) return 'running';
  if (s.pausedRemainingMs !== null) return 'paused';
  return 'idle';
}

export function getRemainingMs(s: RestTimerState, now: number): number {
  if (s.endsAt !== null) return Math.max(0, s.endsAt - now);
  return s.pausedRemainingMs ?? s.durationSec * 1000;
}

export function start(s: RestTimerState, now: number): RestTimerState {
  if (s.endsAt !== null) return s;
  const remaining = s.pausedRemainingMs ?? s.durationSec * 1000;
  return {
    ...s,
    endsAt: now + remaining,
    pausedRemainingMs: null,
    totalMs: s.pausedRemainingMs === null ? remaining : s.totalMs,
  };
}

export function pause(s: RestTimerState, now: number): RestTimerState {
  if (s.endsAt === null) return s;
  return { ...s, endsAt: null, pausedRemainingMs: Math.max(0, s.endsAt - now) };
}

export function reset(s: RestTimerState): RestTimerState {
  return { ...s, endsAt: null, pausedRemainingMs: null, totalMs: s.durationSec * 1000 };
}

// The rest is over: back to idle and on to the next set.
export function finish(s: RestTimerState): RestTimerState {
  return { ...reset(s), setNumber: s.setNumber + 1 };
}

// Each gym visit counts its own sets: when the check-in changes (check-out, or a new check-in after
// forgetting to check out), go back to Set 1. Rest length and vibrate are preferences and stay.
export function syncCheckIn(s: RestTimerState, checkInId: string | null): RestTimerState {
  if (s.checkInId === checkInId) return s;
  return { ...s, checkInId, setNumber: 1 };
}

export function selectPreset(s: RestTimerState, durationSec: number): RestTimerState {
  return reset({ ...s, durationSec });
}

// +/- seconds: changes the current rest if one is going, otherwise the default length.
// The ring's total stays the rest's full length, so removing time visibly empties the ring;
// it only grows when adding time would overfill it.
export function adjust(s: RestTimerState, deltaSec: number, now: number): RestTimerState {
  const deltaMs = deltaSec * 1000;
  if (s.endsAt !== null) {
    const endsAt = Math.max(now + 1000, s.endsAt + deltaMs);
    return { ...s, endsAt, totalMs: Math.max(s.totalMs, endsAt - now) };
  }
  if (s.pausedRemainingMs !== null) {
    const pausedRemainingMs = Math.max(1000, s.pausedRemainingMs + deltaMs);
    return { ...s, pausedRemainingMs, totalMs: Math.max(s.totalMs, pausedRemainingMs) };
  }
  const durationSec = Math.min(MAX_DURATION_SEC, Math.max(MIN_DURATION_SEC, s.durationSec + deltaSec));
  return reset({ ...s, durationSec });
}

export function formatClock(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
