/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useTheme } from '@/hooks/useTheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: 'text' | 'background' | 'icon' | 'tint'
) {
  const { colors, isDark } = useTheme();
  const theme = isDark ? 'dark' : 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  }

  switch (colorName) {
    case 'text':
      return colors.text;
    case 'background':
      return colors.background;
    case 'icon':
    case 'tint':
      return colors.primary;
    default:
      return colors.text;
  }
}
