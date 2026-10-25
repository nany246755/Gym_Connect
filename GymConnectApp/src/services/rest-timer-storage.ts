import AsyncStorage from '@react-native-async-storage/async-storage';

import type { RestTimerState } from '@/types/rest-timer';

const KEY = 'restTimer';

export async function loadRestTimer(): Promise<RestTimerState | null> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as RestTimerState) : null;
}

export async function saveRestTimer(state: RestTimerState): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(state));
}
