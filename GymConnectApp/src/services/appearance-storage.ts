import AsyncStorage from '@react-native-async-storage/async-storage';

import { APPEARANCE_MODES, type AppearanceMode } from '@/types/settings';

const KEY = 'appearance';

export async function loadAppearance(): Promise<AppearanceMode> {
  const raw = await AsyncStorage.getItem(KEY);
  return APPEARANCE_MODES.find((m) => m === raw) ?? 'Default';
}

export async function saveAppearance(mode: AppearanceMode): Promise<void> {
  await AsyncStorage.setItem(KEY, mode);
}
