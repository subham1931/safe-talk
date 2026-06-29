import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useFloatingTabBarInset } from '@/components/ui/FloatingTabBar';
import { RECHARGE_PACKS } from '@/constants/rechargePacks';
import { FlatColors, FontSize, Spacing, BorderRadius, Fonts } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import { formatCurrency } from '@/utils/helpers';
import { useTheme } from '@/hooks/useTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = Spacing.lg;
const PACK_GAP = Spacing.sm;
const PACK_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - PACK_GAP) / 2;

function createStyles(colors: FlatColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      overflow: 'hidden',
    },
    content: {
      paddingHorizontal: HORIZONTAL_PADDING,
    },
    title: {
      fontFamily: Fonts.headlineExtra,
      fontSize: FontSize.xxl,
      color: colors.text,
      marginBottom: Spacing.lg,
    },
    balanceCard: {
      borderRadius: BorderRadius.lg,
      padding: Spacing.xl,
      marginBottom: Spacing.xl,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    balanceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    balanceLabel: {
      fontFamily: Fonts.bodyMedium,
      fontSize: FontSize.sm,
      color: colors.textSecondary,
    },
    balanceAmount: {
      fontFamily: Fonts.headlineExtra,
      fontSize: 40,
      color: colors.text,
      marginTop: Spacing.sm,
    },
    walletIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary + '22',
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionTitle: {
      fontFamily: Fonts.bodySemiBold,
      fontSize: FontSize.lg,
      color: colors.text,
      marginBottom: Spacing.md,
    },
    packGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: PACK_GAP,
    },
    packCard: {
      width: PACK_WIDTH,
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 96,
      justifyContent: 'center',
    },
    packCardPressed: {
      borderColor: colors.primary,
      backgroundColor: colors.surfaceAlt,
    },
    packLabel: {
      fontFamily: Fonts.bodyMedium,
      fontSize: FontSize.xs,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    packAmount: {
      fontFamily: Fonts.headlineBold,
      fontSize: FontSize.xl,
      color: colors.text,
      marginTop: 6,
    },
    packBonus: {
      fontFamily: Fonts.bodySemiBold,
      fontSize: FontSize.xs,
      color: colors.success,
      marginTop: 4,
    },
    processingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.background + 'CC',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: BorderRadius.lg,
    },
    historyLink: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      marginTop: Spacing.xl,
      padding: Spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    historyIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary + '18',
      alignItems: 'center',
      justifyContent: 'center',
    },
    historyText: {
      flex: 1,
      fontFamily: Fonts.bodySemiBold,
      fontSize: FontSize.md,
      color: colors.text,
    },
    devCreditCard: {
      marginTop: Spacing.lg,
      padding: Spacing.lg,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: colors.primary + '44',
      backgroundColor: colors.primary + '10',
      gap: Spacing.sm,
    },
    devCreditTitle: {
      fontFamily: Fonts.bodySemiBold,
      fontSize: FontSize.md,
      color: colors.text,
    },
    devCreditHint: {
      fontFamily: Fonts.body,
      fontSize: FontSize.sm,
      color: colors.textSecondary,
      lineHeight: 20,
    },
  });
}

export default function WalletTabScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarInset = useFloatingTabBarInset();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const profile = useAuthStore((s) => s.profile);
  const { balance, setBalance, subscribe, recharge, addCredits, isProcessing } = useWalletStore();
  const [activePackId, setActivePackId] = useState<string | null>(null);
  const [devCreditVisible, setDevCreditVisible] = useState(false);
  const [devCreditResult, setDevCreditResult] = useState<{ ok: boolean; message: string } | null>(
    null
  );

  useEffect(() => {
    if (!profile?.id) return;

    setBalance(profile.wallet_balance);
    return subscribe(profile.id);
  }, [profile?.id, setBalance, subscribe]);

  const handleRecharge = async (amount: number, packId: string) => {
    setActivePackId(packId);
    const success = await recharge(amount, packId);
    setActivePackId(null);
    if (!success) return;
  };

  const handleDevCredit = async () => {
    setDevCreditVisible(false);
    const success = await addCredits(500);
    setDevCreditResult(
      success
        ? { ok: true, message: '₹500 has been added to your wallet.' }
        : {
            ok: false,
            message:
              'Could not add credits. Run scripts/dev-wallet-setup.sql in Supabase SQL Editor first.',
          }
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + Spacing.lg,
            paddingBottom: tabBarInset + Spacing.lg,
          },
        ]}>
        <Text style={styles.title}>Wallet</Text>

        <LinearGradient
          colors={[colors.surfaceAlt, colors.surface]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <View style={styles.walletIconWrap}>
              <Ionicons name="wallet" size={22} color={colors.primary} />
            </View>
          </View>
          <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
        </LinearGradient>

        <Text style={styles.sectionTitle}>Quick Recharge</Text>
        <View style={styles.packGrid}>
          {RECHARGE_PACKS.map((pack) => {
            const isLoading = isProcessing && activePackId === pack.id;
            return (
              <TouchableOpacity
                key={pack.id}
                style={[styles.packCard, isLoading && styles.packCardPressed]}
                onPress={() =>
                  handleRecharge(pack.amount + (pack.amount * pack.bonus) / 100, pack.id)
                }
                disabled={isProcessing}
                activeOpacity={0.85}>
                <Text style={styles.packLabel}>{pack.label}</Text>
                <Text style={styles.packAmount}>{formatCurrency(pack.amount)}</Text>
                {pack.bonus > 0 && <Text style={styles.packBonus}>+{pack.bonus}% extra</Text>}
                {isLoading && (
                  <View style={styles.processingOverlay}>
                    <ActivityIndicator color={colors.primary} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Button
          title="View All Recharge Options"
          onPress={() => router.push('/recharge')}
          variant="outline"
          style={{ marginTop: Spacing.md }}
        />

        <TouchableOpacity style={styles.historyLink} onPress={() => router.push('/transactions')}>
          <View style={styles.historyIconWrap}>
            <Ionicons name="receipt-outline" size={20} color={colors.primary} />
          </View>
          <Text style={styles.historyText}>Transaction History</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
        </TouchableOpacity>

        {__DEV__ && (
          <View style={styles.devCreditCard}>
            <Text style={styles.devCreditTitle}>Dev: Add test credits</Text>
            <Text style={styles.devCreditHint}>
              Adds ₹500 without a real payment. Requires the wallet credit migration on Supabase.
            </Text>
            <Button
              title={isProcessing ? 'Adding…' : 'Add ₹500'}
              onPress={() => setDevCreditVisible(true)}
              disabled={isProcessing}
              variant="outline"
            />
          </View>
        )}
      </ScrollView>

      <ConfirmDialog
        visible={devCreditVisible}
        title="Add test credits?"
        message="This adds ₹500 to your wallet for testing. No payment will be charged."
        confirmLabel="Add ₹500"
        onConfirm={handleDevCredit}
        onCancel={() => setDevCreditVisible(false)}
        variant="info"
      />

      <ConfirmDialog
        visible={devCreditResult !== null}
        title={devCreditResult?.ok ? 'Credits added' : 'Could not add credits'}
        message={devCreditResult?.message ?? ''}
        confirmLabel="OK"
        onConfirm={() => setDevCreditResult(null)}
        variant={devCreditResult?.ok ? 'success' : 'error'}
      />
    </View>
  );
}
