import { useMemo } from 'react';
import { FlatColors } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

export function useThemedStyles<T>(createStyles: (colors: FlatColors) => T): T {
  const { colors } = useTheme();
  return useMemo(() => createStyles(colors), [colors]);
}
