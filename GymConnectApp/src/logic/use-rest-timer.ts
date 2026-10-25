import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';

import { useCheckIn } from '@/context/check-in';
import {
  adjust as adjustTimer,
  finish,
  getRemainingMs,
  getStatus,
  initialRestTimer,
  pause as pauseTimer,
  reset as resetTimer,
  selectPreset as selectPresetTimer,
  start as startTimer,
  syncCheckIn,
} from '@/logic/rest-timer';
import { loadRestTimer, saveRestTimer } from '@/services/rest-timer-storage';
import type { RestTimerState } from '@/types/rest-timer';

// Haptics can fail (no hardware, low power mode, web without vibration) — the timer must not care.
const buzzLight = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
const buzzDone = () =>
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

// ViewModel for the Rest Timer screen (FR-4).
export function useRestTimer() {
  const [state, setState] = useState<RestTimerState>(initialRestTimer);
  const [now, setNow] = useState(() => Date.now());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastBuzzSec = useRef<number | null>(null);

  useEffect(() => {
    loadRestTimer()
      .then((saved) => {
        if (!saved) return;
        // Fill fields added after this was saved (e.g. checkInId) with their defaults.
        const s = { ...initialRestTimer, ...saved };
        // A rest that ended while the app was closed counts as done, without a late buzz.
        setState(s.endsAt !== null && s.endsAt <= Date.now() ? finish(s) : s);
      })
      .catch(() => setError('Could not load your saved timer.'))
      .finally(() => setLoading(false));
  }, []);

  // Save after loading, so the defaults never overwrite what was saved.
  useEffect(() => {
    if (loading) return;
    saveRestTimer(state).catch(() => setError('Could not save your timer.'));
  }, [state, loading]);

  // Watch the check-in; also runs once after loading, so a change made while the app was closed counts.
  const checkInId = useCheckIn().activeCheckIn?.id ?? null;
  useEffect(() => {
    if (!loading) setState((s) => syncCheckIn(s, checkInId));
  }, [checkInId, loading]);

  const status = getStatus(state);
  const remainingMs = getRemainingMs(state, now);

  useEffect(() => {
    if (status !== 'running') return;
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [status]);

  // Light taps on the last 3 seconds, a strong buzz at zero.
  useEffect(() => {
    if (status !== 'running') return;
    if (remainingMs <= 0) {
      if (state.vibrate) buzzDone();
      setState(finish);
      return;
    }
    const secLeft = Math.ceil(remainingMs / 1000);
    if (secLeft > 3) {
      lastBuzzSec.current = null;
    } else if (secLeft !== lastBuzzSec.current) {
      lastBuzzSec.current = secLeft;
      if (state.vibrate) buzzLight();
    }
  }, [status, remainingMs, state.vibrate]);

  // Actions that need the current time also refresh `now`, so the ring never shows a stale value.
  const withNow = (fn: (s: RestTimerState, t: number) => RestTimerState) => {
    const t = Date.now();
    setNow(t);
    setState((s) => fn(s, t));
  };

  return {
    data: {
      ...state,
      status,
      remainingMs,
      progress: state.totalMs > 0 ? Math.min(1, remainingMs / state.totalMs) : 0,
    },
    loading,
    error,
    start: () => withNow(startTimer),
    pause: () => withNow(pauseTimer),
    reset: () => setState(resetTimer),
    adjust: (deltaSec: number) => withNow((s, t) => adjustTimer(s, deltaSec, t)),
    selectPreset: (sec: number) => setState((s) => selectPresetTimer(s, sec)),
    toggleVibrate: () => setState((s) => ({ ...s, vibrate: !s.vibrate })),
    resetSets: () => setState((s) => ({ ...s, setNumber: 1 })),
  };
}
