import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { ReportModal } from '@/components/ReportModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FlatColors, FontSize, Spacing, BorderRadius, Fonts } from '@/constants/theme';
import { getListenerAvatarUrl } from '@/constants/listenerAvatars';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import { useSessionStore } from '@/store/sessionStore';
import { useListenerStore } from '@/store/listenerStore';
import { getMessages, sendMessage, subscribeToMessages } from '@/services/chat/ChatService';
import { startBillingInterval } from '@/services/billing/BillingService';
import { submitReport } from '@/services/listener/ListenerService';
import { Message } from '@/types';
import { formatDuration, formatCurrency } from '@/utils/helpers';
import { useTheme } from '@/hooks/useTheme';

function formatMessageTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function createStyles(colors: FlatColors, insets: { top: number; bottom: number }) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      overflow: 'hidden',
    },
    header: {
      paddingTop: insets.top + Spacing.sm,
      paddingHorizontal: Spacing.md,
      paddingBottom: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceAlt,
    },
    headerCenter: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      minWidth: 0,
    },
    headerAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: colors.border,
    },
    headerAvatarImage: {
      width: '100%',
      height: '100%',
    },
    headerName: {
      fontFamily: Fonts.bodySemiBold,
      fontSize: FontSize.md,
      color: colors.text,
    },
    headerSub: {
      fontFamily: Fonts.body,
      fontSize: FontSize.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
    },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceAlt,
    },
    endBtn: {
      paddingHorizontal: Spacing.md,
      height: 36,
      borderRadius: BorderRadius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.error + '18',
      borderWidth: 1,
      borderColor: colors.error + '44',
    },
    endBtnText: {
      fontFamily: Fonts.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.error,
    },
    statusStrip: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: Spacing.md,
      gap: Spacing.sm,
    },
    statusChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: Spacing.sm + 2,
      paddingVertical: 6,
      borderRadius: BorderRadius.pill,
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
    },
    liveDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.success,
    },
    statusChipText: {
      fontFamily: Fonts.bodyMedium,
      fontSize: FontSize.xs,
      color: colors.textSecondary,
    },
    statusChipValue: {
      fontFamily: Fonts.bodySemiBold,
      fontSize: FontSize.xs,
      color: colors.text,
    },
    messages: {
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.lg,
      flexGrow: 1,
    },
    emptyWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.xxl,
    },
    emptyIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.primary + '18',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.md,
    },
    emptyTitle: {
      fontFamily: Fonts.bodySemiBold,
      fontSize: FontSize.lg,
      color: colors.text,
      textAlign: 'center',
    },
    emptyBody: {
      fontFamily: Fonts.body,
      fontSize: FontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: Spacing.sm,
      lineHeight: 22,
    },
    messageRow: {
      flexDirection: 'row',
      marginBottom: Spacing.md,
      alignItems: 'flex-end',
      gap: Spacing.sm,
    },
    messageRowMe: {
      justifyContent: 'flex-end',
    },
    messageRowThem: {
      justifyContent: 'flex-start',
    },
    bubbleAvatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      overflow: 'hidden',
    },
    bubbleCol: {
      maxWidth: '78%',
    },
    bubbleColMe: {
      alignItems: 'flex-end',
    },
    bubble: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm + 2,
      borderRadius: BorderRadius.lg,
    },
    myBubble: {
      backgroundColor: colors.primary,
      borderBottomRightRadius: BorderRadius.sm,
    },
    theirBubble: {
      backgroundColor: colors.surface,
      borderBottomLeftRadius: BorderRadius.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    bubbleText: {
      fontFamily: Fonts.body,
      fontSize: FontSize.md,
      color: colors.text,
      lineHeight: 22,
    },
    myBubbleText: {
      color: colors.onPrimary,
    },
    bubbleTime: {
      fontFamily: Fonts.body,
      fontSize: FontSize.xs,
      color: colors.textLight,
      marginTop: 4,
    },
    composerWrap: {
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.sm,
      paddingBottom: Math.max(insets.bottom, Spacing.sm),
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.surface,
    },
    composer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: Spacing.sm,
      backgroundColor: colors.surfaceAlt,
      borderRadius: BorderRadius.pill,
      borderWidth: 1,
      borderColor: colors.border,
      paddingLeft: Spacing.md,
      paddingRight: Spacing.xs,
      paddingVertical: Spacing.xs,
    },
    input: {
      flex: 1,
      fontFamily: Fonts.body,
      fontSize: FontSize.md,
      color: colors.text,
      maxHeight: 120,
      paddingVertical: Platform.OS === 'ios' ? Spacing.sm : Spacing.xs,
    },
    sendBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendBtnActive: {
      backgroundColor: colors.primary,
    },
    sendBtnDisabled: {
      backgroundColor: colors.disabled + '33',
    },
    safeHint: {
      fontFamily: Fonts.body,
      fontSize: FontSize.xs,
      color: colors.textLight,
      textAlign: 'center',
      marginTop: Spacing.sm,
    },
  });
}

export default function ChatSessionScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors, insets), [colors, insets]);
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
  const getListenerById = useListenerStore((s) => s.getListenerById);

  const listener = getListenerById(listenerId);
  const listenerAvatarUrl = listener ? getListenerAvatarUrl(listener) : undefined;

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [reportVisible, setReportVisible] = useState(false);
  const [endConfirmVisible, setEndConfirmVisible] = useState(false);
  const [lowBalanceVisible, setLowBalanceVisible] = useState(false);
  const [lowBalanceWarned, setLowBalanceWarned] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const ratePerMin = parseFloat(rate ?? '5');
  const canSend = text.trim().length > 0;
  const estimatedBalance = Math.max(0, balance - (elapsed / 60) * ratePerMin);

  useEffect(() => {
    if (!id || id.startsWith('mock-')) return;

    getMessages(id).then(setMessages);
    const channel = subscribeToMessages(id, (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      channel.unsubscribe();
    };
  }, [id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        setElapsedSeconds(next);
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [setElapsedSeconds]);

  const doEnd = useCallback(async () => {
    const session = await endSession(id, { listenerDisplayName: listenerName });
    router.replace({
      pathname: '/post-session/[id]',
      params: {
        id,
        duration: elapsed.toString(),
        amount: session.total_amount.toString(),
        listenerId,
        listenerName,
      },
    });
  }, [id, elapsed, endSession, listenerId, listenerName]);

  const handleEndSession = useCallback(
    (autoEnd = false) => {
      if (!autoEnd) {
        setEndConfirmVisible(true);
        return;
      }
      doEnd();
    },
    [doEnd]
  );

  useEffect(() => {
    if (elapsed <= 0) return;

    if (estimatedBalance <= 0) {
      handleEndSession(true);
      return;
    }

    if (estimatedBalance < ratePerMin * 2 && !lowBalanceWarned) {
      setLowBalanceWarned(true);
      setLowBalanceVisible(true);
    }
  }, [elapsed, estimatedBalance, ratePerMin, lowBalanceWarned, handleEndSession]);

  // Real sessions: try edge-function billing ticks when available
  useEffect(() => {
    if (id.startsWith('mock-')) return;

    return startBillingInterval(id, (result) => {
      setBalance(result.wallet_balance);
      if (result.low_balance_warning && !lowBalanceWarned) {
        setLowBalanceWarned(true);
        setLowBalanceVisible(true);
      }
      if (result.session_ended) {
        handleEndSession(true);
      }
    });
  }, [id, handleEndSession, lowBalanceWarned, setBalance]);

  const handleSend = async () => {
    if (!text.trim() || !profile) return;
    const msgText = text.trim();
    setText('');

    if (id.startsWith('mock-')) {
      setMessages((prev) => [
        ...prev,
        {
          id: `mock-${Date.now()}`,
          session_id: id,
          sender_id: profile.id,
          text: msgText,
          created_at: new Date().toISOString(),
        },
      ]);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `mock-reply-${Date.now()}`,
            session_id: id,
            sender_id: listenerId,
            text: "I hear you. Take your time — I'm here to listen.",
            created_at: new Date().toISOString(),
          },
        ]);
      }, 2000);
      return;
    }

    await sendMessage(id, profile.id, msgText);
  };

  const handleReport = async (reason: string, details: string) => {
    if (profile) {
      await submitReport(profile.id, listenerId, reason, details, id).catch(() => {});
    }
    setReportVisible(false);
    doEnd();
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender_id === profile?.id;
    return (
      <View style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowThem]}>
        {!isMe && listenerAvatarUrl ? (
          <Image source={{ uri: listenerAvatarUrl }} style={styles.bubbleAvatar} contentFit="cover" />
        ) : !isMe ? (
          <View style={styles.bubbleAvatar} />
        ) : null}
        <View style={[styles.bubbleCol, isMe && styles.bubbleColMe]}>
          <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
            <Text style={[styles.bubbleText, isMe && styles.myBubbleText]}>{item.text}</Text>
          </View>
          <Text style={styles.bubbleTime}>{formatMessageTime(item.created_at)}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </Pressable>

          <View style={styles.headerCenter}>
            {listenerAvatarUrl ? (
              <View style={styles.headerAvatar}>
                <Image source={{ uri: listenerAvatarUrl }} style={styles.headerAvatarImage} contentFit="cover" />
              </View>
            ) : null}
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.headerName} numberOfLines={1}>
                {listenerName}
              </Text>
              <Text style={styles.headerSub}>Listener · online</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <Pressable style={styles.iconBtn} onPress={() => setReportVisible(true)} hitSlop={8}>
              <Ionicons name="flag-outline" size={18} color={colors.error} />
            </Pressable>
            <Pressable style={styles.endBtn} onPress={() => handleEndSession()} hitSlop={8}>
              <Text style={styles.endBtnText}>End</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.statusStrip}>
          <View style={styles.statusChip}>
            <View style={styles.liveDot} />
            <Text style={styles.statusChipValue}>{formatDuration(elapsed)}</Text>
          </View>
          <View style={styles.statusChip}>
            <Ionicons name="wallet-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.statusChipValue}>{formatCurrency(estimatedBalance)}</Text>
          </View>
          <View style={styles.statusChip}>
            <Text style={styles.statusChipText}>{formatCurrency(ratePerMin)}/min</Text>
          </View>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messages}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
              <Ionicons name="chatbubbles-outline" size={28} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>You're in a safe space</Text>
            <Text style={styles.emptyBody}>
              Share what's on your mind with {listenerName}. They'll respond when you're ready.
            </Text>
          </View>
        }
      />

      <View style={styles.composerWrap}>
        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={colors.textLight}
            value={text}
            onChangeText={setText}
            multiline
            returnKeyType="default"
          />
          <TouchableOpacity
            style={[styles.sendBtn, canSend ? styles.sendBtnActive : styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!canSend}
            activeOpacity={0.85}>
            <Ionicons name="send" size={18} color={canSend ? colors.onPrimary : colors.textLight} />
          </TouchableOpacity>
        </View>
        <Text style={styles.safeHint}>Chats are private · Billed per minute while active</Text>
      </View>

      <ReportModal visible={reportVisible} onClose={() => setReportVisible(false)} onSubmit={handleReport} />

      <ConfirmDialog
        visible={endConfirmVisible}
        title="End chat?"
        message="Are you sure you want to end this session? You'll be taken to rate your experience."
        variant="warning"
        destructive
        confirmLabel="End session"
        cancelLabel="Cancel"
        onCancel={() => setEndConfirmVisible(false)}
        onConfirm={() => {
          setEndConfirmVisible(false);
          doEnd();
        }}
      />

      <ConfirmDialog
        visible={lowBalanceVisible}
        title="Low balance"
        message="Less than 2 minutes remaining. Recharge to continue."
        variant="warning"
        confirmLabel="OK"
        onConfirm={() => setLowBalanceVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}
