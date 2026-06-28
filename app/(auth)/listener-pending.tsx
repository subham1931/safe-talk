import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { FlatColors, Spacing, TypographyTokens } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

function createStyles(colors: FlatColors, typography: TypographyTokens) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing.xl,
    },
    gradient: {
      ...StyleSheet.absoluteFillObject,
    },
    emoji: { fontSize: 64, marginBottom: Spacing.lg },
    title: { ...typography.headlineLarge, textAlign: 'center' },
    subtitle: { ...typography.body, color: colors.inkSecondary, textAlign: 'center', marginTop: Spacing.md },
    note: { ...typography.caption, textAlign: 'center', marginTop: Spacing.lg },
  });
}

export default function ListenerPendingScreen() {
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.sunsetStart + '66', colors.sunsetEnd + '44', colors.background]}
        style={styles.gradient}
      />
      <Text style={styles.emoji}>⏳</Text>
      <Text style={styles.title}>Application under review</Text>
      <Text style={styles.subtitle}>
        Thank you for applying to become a Listener. Our team will review your application within 2-3 business days.
      </Text>
      <Text style={styles.note}>
        You will receive a notification once your application is approved. In the meantime, you can explore safeTalk as a Seeker.
      </Text>
      <Button title="Back to Home" onPress={() => router.replace('/(seeker)')} size="lg" style={{ marginTop: Spacing.xl }} />
    </View>
  );
}
