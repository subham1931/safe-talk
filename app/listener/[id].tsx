import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { PreSessionModal } from '@/components/PreSessionModal';
import { getRateForType } from '@/components/ListenerCard';
import { getListenerAvatarUrl } from '@/constants/listenerAvatars';
import { FlatColors, FontSize, Spacing, BorderRadius, Fonts } from '@/constants/theme';
import { useListenerStore } from '@/store/listenerStore';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import { useSessionStore } from '@/store/sessionStore';
import { SessionType } from '@/types';
import { navigateToSession } from '@/utils/sessionNavigation';
import { useTheme } from '@/hooks/useTheme';

function createStyles(colors: FlatColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
    header: { alignItems: 'center', marginBottom: Spacing.lg },
    name: {
      fontFamily: Fonts.headlineBold,
      fontSize: FontSize.xl,
      color: colors.ink,
      marginTop: Spacing.md,
    },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.sm },
    rating: {
      fontFamily: Fonts.bodySemiBold,
      fontSize: FontSize.md,
      color: colors.ink,
    },
    reviewCount: {
      fontFamily: Fonts.body,
      fontSize: FontSize.sm,
      color: colors.inkSecondary,
    },
    sectionTitle: {
      fontFamily: Fonts.bodySemiBold,
      fontSize: FontSize.md,
      color: colors.ink,
      marginTop: Spacing.lg,
      marginBottom: Spacing.sm,
    },
    bio: {
      fontFamily: Fonts.body,
      fontSize: FontSize.md,
      color: colors.inkSecondary,
      lineHeight: 24,
    },
    tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    rates: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: Spacing.lg,
      padding: Spacing.md,
      backgroundColor: colors.surfaceAlt,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    rateItem: { alignItems: 'center', gap: 4 },
    rateText: {
      fontFamily: Fonts.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.ink,
    },
    ctaGroup: { marginTop: Spacing.xl, gap: Spacing.sm },
    offlineBox: {
      alignItems: 'center',
      marginTop: Spacing.xl,
      padding: Spacing.lg,
      backgroundColor: colors.surfaceAlt,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    offlineText: {
      fontFamily: Fonts.body,
      fontSize: FontSize.md,
      color: colors.inkSecondary,
      marginTop: Spacing.sm,
    },
    notifyBtn: { marginTop: Spacing.md, padding: Spacing.md },
    notifyText: {
      fontFamily: Fonts.bodySemiBold,
      fontSize: FontSize.md,
      color: colors.ink,
    },
  });
}

export default function ListenerDetailScreen() {
  const { colors, getStackHeaderOptions } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const getListenerById = useListenerStore((s) => s.getListenerById);
  const listener = getListenerById(id!);
  const profile = useAuthStore((s) => s.profile);
  const balance = useWalletStore((s) => s.balance);
  const createSession = useSessionStore((s) => s.createSession);

  const [modalVisible, setModalVisible] = useState(false);
  const [sessionType, setSessionType] = useState<SessionType>('chat');

  if (!listener) {
    return (
      <View style={styles.container}>
        <Text style={{ color: colors.ink }}>Listener not found</Text>
      </View>
    );
  }

  const openSession = (type: SessionType) => {
    setSessionType(type);
    setModalVisible(true);
  };

  const confirmSession = async () => {
    if (!profile) return;
    setModalVisible(false);
    const rate = getRateForType(listener, sessionType);
    const session = await createSession(profile.id, listener.id, sessionType, rate, listener.tags[0]);
    navigateToSession(session, { listenerName: listener.display_name });
  };

  return (
    <>
      <Stack.Screen options={getStackHeaderOptions(listener.display_name)} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Avatar
            imageUri={getListenerAvatarUrl(listener)}
            size={80}
            showOnline
            isOnline={listener.is_online}
          />
          <Text style={styles.name}>{listener.display_name}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={18} color={colors.rating} />
            <Text style={styles.rating}>{listener.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({listener.rating_count} reviews)</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>My Story</Text>
        <Text style={styles.bio}>{listener.bio}</Text>

        <Text style={styles.sectionTitle}>Languages</Text>
        <View style={styles.tags}>
          {listener.languages.map((l) => (
            <Badge key={l} label={l} chipStyle="filled" />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Specialties</Text>
        <View style={styles.tags}>
          {listener.tags.map((t) => (
            <Badge key={t} label={t} chipStyle="outlined" />
          ))}
        </View>

        <View style={styles.rates}>
          <View style={styles.rateItem}>
            <Ionicons name="chatbubble" size={20} color={colors.inkSecondary} />
            <Text style={styles.rateText}>₹{listener.rate_per_min_chat}/min</Text>
          </View>
          <View style={styles.rateItem}>
            <Ionicons name="call" size={20} color={colors.inkSecondary} />
            <Text style={styles.rateText}>₹{listener.rate_per_min_call}/min</Text>
          </View>
          <View style={styles.rateItem}>
            <Ionicons name="videocam" size={20} color={colors.inkSecondary} />
            <Text style={styles.rateText}>₹{listener.rate_per_min_video}/min</Text>
          </View>
        </View>

        {listener.is_online ? (
          <View style={styles.ctaGroup}>
            <Button title="Chat Now" onPress={() => openSession('chat')} size="lg" />
            <Button title="Voice Call" onPress={() => openSession('call')} variant="secondary" size="lg" />
            <Button title="Video Call" onPress={() => openSession('video')} variant="tertiary" size="lg" />
          </View>
        ) : (
          <View style={styles.offlineBox}>
            <Ionicons name="moon" size={24} color={colors.inkSecondary} />
            <Text style={styles.offlineText}>Currently offline</Text>
            <TouchableOpacity
              style={styles.notifyBtn}
              onPress={() =>
                Alert.alert(
                  'Notification set',
                  `We will notify you when ${listener.display_name} is online.`
                )
              }>
              <Text style={styles.notifyText}>Notify Me When Online</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <PreSessionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={confirmSession}
        onRecharge={() => {
          setModalVisible(false);
          router.push('/recharge');
        }}
        listenerName={listener.display_name}
        sessionType={sessionType}
        ratePerMin={getRateForType(listener, sessionType)}
        balance={balance}
      />
    </>
  );
}
