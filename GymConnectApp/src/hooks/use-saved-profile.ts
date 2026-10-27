import { useSyncExternalStore } from 'react';
import { getProfileSnapshot, subscribeProfile } from '@/services/profile-service';

// A stable saved snapshot; unsaved Profile drafts never leak into other features.
export function useSavedProfile() {
  return useSyncExternalStore(subscribeProfile, getProfileSnapshot, getProfileSnapshot);
}
