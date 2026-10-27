export function createSessionStore<T>(initialize: () => T) {
  let snapshot: T;
  let initialized = false;
  const listeners = new Set<() => void>();
  const getSnapshot = (): T => {
    if (!initialized) {
      snapshot = initialize();
      initialized = true;
    }
    return snapshot;
  };
  return {
    getSnapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    update(change: T | ((current: T) => T)) {
      const current = getSnapshot();
      const next = typeof change === 'function' ? (change as (current: T) => T)(current) : change;
      if (Object.is(next, current)) return;
      snapshot = next;
      listeners.forEach(listener => listener());
    },
  };
}
