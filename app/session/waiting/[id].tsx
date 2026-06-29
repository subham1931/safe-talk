import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FlatColors, FontSize, Spacing } from '@/constants/theme';
import { useSessionStore } from '@/store/sessionStore';
import { getSessionPathname } from '@/utils/sessionNavigation';
import { SessionType } from '@/types';
import { useTheme } from '@/hooks/useTheme';

function createStyles(colors: FlatColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing.xl,
    },
    title: { fontSize: FontSize.xxl, fontWeight: '800', color: colors.text, marginTop: Spacing.lg },
    subtitle: {
      fontSize: FontSize.md,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: Spacing.md,
      lineHeight: 24,
    },
  });
}

export default function SessionWaitingScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { id, listenerId, listenerName, rate, type } = useLocalSearchParams<{
    id: string;
    listenerId: string;
    listenerName: string;
    rate: string;
    type: SessionType;
  }>();
  const subscribeToSessionStatus = useSessionStore((s) => s.subscribeToSessionStatus);
  const [declinedVisible, setDeclinedVisible] = useState(false);

  useEffect(() => {
    if (!id) return;

    return subscribeToSessionStatus(id, (session) => {
      if (session.status === 'active') {
        router.replace({
          pathname: getSessionPathname(session.type),
          params: { id, listenerId, listenerName, rate },
        });
      } else if (session.status === 'declined') {
        setDeclinedVisible(true);
      }
    });
  }, [id, listenerId, listenerName, rate, subscribeToSessionStatus]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.title}>Waiting for {listenerName}</Text>
      <Text style={styles.subtitle}>
        Your {type === 'chat' ? 'chat' : type === 'call' ? 'call' : 'video'} request has been sent.
        You will connect automatically once the listener accepts.
      </Text>

      <ConfirmDialog
        visible={declinedVisible}
        title="Request declined"
        message="The listener is unavailable right now."
        variant="warning"
        confirmLabel="OK"
        onConfirm={() => {
          setDeclinedVisible(false);
          router.back();
        }}
      />
    </View>
  );
}
