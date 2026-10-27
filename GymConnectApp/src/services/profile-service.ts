import { mockUser } from '@/data/mock-user';
import type { User } from '@/types/user';

// shortcut: UI phase has no database or storage, so the profile lives in memory, starting from the
// mock user. Edits last until the app closes. With Firebase this reads/writes users/{userId}.
let profile: User = mockUser;

export async function getProfile(): Promise<User> {
  return profile;
}

export async function saveProfile(user: User): Promise<void> {
  profile = user;
}
