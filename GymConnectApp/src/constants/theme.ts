
/**
 * The only place colours are defined (see CLAUDE.md §7 and §9).
 *
 * Built on the two brand colours:
 * Midnight #14213D and Marigold #FCA311.
 *
 * Read them in screens through useTheme().
 *
 * Includes compatibility colours for all merged team screens.
 */

import '@/global.css';

import { Platform, type TextStyle } from 'react-native';

export const Colors = {
  light: {
    // ========================================
    // SCREEN AND SURFACE COLORS
    // ========================================

    text: '#14213D',
    background: '#F5F6FA',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#EEF1F6',
    textSecondary: '#64748B',

    // ========================================
    // GYM CONNECT BRAND COLORS
    // ========================================

    navy: '#14213D',
    marigold: '#FCA311',

    // ========================================
    // PRIMARY BUTTONS
    // ========================================

    primary: '#FCA311',
    onPrimary: '#14213D',

    // ========================================
    // CHECK OUT BUTTON
    // ========================================

    checkOutBackground: '#14213D',
    checkOutText: '#FFFFFF',

    // ========================================
    // SELECTED BRANCH
    // ========================================

    selectedBorder: '#FCA311',

    // ========================================
    // PREFERRED BRANCH BADGE
    // ========================================

    preferredBackground: '#14213D',
    preferredText: '#FCA311',

    // ========================================
    // STATUS COLORS
    // ========================================

    success: '#15803D',
    error: '#B91C1C',

    // ========================================
    // ADDITIONAL TEAM THEME COLORS
    // ========================================

    // Hero / header sections
    hero: '#14213D',
    heroText: '#FFFFFF',
    heroSubtext: '#C5CEDE',
    heroChip: '#233350',

    // Accent colors
    accent: '#FCA311',
    onAccent: '#14213D',
    accentText: '#945900',
    accentSoft: '#FFF1D6',

    // Borders
    border: '#D8DEE8',

    // Destructive actions and errors
    danger: '#B91C1C',
    onDanger: '#FFFFFF',
    dangerSoft: '#FEE2E2',

    // Modal / bottom sheet backdrop
    backdrop: 'rgba(0, 0, 0, 0.55)',

    //success
    successSoft: '#DCFCE7',
  },

  dark: {
    // ========================================
    // SCREEN AND SURFACE COLORS
    // ========================================

    text: '#FFFFFF',
    background: '#0B1428',
    backgroundElement: '#14213D',
    backgroundSelected: '#233350',
    textSecondary: '#A8B2C5',

    // ========================================
    // GYM CONNECT BRAND COLORS
    // ========================================

    navy: '#14213D',
    marigold: '#FCA311',

    // ========================================
    // PRIMARY BUTTONS
    // ========================================

    primary: '#FCA311',
    onPrimary: '#14213D',

    // ========================================
    // CHECK OUT BUTTON
    // ========================================

    checkOutBackground: '#30466C',
    checkOutText: '#FFFFFF',

    // ========================================
    // SELECTED BRANCH
    // ========================================

    selectedBorder: '#FCA311',

    // ========================================
    // PREFERRED BRANCH BADGE
    // ========================================

    preferredBackground: '#FCA311',
    preferredText: '#14213D',

    // ========================================
    // STATUS COLORS
    // ========================================

    success: '#4ADE80',
    error: '#FCA5A5',

    // ========================================
    // ADDITIONAL TEAM THEME COLORS
    // ========================================

    // Hero / header sections
    hero: '#14213D',
    heroText: '#FFFFFF',
    heroSubtext: '#A8B2C5',
    heroChip: '#233350',

    // Accent colors
    accent: '#FCA311',
    onAccent: '#14213D',
    accentText: '#FCA311',
    accentSoft: '#30405B',

    // Borders
    border: '#30466C',

    // Destructive actions and errors
    danger: '#FCA5A5',
    onDanger: '#14213D',
    dangerSoft: '#4A2934',

    // Modal / bottom sheet backdrop
    backdrop: 'rgba(0, 0, 0, 0.65)',

    //success
    successSoft: '#1B3D35',
  },
} as const;

// Shared color type for all components
export type ThemeColor =
  keyof typeof Colors.light &
  keyof typeof Colors.dark;

// ========================================
// FONTS
// ========================================

export const Fonts = Platform.select({
  ios: {
    /** iOS UIFontDescriptorSystemDesignDefault */
    sans: 'system-ui',

    /** iOS UIFontDescriptorSystemDesignSerif */
    serif: 'ui-serif',

    /** iOS UIFontDescriptorSystemDesignRounded */
    rounded: 'ui-rounded',

    /** iOS UIFontDescriptorSystemDesignMonospaced */
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

// ========================================
// SPACING
// ========================================

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

// ========================================
// LAYOUT CONSTANTS
// ========================================

export const BottomTabInset =
  Platform.select({
    ios: 50,
    android: 80,
  }) ?? 0;

export const MaxContentWidth = 800;

// ========================================
// WEB INPUT OUTLINE
// ========================================

/**
 * Web only:
 * Hides the browser's own focus ring on text inputs.
 * Screens show focus with the border instead.
 *
 * React Native's types don't list 'none',
 * but react-native-web supports it.
 */
export const NoWebOutline = (
  Platform.OS === 'web'
    ? { outlineStyle: 'none' }
    : {}
) as unknown as TextStyle;
