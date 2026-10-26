
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ActiveCheckIn } from '@/context/BranchContext';

// Local storage for the active gym attendance session.
// Used for Phase 1 without a backend or database.
const ACTIVE_CHECK_IN_KEY = 'gymConnect.activeCheckIn';

// Restore the active check-in when the application reopens.
export async function loadActiveCheckIn(): Promise<ActiveCheckIn | null> {
  const raw = await AsyncStorage.getItem(ACTIVE_CHECK_IN_KEY);

  if (raw === null) {
    return null;
  }

  const value: unknown = JSON.parse(raw);

  // Validate saved data before restoring the session.
  if (
    value !== null &&
    typeof value === 'object' &&
    'branchId' in value &&
    'checkedInAt' in value &&
    typeof value.branchId === 'string' &&
    typeof value.checkedInAt === 'string'
  ) {
    return {
      branchId: value.branchId,
      checkedInAt: value.checkedInAt,
    };
  }

  return null;
}

// Save a check-in or remove it after a successful check-out.
export async function saveActiveCheckIn(
  session: ActiveCheckIn | null
): Promise<void> {
  if (session === null) {
    await AsyncStorage.removeItem(ACTIVE_CHECK_IN_KEY);
  } else {
    await AsyncStorage.setItem(
      ACTIVE_CHECK_IN_KEY,
      JSON.stringify(session)
    );
  }
}
