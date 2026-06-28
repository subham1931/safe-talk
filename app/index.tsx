import { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { FlatColors, FontSize, Spacing, Fonts } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';

function createStyles(colors: FlatColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoContainer: { alignItems: 'center' },
    logoCircle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: 'rgba(255,255,255,0.25)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.lg,
    },
    logoEmoji: { fontSize: 48 },
    title: {
      fontFamily: Fonts.headlineExtra,
      fontSize: FontSize.hero,
      color: colors.onPrimary,
      letterSpacing: -0.5,
    },
    tagline: {
      fontFamily: Fonts.body,
      fontSize: FontSize.md,
      color: 'rgba(255,255,255,0.9)',
      marginTop: Spacing.sm,
    },
  });
}

export default function SplashScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { isLoading, isAuthenticated, profile, hasSeenOnboarding } = useAuthStore();
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        router.replace(hasSeenOnboarding ? '/(auth)/phone' : '/(auth)/onboarding');
        return;
      }

      if (!profile?.onboarding_complete) {
        router.replace('/(auth)/role');
        return;
      }

      if (profile.role === 'listener') {
        router.replace('/(listener)');
      } else {
        router.replace('/(seeker)');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, profile, hasSeenOnboarding]);

  return (
    <LinearGradient
      colors={[colors.sunsetStart, colors.sunsetEnd, colors.background]}
      locations={[0, 0.55, 1]}
      style={styles.container}>
      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim }]}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🛡️</Text>
        </View>
        <Text style={styles.title}>safeTalk</Text>
        <Text style={styles.tagline}>Anonymous. Safe. Heard.</Text>
      </Animated.View>
    </LinearGradient>
  );
}
