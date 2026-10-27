import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { mockUser } from '@/data/mock-user';
import { useRestTimerActions, useRestTimerSnapshot } from '@/context/RestTimerContext';
import { loadActiveCheckIn, saveActiveCheckIn } from '@/services/attendance-storage';
import { getProfile } from '@/services/profile-service';

export type ActiveCheckIn = {
  branchId: string;
  checkedInAt: string;
};

type BranchContextType = {
  activeCheckIn: ActiveCheckIn | null;
  attendanceReady: boolean;
  startDemoCheckIn: (branchId: string) => Promise<boolean>;
  endDemoCheckIn: () => Promise<boolean>;
  preferredBranchId: string;
  setPreferredBranchId: (branchId: string) => void;
};

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({ children }: { children: ReactNode }) {
  const [activeCheckIn, setActiveCheckIn] = useState<ActiveCheckIn | null>(null);
  const activeRef = useRef<ActiveCheckIn | null>(null);
  const pending = useRef(false);
  const [attendanceReady, setAttendanceReady] = useState(false);
  const [preferredBranchId, setPreferredBranchId] = useState(mockUser.homeBranchId);
  const { ready: timerReady } = useRestTimerSnapshot();
  const { syncSession, resetForCheckout } = useRestTimerActions();

  // Restore the active check-in across restarts. Only the user actually
  // confirming a checkout ends this session.
  useEffect(() => {
    let mounted = true;
    loadActiveCheckIn()
      .then((session) => {
        if (!mounted) return;
        activeRef.current = session;
        setActiveCheckIn(session);
      })
      .catch(() => {
        // If storage is inaccessible, the screen remains usable as a demo;
        // subsequent save attempts report failure rather than fake success.
      })
      .finally(() => {
        if (mounted) setAttendanceReady(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Preferred branch remains independent of active attendance.
  useEffect(() => {
    let mounted = true;
    getProfile()
      .then((user) => {
        if (mounted) setPreferredBranchId(user.homeBranchId);
      })
      .catch(() => { });
    return () => {
      mounted = false;
    };
  }, []);

  // Reconcile a restored timer with the restored attendance. This also
  // repairs an interrupted checkout where attendance was cleared but a
  // device shutdown prevented the timer reset from being saved.
  useEffect(() => {
    if (!attendanceReady || !timerReady) return;
    void syncSession(activeCheckIn?.checkedInAt ?? null).catch(() => { });
  }, [attendanceReady, timerReady, activeCheckIn?.checkedInAt, syncSession]);

  const startDemoCheckIn = async (branchId: string): Promise<boolean> => {
    if (!attendanceReady || !timerReady || pending.current || activeRef.current !== null) {
      return false;
    }
    pending.current = true;
    try {
      const session: ActiveCheckIn = {
        branchId,
        checkedInAt: new Date().toISOString(),
      };
      await saveActiveCheckIn(session);
      activeRef.current = session;
      setActiveCheckIn(session);
      // A new gym visit starts Set 1 and cancels any leftover rest.
      void syncSession(session.checkedInAt).catch(() => { });
      return true;
    } catch {
      return false;
    } finally {
      pending.current = false;
    }
  };

  const endDemoCheckIn = async (): Promise<boolean> => {
    if (!attendanceReady || !timerReady || pending.current || activeRef.current === null) {
      return false;
    }
    pending.current = true;
    try {
      // Save the confirmed checkout first. If this fails, the timer stays as-is.
      await saveActiveCheckIn(null);
      activeRef.current = null;
      setActiveCheckIn(null);
      // Cancel running/paused/finished timer, including while the timer
      // screen is unmounted. Preserve selected length and vibration setting.
      await resetForCheckout().catch(() => {
        // The provider already reset the in-memory state; its persisted
        // session ID will be reconciled on the next app launch if needed.
      });
      return true;
    } catch {
      return false;
    } finally {
      pending.current = false;
    }
  };

  return (
    <BranchContext.Provider
      value={{
        activeCheckIn,
        attendanceReady,
        startDemoCheckIn,
        endDemoCheckIn,
        preferredBranchId,
        setPreferredBranchId,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const context = useContext(BranchContext);
  if (context === undefined) throw new Error('useBranch must be used inside BranchProvider');
  return context;
}
