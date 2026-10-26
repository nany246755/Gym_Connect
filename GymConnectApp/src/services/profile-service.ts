import AsyncStorage from '@react-native-async-storage/async-storage';

import { mockBranches } from '@/features/branches/mockBranches';
import { mockUser } from '@/data/mock-user';
import type { User } from '@/types/user';

// Mock user profile persisted on-device for the prototype.
const KEY = 'profile';

// Migrate home branch IDs saved by the original Profile prototype.
// Only branch IDs are migrated; all other profile fields are preserved.
const LEGACY_BRANCH_IDS: Record<string, string> = {
  'new-cairo': 'branch-001',
  'nasr-city': 'branch-002',
  'sheikh-zayed': 'branch-003',
  maadi: 'branch-004',
};

export async function getProfile(): Promise<User> {
  const raw = await AsyncStorage.getItem(KEY);
  const user: User = raw
    ? { ...mockUser, ...(JSON.parse(raw) as Partial<User>) }
    : mockUser;

  const canonicalId = LEGACY_BRANCH_IDS[user.homeBranchId] ?? user.homeBranchId;
  const validId = mockBranches.some((b) => b.id === canonicalId)
    ? canonicalId
    : mockUser.homeBranchId;

  const normalizedUser: User = { ...user, homeBranchId: validId };

  // Update only older saved records that need an ID migration.
  if (raw && normalizedUser.homeBranchId !== user.homeBranchId) {
    await AsyncStorage.setItem(KEY, JSON.stringify(normalizedUser));
  }

  return normalizedUser;
}

export async function saveProfile(user: User): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(user));
}
