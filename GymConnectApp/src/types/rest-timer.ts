// Saved on the device only (AsyncStorage) — see CLAUDE.md §6.
export type RestTimerState = {
  durationSec: number; // selected rest length
  endsAt: number | null; // epoch ms while running; null when idle or paused
  pausedRemainingMs: number | null; // set while paused
  totalMs: number; // length of the current rest, for the progress ring
  setNumber: number;
  checkInId: string | null; // the check-in these sets were counted in; a different one starts at Set 1
  vibrate: boolean;
};

export type RestTimerStatus = 'idle' | 'running' | 'paused';
