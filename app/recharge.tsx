import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { router, Stack } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { RECHARGE_PACKS } from '@/constants/rechargePacks';
import { FlatColors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { useWalletStore } from '@/store/walletStore';
import { formatCurrency } from '@/utils/helpers';
import { useTheme } from '@/hooks/useTheme';

function createStyles(colors: FlatColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: Spacing.lg },
    balanceCard: {
      backgroundColor: colors.primary,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      marginBottom: Spacing.lg,
    },
    balanceLabel: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)' },
    balanceAmount: { fontSize: 32, fontWeight: '800', color: colors.onPrimary },
    sectionTitle: { fontSize: FontSize.md, fontWeight: '700', color: colors.text, marginBottom: Spacing.sm },
    packGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
    packCard: {
      width: '48%',
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      borderWidth: 2,
      borderColor: colors.border,
    },
    packSelected: { borderColor: colors.primary, backgroundColor: colors.primary + '08' },
    packLabel: { fontSize: FontSize.xs, color: colors.textSecondary },
    packAmount: { fontSize: FontSize.xl, fontWeight: '800', color: colors.text },
    packBonus: { fontSize: FontSize.xs, color: colors.success, fontWeight: '600' },
    input: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      fontSize: FontSize.md,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    mockNote: {
      fontSize: FontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: Spacing.lg,
      fontStyle: 'italic',
    },
  });
}

export default function RechargeScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { balance, recharge, isProcessing } = useWalletStore();
  const [customAmount, setCustomAmount] = useState('');
  const [selectedPack, setSelectedPack] = useState<string | null>(null);

  const handlePay = async () => {
    let amount: number;
    let packId: string;

    if (selectedPack) {
      const pack = RECHARGE_PACKS.find((p) => p.id === selectedPack)!;
      amount = pack.amount + (pack.amount * pack.bonus) / 100;
      packId = pack.id;
    } else {
      amount = parseFloat(customAmount);
      packId = 'custom';
      if (isNaN(amount) || amount < 10) {
        Alert.alert('Invalid amount', 'Minimum recharge is ₹10');
        return;
      }
    }

    const success = await recharge(amount, packId);
    if (success) {
      Alert.alert('Success', `₹${amount.toFixed(0)} added to your wallet!`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } else {
      Alert.alert('Payment failed', 'Please try again.');
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Recharge Wallet' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
        </View>

        <Text style={styles.sectionTitle}>Choose a pack</Text>
        <View style={styles.packGrid}>
          {RECHARGE_PACKS.map((pack) => (
            <TouchableOpacity
              key={pack.id}
              style={[styles.packCard, selectedPack === pack.id && styles.packSelected]}
              onPress={() => {
                setSelectedPack(pack.id);
                setCustomAmount('');
              }}>
              <Text style={styles.packLabel}>{pack.label}</Text>
              <Text style={styles.packAmount}>{formatCurrency(pack.amount)}</Text>
              {pack.bonus > 0 && <Text style={styles.packBonus}>+{pack.bonus}% bonus</Text>}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Or enter custom amount</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter amount (min ₹10)"
          placeholderTextColor={colors.textLight}
          keyboardType="numeric"
          value={customAmount}
          onChangeText={(v) => {
            setCustomAmount(v);
            setSelectedPack(null);
          }}
        />

        <Text style={styles.mockNote}>
          💳 Payments are mocked — no real charge will be made
        </Text>

        <Button
          title={isProcessing ? 'Processing...' : 'Pay Now'}
          onPress={handlePay}
          loading={isProcessing}
          size="lg"
          disabled={!selectedPack && !customAmount}
          style={{ marginTop: Spacing.lg }}
        />
      </ScrollView>
    </>
  );
}
