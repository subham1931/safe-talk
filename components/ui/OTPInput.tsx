import { useRef, useEffect, useMemo } from 'react';
import { View, TextInput, StyleSheet, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';
import { BorderRadius, FlatColors, FontSize, Spacing, Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
}

function createStyles(colors: FlatColors) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: Spacing.sm,
      marginBottom: Spacing.lg,
    },
    cellWrap: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    cell: {
      width: 48,
      height: 56,
      borderRadius: BorderRadius.md,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      textAlign: 'center',
      fontSize: FontSize.xl,
      fontFamily: Fonts.headlineBold,
      color: colors.ink,
    },
    cellFilled: {
      borderColor: colors.primary,
    },
    separator: {
      width: 12,
      height: 2,
      backgroundColor: colors.border,
      marginRight: Spacing.sm,
      borderRadius: 1,
    },
  });
}

export function OTPInput({ length = 6, value, onChange }: OTPInputProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const inputs = useRef<(TextInput | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const updateDigit = (index: number, char: string) => {
    const next = [...digits];
    next[index] = char;
    onChange(next.join('').slice(0, length));
    if (char && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const onKeyPress = (index: number, e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.row}>
      {digits.map((digit, index) => (
        <View key={index} style={styles.cellWrap}>
          {index === 3 && length > 4 && <View style={styles.separator} />}
          <TextInput
            ref={(ref) => {
              inputs.current[index] = ref;
            }}
            style={[styles.cell, digit !== '' && styles.cellFilled]}
            value={digit}
            onChangeText={(text) => {
              const char = text.replace(/\D/g, '').slice(-1);
              updateDigit(index, char);
            }}
            onKeyPress={(e) => onKeyPress(index, e)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
          />
        </View>
      ))}
    </View>
  );
}
