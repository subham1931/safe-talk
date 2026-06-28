import { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/ui/Avatar';
import { ThemeSegmentControl } from '@/components/ui/ThemeSegmentControl';
import { BorderRadius, FlatColors, FontSize, Spacing, Fonts } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';
import { formatCurrency } from '@/utils/helpers';
import { logoutAndRedirect } from '@/utils/authNavigation';

function createStyles(colors: FlatColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: Spacing.lg, paddingTop: 60, paddingBottom: Spacing.xxl },
    title: {
      fontFamily: Fonts.headlineExtra,
      fontSize: FontSize.xxl,
      color: colors.ink,
      marginBottom: Spacing.lg,
    },
    identityCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: Spacing.lg,
      marginBottom: Spacing.lg,
    },
    identityInfo: { flex: 1, marginLeft: Spacing.md },
    anonName: {
      fontFamily: Fonts.headlineBold,
      fontSize: FontSize.lg,
      color: colors.ink,
    },
    roleBadge: {
      fontFamily: Fonts.bodySemiBold,
      fontSize: FontSize.xs,
      color: colors.inkSecondary,
      marginTop: 2,
    },
    balance: {
      fontFamily: Fonts.headlineBold,
      fontSize: FontSize.md,
      color: colors.ink,
    },
    sectionLabel: {
      fontFamily: Fonts.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.inkSecondary,
      marginBottom: Spacing.sm,
    },
    themeCard: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: Spacing.md,
      marginBottom: Spacing.lg,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      padding: Spacing.md,
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: Spacing.sm,
    },
    menuLabel: {
      flex: 1,
      fontFamily: Fonts.body,
      fontSize: FontSize.md,
      color: colors.ink,
    },
    accountSection: {
      marginTop: Spacing.lg,
      gap: Spacing.sm,
    },
    logoutItem: {
      borderColor: colors.error + '55',
      backgroundColor: colors.surface,
    },
    logoutLabel: {
      flex: 1,
      fontFamily: Fonts.bodySemiBold,
      fontSize: FontSize.md,
      color: colors.error,
    },
  });
}

export default function ProfileTabScreen() {
  const profile = useAuthStore((s) => s.profile);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          void logoutAndRedirect();
        },
      },
    ]);
  };

  const menuItems = [
    { icon: 'wallet-outline', label: 'Wallet', route: '/recharge' },
    { icon: 'time-outline', label: 'Session History', route: '/(seeker)/sessions' },
    { icon: 'notifications-outline', label: 'Notifications', route: null },
    { icon: 'language-outline', label: 'Language', route: null },
    { icon: 'help-circle-outline', label: 'FAQs', route: '/faqs' },
    { icon: 'mail-outline', label: 'Contact Support', route: null },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.identityCard}>
        <Avatar avatarId={profile?.avatar_id} size={72} showOnline isOnline />
        <View style={styles.identityInfo}>
          <Text style={styles.anonName}>{profile?.anonymous_name}</Text>
          <Text style={styles.roleBadge}>Anonymous Seeker</Text>
        </View>
        <Text style={styles.balance}>{formatCurrency(profile?.wallet_balance ?? 0)}</Text>
      </View>

      <View style={styles.themeCard}>
        <Text style={styles.sectionLabel}>Appearance</Text>
        <ThemeSegmentControl />
      </View>

      {menuItems.map((item) => (
        <TouchableOpacity
          key={item.label}
          style={styles.menuItem}
          onPress={() => item.route && router.push(item.route as '/faqs')}>
          <Ionicons name={item.icon as 'wallet-outline'} size={22} color={colors.inkSecondary} />
          <Text style={styles.menuLabel}>{item.label}</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.inkSecondary} />
        </TouchableOpacity>
      ))}

      <View style={styles.accountSection}>
        <Text style={styles.sectionLabel}>Account</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/(auth)/seeker-setup?edit=1')}>
          <Ionicons name="create-outline" size={22} color={colors.inkSecondary} />
          <Text style={styles.menuLabel}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.inkSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={colors.error} />
          <Text style={styles.logoutLabel}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
