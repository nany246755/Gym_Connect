import { mockUser } from '@/data/mock-user';
import type { User } from '@/types/user';

// shortcut: UI phase has no database or storage, so the profile lives in memory, starting from the
// mock user. Edits last until the app closes. With Firebase this reads/writes users/{userId}.
let profile: User = mockUser;
const listeners = new Set<() => void>();

export function getProfileSnapshot(): User {
  return profile;
}

export function subscribeProfile(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function getProfile(): Promise<User> {
  return profile;
}

export async function saveProfile(user: User): Promise<void> {
  profile = user;
  listeners.forEach(listener => listener());
}
