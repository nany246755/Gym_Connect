// Device-only settings (AsyncStorage) — see CLAUDE.md §6.
export const APPEARANCE_MODES = ['Default', 'Light', 'Dark'] as const; // Default = follow the phone
export type AppearanceMode = (typeof APPEARANCE_MODES)[number];
