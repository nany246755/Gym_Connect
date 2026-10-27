import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

import { useAppearanceMode } from '@/logic/appearance';

const subscribeHydration = () => () => { };
const clientSnapshot = () => true;
const serverSnapshot = () => false;

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const hasHydrated = useSyncExternalStore(subscribeHydration, clientSnapshot, serverSnapshot);

  const colorScheme = useRNColorScheme();
  const mode = useAppearanceMode();

  if (!hasHydrated) {
    return 'light';
  }
  // The member's Light/Dark choice from the profile wins over the browser's setting.
  if (mode === 'Light') return 'light';
  if (mode === 'Dark') return 'dark';
  return colorScheme;
}
