import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ListenerCard } from '@/components/ListenerCard';
import { PreSessionModal } from '@/components/PreSessionModal';
import { AvatarStoryRow } from '@/components/ui/AvatarStoryRow';
import { getRateForType } from '@/components/ListenerCard';
import { getListenerAvatarUrl } from '@/constants/listenerAvatars';
import { FlatColors, FontSize, Spacing, BorderRadius, TypographyTokens, Fonts } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useListenerStore } from '@/store/listenerStore';
import { useWalletStore } from '@/store/walletStore';
import { useSessionStore } from '@/store/sessionStore';
import { ListenerProfile, SessionType } from '@/types';
import { formatCurrency } from '@/utils/helpers';
import { navigateToSession } from '@/utils/sessionNavigation';
import { useTheme } from '@/hooks/useTheme';

function createStyles(colors: FlatColors, typography: TypographyTokens) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: Spacing.lg,
      paddingTop: 60,
      backgroundColor: colors.surface,
    },
    greeting: { ...typography.headlineSmall },
    headerSubtitle: { ...typography.caption },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    walletPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.primary + '15',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.full,
    },
    walletText: { fontFamily: Fonts.bodySemiBold, fontSize: FontSize.sm, color: colors.primary },
    bellBtn: { padding: Spacing.xs },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      marginTop: Spacing.lg,
      marginBottom: Spacing.sm,
    },
    sectionTitle: { ...typography.headlineSmall },
    viewMore: { fontFamily: Fonts.bodySemiBold, fontSize: FontSize.sm, color: colors.primary },
    empty: { textAlign: 'center', color: colors.textSecondary, padding: Spacing.xl },
  });
}

export default function SeekerHomeScreen() {
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  const profile = useAuthStore((s) => s.profile);
  const { listeners, fetchListeners } = useListenerStore();
  const balance = useWalletStore((s) => s.balance);
  const setBalance = useWalletStore((s) => s.setBalance);
  const subscribe = useWalletStore((s) => s.subscribe);
  const createSession = useSessionStore((s) => s.createSession);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedListener, setSelectedListener] = useState<ListenerProfile | null>(null);
  const [sessionType, setSessionType] = useState<SessionType>('chat');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchListeners();
    if (profile?.id) {
      setBalance(profile.wallet_balance);
      return subscribe(profile.id);
    }
  }, [profile?.id]);

  const onlineListeners = listeners.filter((l) => l.is_online);

  const openSession = (listener: ListenerProfile, type: SessionType) => {
    setSelectedListener(listener);
    setSessionType(type);
    setModalVisible(true);
  };

  const confirmSession = async () => {
    if (!selectedListener || !profile) return;
    setModalVisible(false);

    const rate = getRateForType(selectedListener, sessionType);
    const session = await createSession(
      profile.id,
      selectedListener.id,
      sessionType,
      rate,
      selectedListener.tags[0]
    );

    navigateToSession(session, { listenerName: selectedListener.display_name });
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchListeners();
    setRefreshing(false);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {profile?.anonymous_name ?? 'there'} 👋</Text>
          <Text style={styles.headerSubtitle}>Find someone to talk to</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.walletPill} onPress={() => router.push('/recharge')}>
            <Ionicons name="wallet" size={16} color={colors.primary} />
            <Text style={styles.walletText}>{formatCurrency(balance)}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => Alert.alert('Notifications', 'Notification settings coming soon.')}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Listeners Online Now</Text>
          <TouchableOpacity onPress={() => router.push('/directory')}>
            <Text style={styles.viewMore}>View More</Text>
          </TouchableOpacity>
        </View>

        <AvatarStoryRow
          items={onlineListeners.slice(0, 12).map((l) => ({
            id: l.id,
            avatarId: l.id.slice(-1),
            imageUri: getListenerAvatarUrl(l),
            label: l.display_name.split(' ')[0],
            isOnline: l.is_online,
          }))}
          onPress={(id) => router.push(`/listener/${id}`)}
        />

        {onlineListeners.length === 0 ? (
          <Text style={styles.empty}>No listeners online right now.</Text>
        ) : (
          onlineListeners.map((listener) => (
            <ListenerCard
              key={listener.id}
              listener={listener}
              onPress={() => router.push(`/listener/${listener.id}`)}
              onChat={() => openSession(listener, 'chat')}
              onCall={() => openSession(listener, 'call')}
              onVideo={() => openSession(listener, 'video')}
            />
          ))
        )}
      </ScrollView>

      {selectedListener && (
        <PreSessionModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onConfirm={confirmSession}
          onRecharge={() => {
            setModalVisible(false);
            router.push('/recharge');
          }}
          listenerName={selectedListener.display_name}
          sessionType={sessionType}
          ratePerMin={getRateForType(selectedListener, sessionType)}
          balance={balance}
        />
      )}
    </View>
  );
}
