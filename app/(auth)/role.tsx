import { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FlatColors, Spacing, BorderRadius, TypographyTokens, createElevation } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

function createStyles(
  colors: FlatColors,
  typography: TypographyTokens,
  elevation: ReturnType<typeof createElevation>
) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: Spacing.lg, paddingTop: 80 },
    title: { ...typography.headlineLarge, marginBottom: Spacing.sm },
    subtitle: { ...typography.caption, marginBottom: Spacing.xl },
    card: {
      ...elevation.soft,
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: BorderRadius.card,
      padding: Spacing.lg,
      marginBottom: Spacing.md,
    },
    iconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconCircleSeeker: { backgroundColor: colors.primary + '18' },
    iconCircleListener: { backgroundColor: colors.secondary + '18' },
    cardContent: { flex: 1, marginHorizontal: Spacing.md },
    cardTitle: { ...typography.headlineSmall },
    cardSubtitle: { ...typography.caption, marginTop: 4 },
  });
}

export default function RoleSelectionScreen() {
  const { colors, typography, elevation } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, typography, elevation),
    [colors, typography, elevation]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How would you like to use safeTalk?</Text>
      <Text style={styles.subtitle}>You can only choose one role per account</Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push('/(auth)/seeker-setup')}
        activeOpacity={0.85}>
        <View style={[styles.iconCircle, styles.iconCircleSeeker]}>
          <Ionicons name="heart" size={32} color={colors.primary} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>I need someone to talk to</Text>
          <Text style={styles.cardSubtitle}>
            Browse listeners, chat or call anonymously, pay per minute
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={colors.inkSecondary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push('/(auth)/listener-onboarding')}
        activeOpacity={0.85}>
        <View style={[styles.iconCircle, styles.iconCircleListener]}>
          <Ionicons name="headset" size={32} color={colors.secondary} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>I want to become a Listener</Text>
          <Text style={styles.cardSubtitle}>
            Help others, earn per minute, flexible online hours
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={colors.inkSecondary} />
      </TouchableOpacity>
    </View>
  );
}
