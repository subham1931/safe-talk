import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { Fonts, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { getListenerProfile } from '@/services/listener/ListenerService';

const SPLASH_BLACK = '#000000';
const WORDMARK_WHITE = '#FFFFFF';
const TAGLINE_MUTED = '#9A9AA1';

const WORDMARK_DURATION = 650;
const TAGLINE_DELAY = 150;
const TAGLINE_DURATION = 400;
const HOLD_AFTER_VISIBLE = 500;
const ANIMATION_COMPLETE_MS = WORDMARK_DURATION + HOLD_AFTER_VISIBLE;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SPLASH_BLACK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontFamily: Fonts.headlineExtra,
    fontSize: 44,
    color: WORDMARK_WHITE,
    letterSpacing: -1,
  },
  tagline: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: TAGLINE_MUTED,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
});

export default function SplashScreen() {
  const { isLoading, isAuthenticated, profile, hasSeenOnboarding } = useAuthStore();
  const [animationComplete, setAnimationComplete] = useState(false);

  const wordmarkOpacity = useSharedValue(0);
  const wordmarkScale = useSharedValue(0.92);
  const taglineOpacity = useSharedValue(0);

  useEffect(() => {
    const easing = Easing.out(Easing.cubic);

    wordmarkOpacity.value = withTiming(1, { duration: WORDMARK_DURATION, easing });
    wordmarkScale.value = withTiming(1, { duration: WORDMARK_DURATION, easing });
    taglineOpacity.value = withDelay(
      TAGLINE_DELAY,
      withTiming(1, { duration: TAGLINE_DURATION, easing })
    );

    const timer = setTimeout(() => setAnimationComplete(true), ANIMATION_COMPLETE_MS);
    return () => clearTimeout(timer);
  }, [wordmarkOpacity, wordmarkScale, taglineOpacity]);

  useEffect(() => {
    if (isLoading || !animationComplete) return;

    (async () => {
      if (!isAuthenticated) {
        router.replace(hasSeenOnboarding ? '/(auth)/phone' : '/(auth)/onboarding');
        return;
      }

      if (!profile?.onboarding_complete) {
        router.replace('/(auth)/role');
        return;
      }

      if (profile.role === 'listener') {
        const listenerProfile = await getListenerProfile(profile.id);
        if (listenerProfile?.status === 'pending') {
          router.replace('/(auth)/listener-pending');
        } else {
          router.replace('/(listener)');
        }
      } else {
        router.replace('/(seeker)');
      }
    })();
  }, [isLoading, animationComplete, isAuthenticated, profile, hasSeenOnboarding]);

  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: wordmarkOpacity.value,
    transform: [{ scale: wordmarkScale.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, wordmarkStyle]}>
        <Text style={styles.title}>safeTalk</Text>
        <Animated.Text style={[styles.tagline, taglineStyle]}>
          Anonymous. Safe. Heard.
        </Animated.Text>
      </Animated.View>
    </View>
  );
}
