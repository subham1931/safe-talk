import { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FlatColors, FontSize, Spacing, Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface CircleToggleOption {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface CircleToggleProps {
  options: CircleToggleOption[];
  value: string;
  onChange: (value: string) => void;
}

function createStyles(colors: FlatColors) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: Spacing.lg,
    },
    item: {
      alignItems: 'center',
      gap: Spacing.sm,
    },
    circle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    circleDefault: {
      backgroundColor: colors.disabled,
    },
    circleSelected: {
      backgroundColor: colors.secondary,
    },
    label: {
      fontFamily: Fonts.bodyMedium,
      fontSize: FontSize.sm,
      color: colors.inkSecondary,
    },
    labelSelected: {
      color: colors.secondary,
      fontFamily: Fonts.bodySemiBold,
    },
  });
}

export function CircleToggle({ options, value, onChange }: CircleToggleProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      {options.map((opt) => {
        const selected = value === opt.id;
        return (
          <TouchableOpacity
            key={opt.id}
            style={styles.item}
            onPress={() => onChange(opt.id)}
            activeOpacity={0.85}>
            <View style={[styles.circle, selected ? styles.circleSelected : styles.circleDefault]}>
              <Ionicons
                name={opt.icon}
                size={28}
                color={selected ? colors.onSecondary : colors.inkSecondary}
              />
            </View>
            <Text style={[styles.label, selected && styles.labelSelected]}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
