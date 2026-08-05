/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0B0F19',
    background: '#ffffff',
    backgroundElement: '#EFF1F6',
    backgroundSelected: '#E2E6EE',
    textSecondary: '#4A5161',
    screen: '#F5F6FA',
    card: '#ffffff',
    textMuted: '#98A0B3',
    border: '#E6E8EF',
    primary: '#208AEF',
    success: '#22C55E',
    danger: '#EF4444',
    chipBg: '#F4F6FA',
  },
  dark: {
    text: '#F5F7FB',
    background: '#0B0E14',
    backgroundElement: '#1C2230',
    backgroundSelected: '#2A3140',
    textSecondary: '#B6BDCC',
    screen: '#0B0E14',
    card: '#151A23',
    textMuted: '#828A9C',
    border: '#242A36',
    primary: '#3B9DFF',
    success: '#34D399',
    danger: '#F87171',
    chipBg: '#1E2430',
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
