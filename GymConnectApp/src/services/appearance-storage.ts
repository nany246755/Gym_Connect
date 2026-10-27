import type { AppearanceMode } from '@/types/settings';

// shortcut: UI phase has no storage, so the Light/Dark choice is kept in memory and goes back to
// Default when the app is reopened.
let appearance: AppearanceMode = 'Default';

export async function loadAppearance(): Promise<AppearanceMode> {
  return appearance;
}

export async function saveAppearance(mode: AppearanceMode): Promise<void> {
  appearance = mode;
}
