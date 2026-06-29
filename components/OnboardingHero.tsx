import { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { HeroElement, OnboardingSlide } from '@/constants/onboardingSlides';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_WIDTH = SCREEN_WIDTH - 48;
const HERO_HEIGHT = 280;

function createStyles() {
  return StyleSheet.create({
    hero: {
      width: HERO_WIDTH,
      height: HERO_HEIGHT,
      alignSelf: 'center',
      borderRadius: 28,
      overflow: 'hidden',
      marginBottom: 32,
    },
    blob: {
      position: 'absolute',
      borderRadius: 999,
    },
    blobLarge: {
      width: 220,
      height: 220,
      top: -40,
      right: -60,
    },
    blobMedium: {
      width: 140,
      height: 140,
      bottom: -30,
      left: -40,
    },
    blobSmall: {
      width: 90,
      height: 90,
      top: 60,
      left: 20,
    },
    element: {
      position: 'absolute',
    },
    avatar: {
      borderWidth: 3,
      borderColor: '#FFFFFF',
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 8,
      elevation: 6,
    },
    iconBadge: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 999,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4,
    },
    emojiBadge: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 999,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4,
    },
  });
}

function HeroElementView({ element }: { element: HeroElement }) {
  const styles = useMemo(() => createStyles(), []);
  const left = (element.left / 100) * HERO_WIDTH;
  const top = (element.top / 100) * HERO_HEIGHT;
  const rotate = element.rotate ?? '0deg';

  if (element.type === 'avatar') {
    const size = element.size;
    return (
      <View
        style={[
          styles.element,
          styles.avatar,
          {
            top,
            left,
            width: size,
            height: size,
            borderRadius: size / 2,
            transform: [{ rotate }],
          },
        ]}>
        <Image source={{ uri: element.uri }} style={{ width: size, height: size }} contentFit="cover" />
      </View>
    );
  }

  if (element.type === 'icon') {
    const badgeSize = element.size + 24;
    return (
      <View
        style={[
          styles.element,
          styles.iconBadge,
          {
            top,
            left,
            width: badgeSize,
            height: badgeSize,
            backgroundColor: element.bg,
            transform: [{ rotate }],
          },
        ]}>
        <Ionicons name={element.name} size={element.size} color={element.color} />
      </View>
    );
  }

  const badgeSize = element.size + 20;
  return (
    <View
      style={[
        styles.element,
        styles.emojiBadge,
        {
          top,
          left,
          width: badgeSize,
          height: badgeSize,
          backgroundColor: element.bg,
          transform: [{ rotate }],
        },
      ]}>
      <Text style={{ fontSize: element.size }}>{element.emoji}</Text>
    </View>
  );
}

export function OnboardingHero({ slide }: { slide: OnboardingSlide }) {
  const styles = useMemo(() => createStyles(), []);

  return (
    <View style={styles.hero}>
      <LinearGradient colors={slide.gradient} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
      <View style={[styles.blob, styles.blobLarge, { backgroundColor: slide.blobColor }]} />
      <View style={[styles.blob, styles.blobMedium, { backgroundColor: slide.blobColor }]} />
      <View style={[styles.blob, styles.blobSmall, { backgroundColor: slide.blobColor }]} />
      {slide.elements.map((element, index) => (
        <HeroElementView key={`${slide.id}-${index}`} element={element} />
      ))}
    </View>
  );
}
