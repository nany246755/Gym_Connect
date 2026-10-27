import type { RestTimerState } from '@/types/rest-timer';

// shortcut: UI phase has no storage, so the timer is kept in memory only. It survives leaving the
// timer screen, and starts fresh when the app is reopened.
let saved: RestTimerState | null = null;

export async function loadRestTimer(): Promise<RestTimerState | null> {
  return saved;
}

export async function saveRestTimer(state: RestTimerState): Promise<void> {
  saved = state;
}
