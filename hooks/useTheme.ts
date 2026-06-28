import { useColorScheme } from 'react-native';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import {
  AppTheme,
  FlatColors,
  Fonts,
  TypographyTokens,
  createElevation,
  createTypography,
  darkTheme,
  flattenThemeColors,
  lightTheme,
} from '@/constants/theme';
import { ThemePreference, useThemeStore } from '@/store/themeStore';

type ResolvedColorScheme = 'light' | 'dark';

export function getStackHeaderOptions(
  colors: FlatColors,
  isDark: boolean,
  title?: string
): NativeStackNavigationOptions {
  return {
    headerShown: true,
    title,
    headerTintColor: colors.ink,
    headerTitleStyle: {
      color: colors.ink,
      fontFamily: Fonts.headlineSemi,
    },
    headerStyle: {
      backgroundColor: colors.surface,
      ...(isDark ? { borderBottomWidth: 1, borderBottomColor: colors.border } : {}),
    },
    headerShadowVisible: !isDark,
  };
}

export function useTheme() {
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);
  const systemScheme = useColorScheme();

  const colorScheme: ResolvedColorScheme =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  const theme: AppTheme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const colors: FlatColors = flattenThemeColors(theme.colors);
  const typography: TypographyTokens = createTypography(colors);
  const elevation = createElevation(colorScheme === 'dark', colors);
  const isDark = colorScheme === 'dark';
  const stackHeaderOptions = getStackHeaderOptions(colors, isDark);

  return {
    theme,
    colors,
    typography,
    elevation,
    isDark,
    colorScheme,
    preference,
    setPreference,
    stackHeaderOptions,
    getStackHeaderOptions: (title?: string) => getStackHeaderOptions(colors, isDark, title),
    toggleTheme: async () => {
      const next: ThemePreference = isDark ? 'light' : 'dark';
      await setPreference(next);
    },
  };
}
