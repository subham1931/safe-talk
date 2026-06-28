import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@/components/ui/Button';
import { FlatColors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency } from '@/utils/helpers';
import { useTheme } from '@/hooks/useTheme';

function createStyles(colors: FlatColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: Spacing.lg, paddingTop: 60 },
    title: { fontSize: FontSize.xxl, fontWeight: '800', color: colors.text, marginBottom: Spacing.lg },
    balanceCard: {
      backgroundColor: colors.secondary,
      borderRadius: BorderRadius.lg,
      padding: Spacing.xl,
      marginBottom: Spacing.xl,
    },
    balanceLabel: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)' },
    balanceAmount: { fontSize: 36, fontWeight: '800', color: colors.onSecondary, marginTop: Spacing.sm },
    sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: colors.text },
    empty: { fontSize: FontSize.md, color: colors.textSecondary, marginTop: Spacing.lg },
    stub: { textAlign: 'center', fontSize: FontSize.sm, color: colors.textLight, marginTop: Spacing.md },
  });
}

export default function ListenerEarningsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const profile = useAuthStore((s) => s.profile);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Earnings</Text>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceAmount}>{formatCurrency(profile?.wallet_balance ?? 0)}</Text>
      </View>

      <Text style={styles.sectionTitle}>Payout History</Text>
      <Text style={styles.empty}>No payouts yet.</Text>

      <Button title="Request Payout" onPress={() => {}} variant="outline" style={{ marginTop: Spacing.xl }} />
      <Text style={styles.stub}>Payout integration coming soon</Text>
    </View>
  );
}
