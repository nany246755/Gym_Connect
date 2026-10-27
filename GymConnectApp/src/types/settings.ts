// Device-only settings, kept in memory during the UI phase — see services/appearance-storage.ts.
export const APPEARANCE_MODES = ['Default', 'Light', 'Dark'] as const; // Default = follow the phone
export type AppearanceMode = (typeof APPEARANCE_MODES)[number];
