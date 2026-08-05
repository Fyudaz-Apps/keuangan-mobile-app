/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppStore } from '@/store/appStore';

export type Theme = (typeof Colors)[keyof typeof Colors];

export function useTheme(): Theme {
  const storeTheme = useAppStore((s) => s.theme);
  const scheme = useColorScheme();
  const theme = storeTheme === 'system' ? (scheme === 'dark' ? 'dark' : 'light') : storeTheme;
  return Colors[theme];
}
