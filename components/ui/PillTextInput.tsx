import { ReactNode, useMemo, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, FlatColors, FontSize, Spacing, Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface PillTextInputProps extends TextInputProps {
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  containerStyle?: ViewStyle;
  label?: string;
  showPasswordToggle?: boolean;
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
  secureTextEntry,
  showPasswordToggle,
  ...props
}: PillTextInputProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [focused, setFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const isSecure = Boolean(secureTextEntry && !passwordVisible);
  const passwordToggle =
    showPasswordToggle && secureTextEntry ? (
      <TouchableOpacity
        onPress={() => setPasswordVisible((v) => !v)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'}>
        <Ionicons
          name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
          size={22}
          color={colors.inkSecondary}
        />
      </TouchableOpacity>
    ) : null;

  return (
    <View style={containerStyle}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.row, focused && styles.rowFocused]}>
        {leftSlot && <View style={styles.slot}>{leftSlot}</View>}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.inkSecondary}
          secureTextEntry={isSecure}
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
        {passwordToggle && <View style={styles.slot}>{passwordToggle}</View>}
        {rightSlot && <View style={styles.slot}>{rightSlot}</View>}
      </View>
    </View>
  );
}
