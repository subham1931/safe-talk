import { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ThemeSegmentControl } from '@/components/ui/ThemeSegmentControl';
import { FlatColors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { getListenerProfile } from '@/services/listener/ListenerService';
import { logoutAndRedirect } from '@/utils/authNavigation';
import { ListenerProfile } from '@/types';
import { useTheme } from '@/hooks/useTheme';

function createStyles(colors: FlatColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: Spacing.lg, paddingTop: 60, paddingBottom: Spacing.xxl },
    title: { fontSize: FontSize.xxl, fontWeight: '800', color: colors.text, marginBottom: Spacing.lg },
    card: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing.lg,
    },
    name: { fontSize: FontSize.lg, fontWeight: '700', color: colors.text },
    sectionLabel: {
      fontSize: FontSize.sm,
      fontWeight: '600',
      color: colors.textSecondary,
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
    sectionTitle: { fontSize: FontSize.md, fontWeight: '700', color: colors.text, marginBottom: Spacing.sm },
    bio: { fontSize: FontSize.md, color: colors.textSecondary, lineHeight: 24, marginBottom: Spacing.lg },
    tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      padding: Spacing.md,
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.md,
    },
    menuLabel: { fontSize: FontSize.md, color: colors.text },
  });
}

export default function ListenerProfileScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const profile = useAuthStore((s) => s.profile);
  const [listenerProfile, setListenerProfile] = useState<ListenerProfile | null>(null);

  useEffect(() => {
    if (profile) getListenerProfile(profile.id).then(setListenerProfile);
  }, [profile]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>My Profile</Text>

      <View style={styles.card}>
        <Text style={styles.name}>{listenerProfile?.display_name ?? 'Listener'}</Text>
        <Badge
          label={listenerProfile?.status ?? 'pending'}
          color={listenerProfile?.status === 'approved' ? colors.success : colors.warning}
        />
      </View>

      <View style={styles.themeCard}>
        <Text style={styles.sectionLabel}>Appearance</Text>
        <ThemeSegmentControl />
      </View>

      <Text style={styles.sectionTitle}>My Story</Text>
      <Text style={styles.bio}>{listenerProfile?.bio ?? 'No bio yet'}</Text>

      <Text style={styles.sectionTitle}>Specialties</Text>
      <View style={styles.tags}>
        {listenerProfile?.tags.map((t) => (
          <Badge key={t} label={t} color={colors.secondary} />
        ))}
      </View>

      <View style={styles.menuItem}>
        <Ionicons name="ban-outline" size={22} color={colors.textSecondary} />
        <Text style={styles.menuLabel}>Block List</Text>
      </View>

      <Button title="Logout" onPress={handleLogout} variant="outline" style={{ marginTop: Spacing.xl }} />
    </ScrollView>
  );
}
