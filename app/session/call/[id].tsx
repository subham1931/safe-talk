import { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { callService } from '@/services/call';
import { ReportModal } from '@/components/ReportModal';
import { Avatar } from '@/components/ui/Avatar';
import { FlatColors, FontSize, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import { useSessionStore } from '@/store/sessionStore';
import { endSessionBilling } from '@/services/billing/BillingService';
import { submitReport } from '@/services/listener/ListenerService';
import { formatDuration, formatCurrency } from '@/utils/helpers';
import { useTheme } from '@/hooks/useTheme';

function createStyles(colors: FlatColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { padding: Spacing.lg, paddingTop: 56, alignItems: 'flex-end' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    name: { fontSize: FontSize.xxl, fontWeight: '800', color: colors.ink, marginTop: Spacing.lg },
    status: { fontSize: FontSize.lg, color: colors.inkSecondary, marginTop: Spacing.sm },
    balance: { fontSize: FontSize.sm, color: colors.accent, marginTop: Spacing.sm },
    controls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.xl,
      paddingBottom: 60,
    },
    controlBtn: {
      alignItems: 'center',
      gap: Spacing.xs,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary + '26',
      justifyContent: 'center',
    },
    controlLabel: { fontSize: FontSize.xs, color: colors.inkSecondary },
    endBtn: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.error,
      alignItems: 'center',
      justifyContent: 'center',
    },
    mockLabel: {
      textAlign: 'center',
      color: colors.textLight,
      fontSize: FontSize.xs,
      paddingBottom: Spacing.lg,
    },
  });
}

export default function VoiceCallScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { id, listenerId, listenerName } = useLocalSearchParams<{
    id: string;
    listenerId: string;
    listenerName: string;
    rate: string;
  }>();

  const profile = useAuthStore((s) => s.profile);
  const balance = useWalletStore((s) => s.balance);
  const endSession = useSessionStore((s) => s.endSession);

  const [callState, setCallState] = useState(callService.getState());
  const [reportVisible, setReportVisible] = useState(false);

  useEffect(() => {
    callService.startCall(id, 'call');
    const unsub = callService.addEventListener(() => setCallState(callService.getState()));
    return () => {
      unsub();
      callService.endCall();
    };
  }, [id]);

  const handleEnd = async () => {
    await callService.endCall();
    if (!id.startsWith('mock-')) await endSessionBilling(id).catch(() => {});
    const session = await endSession(id);
    router.replace({
      pathname: '/post-session/[id]',
      params: {
        id,
        duration: callState.elapsedSeconds.toString(),
        amount: session.total_amount.toString(),
        listenerId,
        listenerName,
      },
    });
  };

  const handleReport = async (reason: string, details: string) => {
    if (profile) await submitReport(profile.id, listenerId, reason, details, id).catch(() => {});
    setReportVisible(false);
    handleEnd();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setReportVisible(true)}>
          <Ionicons name="flag-outline" size={22} color={colors.inkSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.center}>
        <Avatar avatarId={listenerId.slice(-1)} size={120} />
        <Text style={styles.name}>{listenerName}</Text>
        <Text style={styles.status}>
          {callState.status === 'connecting' ? 'Connecting...' : formatDuration(callState.elapsedSeconds)}
        </Text>
        <Text style={styles.balance}>{formatCurrency(balance)} remaining</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={() => {
            callService.toggleMute();
            setCallState(callService.getState());
          }}>
          <Ionicons name={callState.isMuted ? 'mic-off' : 'mic'} size={28} color={colors.primary} />
          <Text style={styles.controlLabel}>Mute</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.endBtn} onPress={handleEnd}>
          <Ionicons
            name="call"
            size={32}
            color={colors.onPrimary}
            style={{ transform: [{ rotate: '135deg' }] }}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlBtn}
          onPress={() => {
            callService.toggleSpeaker();
            setCallState(callService.getState());
          }}>
          <Ionicons
            name={callState.isSpeakerOn ? 'volume-high' : 'volume-medium'}
            size={28}
            color={colors.primary}
          />
          <Text style={styles.controlLabel}>Speaker</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.mockLabel}>Mock CallService — no real SDK connected</Text>
      <ReportModal visible={reportVisible} onClose={() => setReportVisible(false)} onSubmit={handleReport} />
    </View>
  );
}
