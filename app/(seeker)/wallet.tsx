import { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { RECHARGE_PACKS } from '@/constants/rechargePacks';
import { FlatColors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import { formatCurrency } from '@/utils/helpers';
import { useTheme } from '@/hooks/useTheme';

function createStyles(colors: FlatColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: Spacing.lg, paddingTop: 60 },
    title: { fontSize: FontSize.xxl, fontWeight: '800', color: colors.text, marginBottom: Spacing.lg },
    balanceCard: {
      backgroundColor: colors.primary,
      borderRadius: BorderRadius.lg,
      padding: Spacing.xl,
      marginBottom: Spacing.xl,
    },
    balanceLabel: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)' },
    balanceAmount: { fontSize: 40, fontWeight: '800', color: colors.onPrimary, marginTop: Spacing.sm },
    sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: colors.text, marginBottom: Spacing.md },
    packGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    packCard: {
      width: '48%',
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    packLabel: { fontSize: FontSize.xs, color: colors.textSecondary },
    packAmount: { fontSize: FontSize.xl, fontWeight: '800', color: colors.text, marginTop: 4 },
    packBonus: { fontSize: FontSize.xs, color: colors.success, fontWeight: '600', marginTop: 2 },
    historyLink: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      marginTop: Spacing.xl,
      padding: Spacing.md,
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.md,
    },
    historyText: { flex: 1, fontSize: FontSize.md, color: colors.text, fontWeight: '600' },
  });
}

export default function WalletTabScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const profile = useAuthStore((s) => s.profile);
  const { balance, setBalance, subscribe, recharge, isProcessing } = useWalletStore();

  useEffect(() => {
    if (!profile?.id) return;

    setBalance(profile.wallet_balance);
    return subscribe(profile.id);
  }, [profile?.id, setBalance, subscribe]);

  const handleRecharge = async (amount: number, packId: string) => {
    const success = await recharge(amount, packId);
    if (success) {
      // Balance updated via store
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Wallet</Text>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
      </View>

      <Text style={styles.sectionTitle}>Quick Recharge</Text>
      <View style={styles.packGrid}>
        {RECHARGE_PACKS.map((pack) => (
          <TouchableOpacity
            key={pack.id}
            style={styles.packCard}
            onPress={() => handleRecharge(pack.amount + (pack.amount * pack.bonus) / 100, pack.id)}
            disabled={isProcessing}>
            <Text style={styles.packLabel}>{pack.label}</Text>
            <Text style={styles.packAmount}>{formatCurrency(pack.amount)}</Text>
            {pack.bonus > 0 && <Text style={styles.packBonus}>+{pack.bonus}% extra</Text>}
          </TouchableOpacity>
        ))}
      </View>

      <Button
        title="View All Recharge Options"
        onPress={() => router.push('/recharge')}
        variant="outline"
        style={{ marginTop: Spacing.md }}
      />

      <TouchableOpacity style={styles.historyLink} onPress={() => router.push('/transactions')}>
        <Ionicons name="receipt-outline" size={20} color={colors.primary} />
        <Text style={styles.historyText}>Transaction History</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
      </TouchableOpacity>
    </ScrollView>
  );
}
