import { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { BorderRadius, FlatColors, FontSize, Spacing, Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface BadgeProps {
  label: string;
  /** filled = language chips, outlined = specialty chips */
  chipStyle?: 'filled' | 'outlined';
  color?: string;
  style?: ViewStyle;
}

function createStyles(colors: FlatColors, chipStyle: 'filled' | 'outlined') {
  const isFilled = chipStyle === 'filled';

  return StyleSheet.create({
    badge: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.full,
      backgroundColor: isFilled ? colors.chipLanguageFill : 'transparent',
      borderWidth: isFilled ? 0 : 1,
      borderColor: isFilled ? 'transparent' : colors.chipSpecialtyBorder,
    },
    text: {
      fontSize: FontSize.xs,
      fontFamily: Fonts.bodySemiBold,
      color: isFilled ? colors.chipLanguageText : colors.chipSpecialtyText,
    },
  });
}

export function Badge({ label, chipStyle = 'filled', color, style }: BadgeProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors, chipStyle), [colors, chipStyle]);

  if (color) {
    return (
      <View style={[styles.badge, { backgroundColor: color + '20' }, style]}>
        <Text style={[styles.text, { color }]}>{label}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, style]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}
