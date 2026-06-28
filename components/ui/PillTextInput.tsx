import { ReactNode, useMemo, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  Text,
} from 'react-native';
import { BorderRadius, FlatColors, FontSize, Spacing, Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface PillTextInputProps extends TextInputProps {
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  containerStyle?: ViewStyle;
  label?: string;
}

function createStyles(colors: FlatColors) {
  return StyleSheet.create({
    label: {
      fontFamily: Fonts.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.ink,
      marginBottom: Spacing.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.pill,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: Spacing.md,
      minHeight: 52,
    },
    rowFocused: {
      borderColor: colors.primary,
    },
    input: {
      flex: 1,
      fontFamily: Fonts.body,
      fontSize: FontSize.md,
      color: colors.ink,
      paddingVertical: Spacing.md,
    },
    slot: {
      marginHorizontal: Spacing.xs,
    },
  });
}

export function PillTextInput({
  leftSlot,
  rightSlot,
  containerStyle,
  label,
  style,
  onFocus,
  onBlur,
  ...props
}: PillTextInputProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [focused, setFocused] = useState(false);

  return (
    <View style={containerStyle}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.row, focused && styles.rowFocused]}>
        {leftSlot && <View style={styles.slot}>{leftSlot}</View>}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.inkSecondary}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
        {rightSlot && <View style={styles.slot}>{rightSlot}</View>}
      </View>
    </View>
  );
}
