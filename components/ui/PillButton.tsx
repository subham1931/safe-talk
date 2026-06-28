import { ReactNode, useMemo } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { BorderRadius, FlatColors, FontSize, Spacing, Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface PillButtonProps {
  title: string;
  onPress: () => void;
  /** primary = bright fill, secondary = outline, tertiary = subtle fill */
  variant?: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  style?: ViewStyle;
}

function createStyles(colors: FlatColors) {
  return StyleSheet.create({
    base: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: BorderRadius.pill,
      gap: Spacing.sm,
    },
    primary: { backgroundColor: colors.actionPrimaryFill },
    secondary: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.actionSecondaryBorder,
    },
    tertiary: { backgroundColor: colors.actionTertiaryFill },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.actionSecondaryBorder,
    },
    ghost: { backgroundColor: 'transparent' },
    danger: { backgroundColor: colors.error },
    size_sm: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
    size_md: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg },
    size_lg: { paddingVertical: Spacing.md + 2, paddingHorizontal: Spacing.xl, minHeight: 52 },
    disabled: { opacity: 0.5 },
    text: {
      fontSize: FontSize.md,
      fontFamily: Fonts.bodySemiBold,
    },
    text_primary: { color: colors.actionPrimaryText },
    text_secondary: { color: colors.actionSecondaryBorder },
    text_tertiary: { color: colors.actionTertiaryText },
    text_outline: { color: colors.actionSecondaryBorder },
    text_ghost: { color: colors.ink },
    text_danger: { color: colors.onPrimary },
  });
}

function resolveVariant(variant: PillButtonProps['variant']) {
  return variant === 'outline' ? 'secondary' : variant ?? 'primary';
}

export function PillButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  icon,
  style,
}: PillButtonProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const resolved = resolveVariant(variant);
  const isDisabled = disabled || loading;

  const spinnerColor =
    resolved === 'primary'
      ? colors.actionPrimaryText
      : resolved === 'danger'
        ? colors.onPrimary
        : resolved === 'secondary'
          ? colors.actionSecondaryBorder
          : colors.actionTertiaryText;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[resolved],
        styles[`size_${size}`],
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}>
      {loading ? (
        <ActivityIndicator color={spinnerColor} />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, styles[`text_${resolved}`] as TextStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
