import { useMemo } from 'react';
import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { useTheme } from '@/hooks/useTheme';
import { FontSize } from '@/constants/theme';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const { colors } = useTheme();
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const styles = useMemo(() => createStyles(colors.primary), [colors.primary]);

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

function createStyles(linkColor: string) {
  return StyleSheet.create({
    default: {
      fontSize: 16,
      lineHeight: 24,
    },
    defaultSemiBold: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '600',
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      lineHeight: 32,
    },
    subtitle: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    link: {
      lineHeight: 30,
      fontSize: FontSize.md,
      color: linkColor,
    },
  });
}
