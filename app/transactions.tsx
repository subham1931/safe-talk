import { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Stack } from 'expo-router';
import { FlatColors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { useTheme } from '@/hooks/useTheme';

function createStyles(colors: FlatColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: Spacing.lg },
    empty: { textAlign: 'center', color: colors.textSecondary, marginTop: Spacing.xxl },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      marginBottom: Spacing.sm,
    },
    type: { fontSize: FontSize.md, fontWeight: '600', color: colors.text },
    date: { fontSize: FontSize.xs, color: colors.textSecondary, marginTop: 2 },
    desc: { fontSize: FontSize.xs, color: colors.textLight, marginTop: 2 },
    amount: { fontSize: FontSize.lg, fontWeight: '700' },
  });
}

export default function TransactionsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const profile = useAuthStore((s) => s.profile);
  const { transactions, fetchTransactions } = useWalletStore();

  useEffect(() => {
    fetchTransactions();
  }, [profile]);

  return (
    <>
      <Stack.Screen options={{ title: 'Transactions' }} />
      <FlatList
        style={styles.container}
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          <Text style={styles.empty}>No transactions yet. Recharge your wallet to get started.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View>
              <Text style={styles.type}>
                {item.type === 'recharge' ? '↗ Recharge' : item.type === 'debit' ? '↘ Session' : '↗ Earning'}
              </Text>
              <Text style={styles.date}>{formatDate(item.created_at)}</Text>
              {item.description && <Text style={styles.desc}>{item.description}</Text>}
            </View>
            <Text
              style={[
                styles.amount,
                { color: item.type === 'debit' ? colors.error : colors.success },
              ]}>
              {item.type === 'debit' ? '-' : '+'}
              {formatCurrency(item.amount)}
            </Text>
          </View>
        )}
      />
    </>
  );
}
