import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';

interface DecorativeDashedCirclesProps {
  tone?: 'orange' | 'plum';
}

export function DecorativeDashedCircles({ tone = 'plum' }: DecorativeDashedCirclesProps) {
  const { theme, isDark } = useTheme();

  const stroke = isDark
    ? theme.colors.brand.orange
    : tone === 'orange'
      ? theme.colors.brand.orange
      : theme.colors.brand.plum;

  const opacities = isDark ? [0.12, 0.1, 0.08] : [0.09, 0.07, 0.05];
  const radii = [120, 180, 240];
  const dashArrays = ['8 8', '10 10', '12 12'];

  return (
    <View style={styles.container} pointerEvents="none">
      <Svg width={320} height={320} viewBox="0 0 320 320">
        {radii.map((r, index) => (
          <Circle
            key={r}
            cx={260 + index * 20}
            cy={260 + index * 20}
            r={r}
            stroke={stroke}
            strokeWidth={1}
            strokeOpacity={opacities[index]}
            strokeDasharray={dashArrays[index]}
            fill="none"
          />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: -80,
    bottom: -80,
    opacity: 1,
  },
});
