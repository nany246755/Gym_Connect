import type { ActiveCheckIn } from '@/context/BranchContext';

// The active gym attendance session for Phase 1.
// shortcut: no backend, database or storage yet, so it is kept in memory: the member starts
// checked out each time the app opens. With Firebase this becomes the checkIns collection.
let activeCheckIn: ActiveCheckIn | null = null;

export async function loadActiveCheckIn(): Promise<ActiveCheckIn | null> {
  return activeCheckIn;
}

// Save a check-in, or clear it after a successful check-out.
export async function saveActiveCheckIn(session: ActiveCheckIn | null): Promise<void> {
  activeCheckIn = session;
}
