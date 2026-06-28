import { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BorderRadius, FlatColors, FontSize, Spacing, Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface RadioRowProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

function createStyles(colors: FlatColors) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: Spacing.md,
      borderRadius: BorderRadius.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: Spacing.sm,
    },
    rowSelected: {
      borderColor: colors.primary,
      borderWidth: 1.5,
    },
    label: {
      fontFamily: Fonts.body,
      fontSize: FontSize.md,
      color: colors.ink,
      flex: 1,
    },
    labelSelected: {
      fontFamily: Fonts.bodySemiBold,
      color: colors.primary,
    },
    radio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioSelected: {
      borderColor: colors.primary,
    },
    radioDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.primary,
    },
  });
}

export function RadioRow({ label, selected, onPress }: RadioRowProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <TouchableOpacity
      style={[styles.row, selected && styles.rowSelected]}
      onPress={onPress}
      activeOpacity={0.85}>
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioDot} />}
      </View>
    </TouchableOpacity>
  );
}
