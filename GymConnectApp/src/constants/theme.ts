/**
 * The only place colours are defined (see CLAUDE.md §7 and §9). Built on the two brand colours:
 * Midnight #14213D and Marigold #FCA311. Read them in screens through `useTheme()`.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#14213D', // Midnight
    background: '#F4F5F8',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E4E7EE',
    textSecondary: '#5B6475',
    primary: '#14213D', // Midnight: filled buttons, selected chips
    onPrimary: '#FFFFFF',
    accent: '#FCA311', // Marigold: highlights and progress, never body text on light surfaces
    onAccent: '#14213D',
    accentSoft: '#FFF4DE', // pale Marigold surface (chips)
    accentText: '#9F5E00', // darkened Marigold: readable (4.5:1) on accentSoft
    border: '#D9DDE5',
  },
  dark: {
    text: '#F2F4F8',
    background: '#0B1221',
    backgroundElement: '#14213D', // Midnight
    backgroundSelected: '#22345A',
    textSecondary: '#A3ADBF',
    primary: '#FCA311', // Marigold
    onPrimary: '#14213D',
    accent: '#FCA311',
    onAccent: '#14213D',
    accentSoft: '#3A2C10',
    accentText: '#FCA311',
    border: '#2A3B60',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
