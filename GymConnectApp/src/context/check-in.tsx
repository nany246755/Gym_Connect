import type { CheckIn } from '@/types/check-in';

// The one shared answer to "is this member checked in, and to which check-in?".
// Every screen reads it from here; check-in / check-out only change it — they never call other screens.
//
// shortcut: placeholder that always says "not checked in". Member 1 (Branch Selection & Check-In)
// replaces the inside with the real Firestore check-in (via services/) and adds checkIn/checkOut here —
// keep the name and the `activeCheckIn` field so screens already using it keep working.
export function useCheckIn(): { activeCheckIn: CheckIn | null } {
  return { activeCheckIn: null };
}
