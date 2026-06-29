import { useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { FlatColors, FontSize, Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface ScrollNumberPickerProps {
  values: number[];
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
}

const ITEM_HEIGHT = 48;

function createStyles(colors: FlatColors) {
  return StyleSheet.create({
    container: {
      height: ITEM_HEIGHT * 5,
      overflow: 'hidden',
    },
    highlight: {
      position: 'absolute',
      top: ITEM_HEIGHT * 2,
      left: 0,
      right: 0,
      height: ITEM_HEIGHT,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
      zIndex: 1,
    },
    item: {
      height: ITEM_HEIGHT,
      alignItems: 'center',
      justifyContent: 'center',
    },
    itemText: {
      fontFamily: Fonts.body,
      fontSize: FontSize.lg,
      color: colors.inkSecondary,
      opacity: 0.45,
    },
    itemTextSelected: {
      fontFamily: Fonts.headlineBold,
      fontSize: FontSize.xl,
      color: colors.ink,
      opacity: 1,
    },
    underline: {
      position: 'absolute',
      bottom: 8,
      width: 40,
      height: 2,
      backgroundColor: colors.primary,
      borderRadius: 1,
    },
  });
}

export function ScrollNumberPicker({ values, value, onChange, suffix }: ScrollNumberPickerProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const idx = Math.max(0, values.indexOf(value));
    if (idx < 0) return;

    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: idx * ITEM_HEIGHT, animated: false });
    });
  }, [value, values]);

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const clamped = Math.min(Math.max(i, 0), values.length - 1);
    onChange(values[clamped]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.highlight} pointerEvents="none" />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        nestedScrollEnabled
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
        onMomentumScrollEnd={onScrollEnd}
        onScrollEndDrag={onScrollEnd}>
        {values.map((item) => {
          const isSelected = item === value;
          return (
            <View key={item} style={styles.item}>
              <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
                {item}
                {suffix ?? ''}
              </Text>
              {isSelected && <View style={styles.underline} />}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
