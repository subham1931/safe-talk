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
    remoteVideo: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    remoteName: { fontSize: FontSize.xl, fontWeight: '700', color: colors.ink, marginTop: Spacing.md },
    timer: { fontSize: FontSize.lg, color: colors.inkSecondary, marginTop: Spacing.sm },
    balance: { fontSize: FontSize.sm, color: colors.accent, marginTop: 4 },
    localVideo: {
      position: 'absolute',
      top: 60,
      right: Spacing.lg,
      width: 100,
      height: 140,
      backgroundColor: colors.surfaceAlt,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    localLabel: { fontSize: FontSize.xs, color: colors.inkSecondary },
    controls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.lg,
      paddingVertical: Spacing.xl,
      paddingBottom: 50,
    },
    controlBtn: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.primary + '26',
      alignItems: 'center',
      justifyContent: 'center',
    },
    endBtn: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.error,
      alignItems: 'center',
      justifyContent: 'center',
    },
    mockLabel: {
      textAlign: 'center',
      color: colors.textLight,
      fontSize: FontSize.xs,
      paddingBottom: Spacing.md,
    },
  });
}

export default function VideoCallScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { id, listenerId, listenerName } = useLocalSearchParams<{
    id: string;
    listenerId: string;
    listenerName: string;
  }>();

  const profile = useAuthStore((s) => s.profile);
  const balance = useWalletStore((s) => s.balance);
  const endSession = useSessionStore((s) => s.endSession);

  const [callState, setCallState] = useState(callService.getState());
  const [reportVisible, setReportVisible] = useState(false);

  useEffect(() => {
    callService.startCall(id, 'video');
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
      <View style={styles.remoteVideo}>
        <Avatar avatarId={listenerId.slice(-1)} size={100} />
        <Text style={styles.remoteName}>{listenerName}</Text>
        <Text style={styles.timer}>{formatDuration(callState.elapsedSeconds)}</Text>
        <Text style={styles.balance}>{formatCurrency(balance)} left</Text>
      </View>

      {callState.isCameraOn && (
        <View style={styles.localVideo}>
          <Text style={styles.localLabel}>You (anonymous)</Text>
        </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={() => {
            callService.toggleMute();
            setCallState(callService.getState());
          }}>
          <Ionicons name={callState.isMuted ? 'mic-off' : 'mic'} size={24} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={() => {
            callService.toggleCamera();
            setCallState(callService.getState());
          }}>
          <Ionicons
            name={callState.isCameraOn ? 'videocam' : 'videocam-off'}
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={() => {
            callService.flipCamera();
            setCallState(callService.getState());
          }}>
          <Ionicons name="camera-reverse" size={24} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.endBtn} onPress={handleEnd}>
          <Ionicons
            name="call"
            size={28}
            color={colors.onPrimary}
            style={{ transform: [{ rotate: '135deg' }] }}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setReportVisible(true)}>
          <Ionicons name="flag-outline" size={22} color={colors.inkSecondary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.mockLabel}>Mock CallService — video tiles simulated</Text>
      <ReportModal visible={reportVisible} onClose={() => setReportVisible(false)} onSubmit={handleReport} />
    </View>
  );
}
