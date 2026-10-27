import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { useRestTimerActions, useRestTimerSnapshot } from '@/context/RestTimerContext';
import { getRemainingMs, getStatus } from '@/logic/rest-timer';

// ViewModel for the existing Rest Timer screen (FR-4).
// Long-lived state and persistence belong to the app-level provider.
export function useRestTimer() {
  const { state, ready, error } = useRestTimerSnapshot();
  const actions = useRestTimerActions();
  const [now, setNow] = useState(() => Date.now());

  const status = getStatus(state);

  useEffect(() => {
    if (!ready || status !== 'running') return;
    const interval = setInterval(() => setNow(Date.now()), 100);
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') setNow(Date.now());
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [ready, status]);

  const remainingMs = getRemainingMs(state, now);

  // Keep the displayed ring immediately in step with each user action.
  // This preserves the behavior of the teammate's original ViewModel.
  return {
    data: {
      ...state,
      status,
      remainingMs,
      progress: state.totalMs > 0 ? Math.min(1, remainingMs / state.totalMs) : 0,
    },
    loading: !ready,
    error,
    start: () => {
      setNow(Date.now());
      actions.start();
    },
    pause: () => {
      setNow(Date.now());
      actions.pause();
    },
    reset: () => {
      setNow(Date.now());
      actions.reset();
    },
    adjust: (deltaSec: number) => {
      setNow(Date.now());
      actions.adjust(deltaSec);
    },
    selectPreset: (sec: number) => {
      setNow(Date.now());
      actions.selectPreset(sec);
    },
    toggleVibrate: actions.toggleVibrate,
    resetSets: actions.resetSets,
  };
}
