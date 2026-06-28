import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BorderRadius, FontSize, Fonts, Spacing } from '@/constants/theme';
import { ThemePreference } from '@/store/themeStore';
import { useTheme } from '@/hooks/useTheme';

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export function ThemeSegmentControl() {
  const { colors, preference, setPreference } = useTheme();

  return (
    <View style={[styles.track, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {OPTIONS.map((option) => {
        const active = preference === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.segment, active && { backgroundColor: colors.primary }]}
            onPress={() => void setPreference(option.value)}
            activeOpacity={0.85}>
            <Text
              style={[
                styles.segmentText,
                { color: colors.inkSecondary },
                active && { color: colors.onPrimary },
              ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.pill,
    alignItems: 'center',
  },
  segmentText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.sm,
  },
});
