import { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, Switch, Modal, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FlatColors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useListenerStore } from '@/store/listenerStore';
import { useSessionStore } from '@/store/sessionStore';
import { getListenerProfile } from '@/services/listener/ListenerService';
import { ListenerProfile } from '@/types';
import { formatCurrency } from '@/utils/helpers';
import { navigateToSession } from '@/utils/sessionNavigation';
import { useTheme } from '@/hooks/useTheme';

function createStyles(colors: FlatColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: Spacing.lg, paddingTop: 60 },
    title: { fontSize: FontSize.xxl, fontWeight: '800', color: colors.text, marginBottom: Spacing.lg },
    onlineCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      marginBottom: Spacing.lg,
    },
    onlineLabel: { fontSize: FontSize.lg, fontWeight: '700', color: colors.text },
    onlineSub: { fontSize: FontSize.sm, color: colors.textSecondary, marginTop: 2 },
    statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
    },
    statValue: { fontSize: FontSize.xxl, fontWeight: '800', color: colors.secondary },
    statLabel: { fontSize: FontSize.sm, color: colors.textSecondary, marginTop: 4 },
    progressBar: {
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 3,
      marginTop: Spacing.sm,
      overflow: 'hidden',
    },
    progressFill: { height: '100%', backgroundColor: colors.secondary, borderRadius: 3 },
    target: { fontSize: FontSize.xs, color: colors.textLight, marginTop: 4 },
    statusCard: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    statusTitle: { fontSize: FontSize.md, fontWeight: '600', color: colors.text },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalSheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: BorderRadius.xl,
      borderTopRightRadius: BorderRadius.xl,
      padding: Spacing.lg,
      paddingBottom: Spacing.xxl,
    },
    modalTitle: { fontSize: FontSize.xl, fontWeight: '800', color: colors.text },
    modalSubtitle: { fontSize: FontSize.md, color: colors.textSecondary, marginTop: Spacing.sm },
    anonNote: { fontSize: FontSize.sm, color: colors.textLight, fontStyle: 'italic', marginTop: Spacing.sm },
    modalActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg },
  });
}

export default function ListenerDashboardScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const profile = useAuthStore((s) => s.profile);
  const setOnlineStatus = useListenerStore((s) => s.setOnlineStatus);
  const { pendingRequest, acceptSession, declineSession, subscribeToIncomingRequests } =
    useSessionStore();

  const [listenerProfile, setListenerProfile] = useState<ListenerProfile | null>(null);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (profile) {
      getListenerProfile(profile.id).then(setListenerProfile);
      return subscribeToIncomingRequests(profile.id);
    }
  }, [profile]);

  const toggleOnline = async (value: boolean) => {
    setIsOnline(value);
    await setOnlineStatus(value);
  };

  const progress = listenerProfile
    ? Math.min(100, (listenerProfile.today_minutes / listenerProfile.daily_target_minutes) * 100)
    : 0;

  const handleAccept = async () => {
    if (!pendingRequest) return;
    const session = pendingRequest;
    await acceptSession(session.id);
    navigateToSession({ ...session, status: 'active' }, { listenerName: '', perspective: 'listener' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Listener Dashboard</Text>

      <View style={styles.onlineCard}>
        <View>
          <Text style={styles.onlineLabel}>You are {isOnline ? 'Online' : 'Offline'}</Text>
          <Text style={styles.onlineSub}>
            {isOnline ? 'Ready to receive connection requests' : 'Go online to start earning'}
          </Text>
        </View>
        <Switch
          value={isOnline}
          onValueChange={toggleOnline}
          trackColor={{ true: colors.success }}
          thumbColor={colors.onPrimary}
        />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{listenerProfile?.today_minutes ?? 0}</Text>
          <Text style={styles.statLabel}>Minutes today</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.target}>
            Target: {listenerProfile?.daily_target_minutes ?? 120} min
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{formatCurrency(profile?.wallet_balance ?? 0)}</Text>
          <Text style={styles.statLabel}>Earnings today</Text>
        </View>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Application Status</Text>
        <Badge
          label={listenerProfile?.status ?? 'pending'}
          color={
            listenerProfile?.status === 'approved'
              ? colors.success
              : listenerProfile?.status === 'rejected'
                ? colors.error
                : colors.warning
          }
        />
      </View>

      <Modal visible={!!pendingRequest} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Incoming Request</Text>
            <Text style={styles.modalSubtitle}>
              A Seeker wants to talk about: {pendingRequest?.category_tag ?? 'General'}
            </Text>
            <Text style={styles.anonNote}>Seeker identity is anonymous</Text>
            <View style={styles.modalActions}>
              <Button
                title="Decline"
                variant="outline"
                onPress={() => pendingRequest && declineSession(pendingRequest.id)}
              />
              <Button
                title="Accept"
                onPress={handleAccept}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
