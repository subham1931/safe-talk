import { useEffect, useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ReportModal } from '@/components/ReportModal';
import { FlatColors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import { useSessionStore } from '@/store/sessionStore';
import { getMessages, sendMessage, subscribeToMessages } from '@/services/chat/ChatService';
import { startBillingInterval, endSessionBilling } from '@/services/billing/BillingService';
import { submitReport } from '@/services/listener/ListenerService';
import { Message } from '@/types';
import { formatDuration, formatCurrency } from '@/utils/helpers';
import { useTheme } from '@/hooks/useTheme';

function createStyles(colors: FlatColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing.md,
      paddingTop: 56,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    topInfo: { flex: 1, marginHorizontal: Spacing.md },
    topName: { fontSize: FontSize.md, fontWeight: '700', color: colors.text },
    topMeta: { fontSize: FontSize.xs, color: colors.textSecondary },
    messages: { padding: Spacing.md, flexGrow: 1 },
    systemMsg: { textAlign: 'center', color: colors.textLight, fontSize: FontSize.sm, marginTop: Spacing.xl },
    bubble: { maxWidth: '80%', padding: Spacing.md, borderRadius: BorderRadius.lg, marginBottom: Spacing.sm },
    myBubble: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderBottomRightRadius: 4 },
    theirBubble: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderBottomLeftRadius: 4 },
    bubbleText: { fontSize: FontSize.md, color: colors.text, lineHeight: 22 },
    myBubbleText: { color: colors.onPrimary },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      padding: Spacing.md,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: Spacing.sm,
    },
    input: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: BorderRadius.lg,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      fontSize: FontSize.md,
      color: colors.text,
      maxHeight: 100,
    },
    sendBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}

export default function ChatSessionScreen() {
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

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [reportVisible, setReportVisible] = useState(false);
  const [lowBalanceWarned, setLowBalanceWarned] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const ratePerMin = parseFloat(rate ?? '5');

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
  }, []);

  useEffect(() => {
    if (id.startsWith('mock-')) {
      const mockBilling = setInterval(() => {
        const debit = ratePerMin / 60;
        const newBalance = balance - debit;
        if (newBalance <= 0) {
          handleEndSession(true);
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
        handleEndSession(true);
      }
    });
  }, [id]);

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

  const handleEndSession = async (autoEnd = false) => {
    if (!autoEnd) {
      Alert.alert('End chat?', 'Are you sure you want to end this session?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'End', style: 'destructive', onPress: () => doEnd() },
      ]);
      return;
    }
    doEnd();
  };

  const doEnd = async () => {
    if (!id.startsWith('mock-')) {
      await endSessionBilling(id).catch(() => {});
    }
    const session = await endSession(id);
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
      <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
        <Text style={[styles.bubbleText, isMe && styles.myBubbleText]}>{item.text}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => handleEndSession()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.topInfo}>
          <Text style={styles.topName}>{listenerName}</Text>
          <Text style={styles.topMeta}>
            {formatDuration(elapsed)} · {formatCurrency(balance)} left
          </Text>
        </View>
        <TouchableOpacity onPress={() => setReportVisible(true)}>
          <Ionicons name="flag-outline" size={22} color={colors.error} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messages}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListEmptyComponent={
          <Text style={styles.systemMsg}>Session started. Say hello when you are ready.</Text>
        }
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={colors.textLight}
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Ionicons name="send" size={20} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>

      <ReportModal visible={reportVisible} onClose={() => setReportVisible(false)} onSubmit={handleReport} />
    </KeyboardAvoidingView>
  );
}
