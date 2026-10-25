import AsyncStorage from '@react-native-async-storage/async-storage';

import { mockBranches } from '@/data/mock-branches';
import { mockUser } from '@/data/mock-user';
import type { User } from '@/types/user';

// shortcut: mock data + edits saved on this device, because there is no database in the UI phase.
// When Firebase is added, replace these bodies with Firestore (`users`); screens don't change.
const KEY = 'profile';

export async function getProfile(): Promise<User> {
  const raw = await AsyncStorage.getItem(KEY);
  const user = raw ? { ...mockUser, ...(JSON.parse(raw) as Partial<User>) } : mockUser;
  // A branch saved earlier may no longer exist (e.g. Zamalek was removed): fall back to the default.
  return mockBranches.some((b) => b.id === user.homeBranchId) ? user : { ...user, homeBranchId: mockUser.homeBranchId };
}

export async function saveProfile(user: User): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(user));
}
