import { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { callService } from '@/services/call';
import { ReportModal } from '@/components/ReportModal';
import { Avatar } from '@/components/ui/Avatar';
import { FlatColors, FontSize, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import { useSessionStore } from '@/store/sessionStore';
import { endSessionBilling, startBillingInterval } from '@/services/billing/BillingService';
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
  const { id, listenerId, listenerName, rate } = useLocalSearchParams<{
    id: string;
    listenerId: string;
    listenerName: string;
    rate: string;
  }>();

  const profile = useAuthStore((s) => s.profile);
  const balance = useWalletStore((s) => s.balance);
  const setBalance = useWalletStore((s) => s.setBalance);
  const endSession = useSessionStore((s) => s.endSession);
  const setElapsedSeconds = useSessionStore((s) => s.setElapsedSeconds);

  const [callState, setCallState] = useState(callService.getState());
  const [reportVisible, setReportVisible] = useState(false);
  const [lowBalanceWarned, setLowBalanceWarned] = useState(false);
  const ratePerMin = parseFloat(rate ?? '12');

  useEffect(() => {
    callService.startCall(id, 'video');
    const unsub = callService.addEventListener(() => setCallState(callService.getState()));
    return () => {
      unsub();
      callService.endCall();
    };
  }, [id]);

  const handleEnd = useCallback(async () => {
    await callService.endCall();
    setElapsedSeconds(callService.getState().elapsedSeconds);
    if (!id.startsWith('mock-')) await endSessionBilling(id).catch(() => {});
    const session = await endSession(id, { listenerDisplayName: listenerName });
    router.replace({
      pathname: '/post-session/[id]',
      params: {
        id,
        duration: callService.getState().elapsedSeconds.toString(),
        amount: session.total_amount.toString(),
        listenerId,
        listenerName,
      },
    });
  }, [id, listenerId, listenerName, endSession, setElapsedSeconds]);

  useEffect(() => {
    if (id.startsWith('mock-')) {
      const mockBilling = setInterval(() => {
        const debit = ratePerMin / 60;
        const newBalance = balance - debit;
        if (newBalance <= 0) {
          handleEnd();
          return;
        }
        setBalance(newBalance);
        if (newBalance < ratePerMin * 2 && !lowBalanceWarned) {
          setLowBalanceWarned(true);
          Alert.alert('Low balance', 'Less than 2 minutes remaining. Recharge to continue.');
        }
      }, 60000);
      return () => clearInterval(mockBilling);
    }

    return startBillingInterval(id, (result) => {
      setBalance(result.wallet_balance);
      if (result.low_balance_warning && !lowBalanceWarned) {
        setLowBalanceWarned(true);
        Alert.alert('Low balance', 'Less than 2 minutes remaining.');
      }
      if (result.session_ended) {
        handleEnd();
      }
    });
  }, [id, ratePerMin]);

  const handleReport = async (reason: string, details: string) => {
    if (profile) await submitReport(profile.id, listenerId, reason, details, id).catch(() => {});
    setReportVisible(false);
    await handleEnd();
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
