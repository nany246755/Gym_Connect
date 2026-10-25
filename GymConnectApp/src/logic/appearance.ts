import { useSyncExternalStore } from 'react';
import { Appearance } from 'react-native';

import type { AppearanceMode } from '@/types/settings';

const SCHEME = { Default: 'unspecified', Light: 'light', Dark: 'dark' } as const;

// The app's own Light/Dark/Default choice. RN's Appearance.setColorScheme() does not notify
// useColorScheme() listeners itself (it waits for a native event Expo Go doesn't always send),
// so screens subscribe here instead and re-render the moment the choice changes.
let current: AppearanceMode = 'Default';
const listeners = new Set<() => void>();

export function applyAppearance(mode: AppearanceMode) {
  current = mode;
  // Still set it natively so system UI (keyboard, alerts) matches. Not available on web.
  Appearance.setColorScheme?.(SCHEME[mode]);
  listeners.forEach((notify) => notify());
}

const subscribe = (notify: () => void) => {
  listeners.add(notify);
  return () => {
    listeners.delete(notify);
  };
};

export function useAppearanceMode(): AppearanceMode {
  return useSyncExternalStore(subscribe, () => current, () => current);
}
