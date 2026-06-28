import { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, FlatColors, FontSize, Spacing, Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

export interface ChipOption {
  id: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

interface ChipSelectorProps {
  options: ChipOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  multi?: boolean;
  chipStyle?: 'filled' | 'outlined';
}

function createStyles(colors: FlatColors, chipStyle: 'filled' | 'outlined') {
  const isFilled = chipStyle === 'filled';

  return StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.pill,
      backgroundColor: isFilled ? colors.chipLanguageFill : 'transparent',
      borderWidth: isFilled ? 0 : 1,
      borderColor: isFilled ? 'transparent' : colors.chipSpecialtyBorder,
    },
    chipSelected: isFilled
      ? {
          backgroundColor: colors.actionPrimaryFill,
          borderWidth: 0,
        }
      : {
          backgroundColor: 'transparent',
          borderColor: colors.actionSecondaryBorder,
          borderWidth: 1.5,
        },
    chipText: {
      fontFamily: Fonts.bodyMedium,
      fontSize: FontSize.sm,
      color: isFilled ? colors.chipLanguageText : colors.chipSpecialtyText,
    },
    chipTextSelected: isFilled
      ? { color: colors.actionPrimaryText }
      : { color: colors.actionSecondaryBorder },
  });
}

export function ChipSelector({
  options,
  selected,
  onChange,
  multi = true,
  chipStyle = 'filled',
}: ChipSelectorProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors, chipStyle), [colors, chipStyle]);

  const toggle = (id: string) => {
    if (multi) {
      onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
    } else {
      onChange([id]);
    }
  };

  return (
    <View style={styles.wrap}>
      {options.map((opt) => {
        const isSelected = selected.includes(opt.id);
        return (
          <TouchableOpacity
            key={opt.id}
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() => toggle(opt.id)}
            activeOpacity={0.85}>
            {opt.icon && (
              <Ionicons
                name={opt.icon}
                size={14}
                color={
                  isSelected
                    ? chipStyle === 'filled'
                      ? colors.actionPrimaryText
                      : colors.actionSecondaryBorder
                    : chipStyle === 'filled'
                      ? colors.chipLanguageText
                      : colors.chipSpecialtyText
                }
              />
            )}
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
