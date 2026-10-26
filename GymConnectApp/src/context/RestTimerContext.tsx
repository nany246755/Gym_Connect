import * as Haptics from 'expo-haptics';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';

import {
  adjust,
  finish,
  getRemainingMs,
  initialRestTimer,
  pause,
  reset,
  resetAfterCheckout,
  selectPreset,
  start,
  syncCheckIn,
} from '@/logic/rest-timer';
import { loadRestTimer, saveRestTimer } from '@/services/rest-timer-storage';
import type { RestTimerState } from '@/types/rest-timer';

type TimerAction = (previous: RestTimerState) => RestTimerState;

type TimerActions = {
  start: () => void;
  pause: () => void;
  reset: () => void;
  adjust: (deltaSec: number) => void;
  selectPreset: (durationSec: number) => void;
  toggleVibrate: () => void;
  resetSets: () => void;
  syncSession: (sessionId: string | null) => Promise<void>;
  resetForCheckout: () => Promise<void>;
};

type TimerSnapshot = {
  state: RestTimerState;
  ready: boolean;
  error: string | null;
};

const TimerActionsContext = createContext<TimerActions | undefined>(undefined);
const TimerSnapshotContext = createContext<TimerSnapshot | undefined>(undefined);

const buzzLight = () =>
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
const buzzDone = () =>
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

export function RestTimerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RestTimerState>(initialRestTimer);
  const stateRef = useRef<RestTimerState>(initialRestTimer);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastBuzzSecond = useRef<number | null>(null);

  // Serialize writes to avoid a delayed old timer save overwriting a checkout reset.
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const queueSave = useCallback((next: RestTimerState): Promise<void> => {
    const write = saveQueue.current.then(() => saveRestTimer(next));
    saveQueue.current = write.catch(() => {
      setError('Could not save your timer.');
    });
    return write;
  }, []);

  const commit = useCallback((change: TimerAction): Promise<void> => {
    const previous = stateRef.current;
    const next = change(previous);
    if (next === previous) return Promise.resolve();
    stateRef.current = next;
    setState(next);
    return queueSave(next);
  }, [queueSave]);

  // Load exactly once at app startup. A timer that expired while the app was
  // closed advances one set, without vibrating long after completion.
  useEffect(() => {
    let mounted = true;
    loadRestTimer()
      .then((saved) => {
        if (!mounted) return;
        const restored = saved ? { ...initialRestTimer, ...saved } : initialRestTimer;
        const expired = restored.endsAt !== null && restored.endsAt <= Date.now();
        const next = expired ? finish(restored) : restored;
        stateRef.current = next;
        setState(next);
        if (expired) void queueSave(next);
      })
      .catch(() => {
        if (mounted) setError('Could not load your saved timer.');
      })
      .finally(() => {
        if (mounted) setReady(true);
      });
    return () => { mounted = false; };
  }, [queueSave]);

  const update = useCallback((change: TimerAction) => {
    if (!ready) return;
    void commit(change).catch(() => {});
  }, [ready, commit]);

  const actions = useMemo<TimerActions>(() => ({
    start: () => update((s) => start(s, Date.now())),
    pause: () => update((s) => pause(s, Date.now())),
    reset: () => update(reset),
    adjust: (deltaSec) => update((s) => adjust(s, deltaSec, Date.now())),
    selectPreset: (durationSec) => update((s) => selectPreset(s, durationSec)),
    toggleVibrate: () => update((s) => ({ ...s, vibrate: !s.vibrate })),
    resetSets: () => update((s) => ({ ...s, setNumber: 1 })),
    syncSession: async (sessionId) => {
      if (!ready) return;
      await commit((s) => syncCheckIn(s, sessionId));
    },
    resetForCheckout: async () => {
      if (!ready) return;
      await commit(resetAfterCheckout);
    },
  }), [update, ready, commit]);

  // The provider stays mounted when the timer screen is not visible.
  // It can finish and buzz while the app is IN THE FOREGROUND, but doesn't
  // claim background/terminated vibration (that needs OS notifications).
  useEffect(() => {
    if (!ready || state.endsAt === null) return;
    lastBuzzSecond.current = null;
    const id = setInterval(() => {
      if (AppState.currentState !== 'active') return;
      const current = stateRef.current;
      if (current.endsAt === null) return;
      const now = Date.now();
      const remaining = getRemainingMs(current, now);
      if (remaining <= 0) {
        // Never generate a late vibration on returning from a long background gap.
        if (current.vibrate && now - current.endsAt <= 750) void buzzDone();
        void commit(finish).catch(() => {});
        return;
      }
      const secondsLeft = Math.ceil(remaining / 1000);
      if (secondsLeft > 3) {
        lastBuzzSecond.current = null;
      } else if (secondsLeft !== lastBuzzSecond.current) {
        lastBuzzSecond.current = secondsLeft;
        if (current.vibrate) void buzzLight();
      }
    }, 250);
    return () => clearInterval(id);
  }, [ready, state.endsAt, commit]);

  const snapshot = useMemo<TimerSnapshot>(() => ({ state, ready, error }), [state, ready, error]);
  return (
    <TimerActionsContext.Provider value={actions}>
      <TimerSnapshotContext.Provider value={snapshot}>
        {children}
      </TimerSnapshotContext.Provider>
    </TimerActionsContext.Provider>
  );
}

export function useRestTimerActions(): TimerActions {
  const context = useContext(TimerActionsContext);
  if (!context) throw new Error('useRestTimerActions must be used inside RestTimerProvider');
  return context;
}

export function useRestTimerSnapshot(): TimerSnapshot {
  const context = useContext(TimerSnapshotContext);
  if (!context) throw new Error('useRestTimerSnapshot must be used inside RestTimerProvider');
  return context;
}
