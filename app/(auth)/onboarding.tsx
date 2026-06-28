import { useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { AVATARS, getAvatarBackground } from '@/constants/avatars';
import { FlatColors, FontSize, Spacing, BorderRadius, TypographyTokens } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Talk freely, stay anonymous',
    subtitle: 'Share what is on your mind without revealing who you are.',
  },
  {
    id: '2',
    title: 'Chat, call, or video',
    subtitle: 'Connect with caring listeners via text, voice, or video — your choice.',
  },
  {
    id: '3',
    title: 'Judgment-free support',
    subtitle: 'Vetted listeners who have been through tough times and are here for you.',
  },
  {
    id: '4',
    title: 'Your safe space',
    subtitle: 'Pay only for the time you use. Block and report anytime.',
  },
];

function createCollageStyles(colors: FlatColors) {
  return StyleSheet.create({
    wrap: { width: 160, height: 120, marginBottom: Spacing.xl, alignSelf: 'center' },
    circle: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: colors.surface,
    },
  });
}

function AvatarCollage() {
  const { colors, isDark } = useTheme();
  const collageStyles = useMemo(() => createCollageStyles(colors), [colors]);
  const items = AVATARS.slice(0, 4);
  const offsets = [
    { top: 0, left: 20, size: 64 },
    { top: 10, left: 70, size: 72 },
    { top: 40, left: 0, size: 56 },
    { top: 50, left: 80, size: 60 },
  ];

  return (
    <View style={collageStyles.wrap}>
      {items.map((avatar, i) => (
        <View
          key={avatar.id}
          style={[
            collageStyles.circle,
            {
              top: offsets[i].top,
              left: offsets[i].left,
              width: offsets[i].size,
              height: offsets[i].size,
              borderRadius: offsets[i].size / 2,
              backgroundColor: getAvatarBackground(avatar.id, isDark),
            },
          ]}>
          <Text style={{ fontSize: offsets[i].size * 0.42 }}>{avatar.emoji}</Text>
        </View>
      ))}
    </View>
  );
}

function createStyles(colors: FlatColors, typography: TypographyTokens) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    slide: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.xl,
    },
    title: { ...typography.headlineLarge, textAlign: 'center', marginBottom: Spacing.md },
    subtitle: { ...typography.body, color: colors.inkSecondary, textAlign: 'center' },
    footer: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
    dots: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm, marginBottom: Spacing.lg },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
    dotActive: { backgroundColor: colors.primary, width: 24 },
  });
}

export default function OnboardingScreen() {
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const setHasSeenOnboarding = useAuthStore((s) => s.setHasSeenOnboarding);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const handleGetStarted = () => {
    setHasSeenOnboarding(true);
    router.replace('/(auth)/phone');
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <AvatarCollage />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
          ))}
        </View>

        {currentIndex === SLIDES.length - 1 ? (
          <Button title="Get Started" onPress={handleGetStarted} size="lg" />
        ) : (
          <Button
            title="Next"
            onPress={() => flatListRef.current?.scrollToIndex({ index: currentIndex + 1 })}
            size="lg"
          />
        )}
      </View>
    </View>
  );
}
