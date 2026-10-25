/**
 * The only place colours are defined (see CLAUDE.md §7 and §9). Built on the two brand colours:
 * Midnight #14213D and Marigold #FCA311. Read them in screens through `useTheme()`.
 */

import '@/global.css';

import { Platform, type TextStyle } from 'react-native';


export const Colors = {
  light: {
    // Screen and surface colors
    text: '#14213D',
    background: '#F5F6FA',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#EEF1F6',
    textSecondary: '#64748B',

    // Shared Gym Connect brand colors
    navy: '#14213D',
    marigold: '#FCA311',

    // Primary buttons
    primary: '#FCA311',
    onPrimary: '#14213D',

    // Check Out button
    checkOutBackground: '#14213D',
    checkOutText: '#FFFFFF',

    // Selected branch
    selectedBorder: '#FCA311',

    // Preferred badge
    preferredBackground: '#14213D',
    preferredText: '#FCA311',

    // Status colors
    success: '#15803D',
    error: '#B91C1C',
  },

  dark: {
    // Screen and surface colors
    text: '#FFFFFF',
    background: '#0B1428',
    backgroundElement: '#14213D',
    backgroundSelected: '#233350',
    textSecondary: '#A8B2C5',

    // Shared Gym Connect brand colors
    navy: '#14213D',
    marigold: '#FCA311',

    // Primary buttons
    primary: '#FCA311',
    onPrimary: '#14213D',

    // Check Out button
    checkOutBackground: '#30466C',
    checkOutText: '#FFFFFF',

    // Selected branch
    selectedBorder: '#FCA311',

    // Preferred badge
    preferredBackground: '#FCA311',
    preferredText: '#14213D',

    // Status colors
    success: '#4ADE80',
    error: '#FCA5A5',
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

// Web only: hides the browser's own focus ring on text inputs (screens show focus with the border
// instead). RN's types don't list 'none', but react-native-web supports it.
export const NoWebOutline = (Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) as unknown as TextStyle;
