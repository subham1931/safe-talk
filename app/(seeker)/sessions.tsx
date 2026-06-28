import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FlatColors, FontSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

function createStyles(colors: FlatColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: Spacing.lg, paddingTop: 60 },
    title: { fontSize: FontSize.xxl, fontWeight: '800', color: colors.text },
    empty: { fontSize: FontSize.md, color: colors.textSecondary, marginTop: Spacing.xl, textAlign: 'center' },
  });
}

export default function SessionsTabScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Session History</Text>
      <Text style={styles.empty}>Your past sessions will appear here.</Text>
    </View>
  );
}
