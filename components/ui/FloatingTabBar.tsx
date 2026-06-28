import { Pressable, StyleSheet, View } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

export const FLOATING_TAB_BAR_HEIGHT = 60;

export function useFloatingTabBarInset() {
  const insets = useSafeAreaInsets();
  return FLOATING_TAB_BAR_HEIGHT + Math.max(insets.bottom, Spacing.md) + Spacing.lg;
}

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const barBackground = colors.surfaceAlt;
  const iconColor = colors.ink;
  const bottomOffset = Math.max(insets.bottom, Spacing.md);

  return (
    <View style={[styles.wrapper, { paddingBottom: bottomOffset }]} pointerEvents="box-none">
      <View
        style={[
          styles.bar,
          { backgroundColor: barBackground },
          isDark
            ? { borderWidth: 1, borderColor: colors.border }
            : {
                shadowColor: colors.ink,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.18,
                shadowRadius: 16,
                elevation: 12,
              },
        ]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          const icon = options.tabBarIcon?.({
            focused: isFocused,
            color: iconColor,
            size: 24,
          });

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? options.title}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tab}>
              <View style={{ opacity: isFocused ? 1 : 0.5 }}>{icon}</View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.lg,
    backgroundColor: 'transparent',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: FLOATING_TAB_BAR_HEIGHT,
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
});
