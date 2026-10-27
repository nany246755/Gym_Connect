import { useSyncExternalStore } from 'react';
import type { createSessionStore } from '@/services/session-store';

export function useSessionStore<T>(store: ReturnType<typeof createSessionStore<T>>) {
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  return [snapshot, store.update] as const;
}
