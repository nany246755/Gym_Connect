import { useColorScheme as useSystemColorScheme } from 'react-native';

import { useAppearanceMode } from '@/logic/appearance';

// The phone's scheme, unless the member picked Light or Dark in their profile.
export function useColorScheme() {
  const system = useSystemColorScheme();
  const mode = useAppearanceMode();
  if (mode === 'Light') return 'light';
  if (mode === 'Dark') return 'dark';
  return system;
}
