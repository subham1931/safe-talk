import { useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OnboardingHero } from '@/components/OnboardingHero';
import { ONBOARDING_SLIDES } from '@/constants/onboardingSlides';
import { FlatColors, FontSize, Spacing, BorderRadius, TypographyTokens, Fonts } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';

const { width } = Dimensions.get('window');

function createStyles(colors: FlatColors, typography: TypographyTokens) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    skipBtn: {
      position: 'absolute',
      right: Spacing.lg,
      zIndex: 10,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
    },
    skipText: {
      fontFamily: Fonts.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.inkSecondary,
    },
    slide: {
      flex: 1,
      paddingHorizontal: Spacing.lg,
    },
    heroWrap: {
      flex: 1,
      justifyContent: 'center',
      paddingTop: Spacing.md,
    },
    textBlock: {
      paddingHorizontal: Spacing.sm,
      marginBottom: Spacing.lg,
    },
    title: {
      ...typography.headlineLarge,
      textAlign: 'left',
      marginBottom: Spacing.sm,
    },
    subtitle: {
      ...typography.body,
      color: colors.inkSecondary,
      textAlign: 'left',
      lineHeight: 24,
    },
    footer: {
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.lg,
    },
    dots: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: Spacing.sm,
      marginBottom: Spacing.lg,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.border,
    },
    dotActive: {
      backgroundColor: colors.primary,
      width: 28,
    },
    continueBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.ink,
      borderRadius: BorderRadius.pill,
      paddingVertical: Spacing.md + 2,
      paddingHorizontal: Spacing.xl,
      minHeight: 56,
    },
    continueText: {
      fontFamily: Fonts.bodySemiBold,
      fontSize: FontSize.md,
      color: colors.background,
    },
  });
}

export default function OnboardingScreen() {
  const { colors, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const setHasSeenOnboarding = useAuthStore((s) => s.setHasSeenOnboarding);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const finishOnboarding = () => {
    setHasSeenOnboarding(true);
    router.replace('/(auth)/phone');
  };

  const goNext = () => {
    if (currentIndex === ONBOARDING_SLIDES.length - 1) {
      finishOnboarding();
      return;
    }
    flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
  };

  const isLast = currentIndex === ONBOARDING_SLIDES.length - 1;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <TouchableOpacity style={[styles.skipBtn, { top: insets.top + Spacing.sm }]} onPress={finishOnboarding}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={styles.heroWrap}>
              <OnboardingHero slide={item} />
            </View>
            <View style={styles.textBlock}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {ONBOARDING_SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
          ))}
        </View>

        <TouchableOpacity style={styles.continueBtn} onPress={goNext} activeOpacity={0.85}>
          <Text style={styles.continueText}>{isLast ? 'Get Started' : 'Continue'}</Text>
          <Ionicons name="arrow-forward" size={22} color={colors.background} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
