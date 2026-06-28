import { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BorderRadius, FlatColors, FontSize, Spacing, Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface ProgressHeaderProps {
  step: number;
  totalSteps: number;
  onBack?: () => void;
}

function createStyles(colors: FlatColors) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      marginBottom: Spacing.lg,
    },
    backBtn: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    track: {
      flex: 1,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: BorderRadius.full,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: BorderRadius.full,
    },
    stepLabel: {
      fontFamily: Fonts.bodyMedium,
      fontSize: FontSize.sm,
      color: colors.inkSecondary,
      minWidth: 32,
      textAlign: 'right',
    },
  });
}

export function ProgressHeader({ step, totalSteps, onBack }: ProgressHeaderProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const progress = Math.min(step / totalSteps, 1);

  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={onBack ?? (() => router.back())}
        hitSlop={12}>
        <Ionicons name="chevron-back" size={24} color={colors.ink} />
      </TouchableOpacity>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.stepLabel}>
        {step}/{totalSteps}
      </Text>
    </View>
  );
}
