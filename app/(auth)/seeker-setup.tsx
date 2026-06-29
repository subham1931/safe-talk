import { useMemo } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SeekerProfileForm } from '@/components/SeekerProfileForm';
import { DecorativeDashedCircles } from '@/components/ui/DecorativeDashedCircles';
import { FlatColors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

function createStyles(colors: FlatColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, overflow: 'hidden' },
    content: { padding: Spacing.lg, paddingTop: 60, paddingBottom: Spacing.xxl },
  });
}

export default function SeekerSetupScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} nestedScrollEnabled>
      <DecorativeDashedCircles tone="plum" />
      <SeekerProfileForm mode="setup" onSaved={() => router.replace('/(seeker)')} />
    </ScrollView>
  );
}
