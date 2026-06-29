import { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { FlatColors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useListenerStore } from '@/store/listenerStore';
import { getSessionHistory } from '@/services/session/SessionService';
import { SessionHistoryItem } from '@/services/session/LocalSessionHistory';
import { formatCurrency, formatDate, formatDuration } from '@/utils/helpers';
import { useTheme } from '@/hooks/useTheme';

function createStyles(colors: FlatColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: Spacing.lg, paddingTop: 60 },
    title: { fontSize: FontSize.xxl, fontWeight: '800', color: colors.text, marginBottom: Spacing.lg },
    empty: { fontSize: FontSize.md, color: colors.textSecondary, marginTop: Spacing.xl, textAlign: 'center' },
    card: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      marginBottom: Spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    type: { fontSize: FontSize.md, fontWeight: '700', color: colors.text, textTransform: 'capitalize' },
    amount: { fontSize: FontSize.md, fontWeight: '700', color: colors.primary },
    meta: { fontSize: FontSize.sm, color: colors.textSecondary, marginTop: 4 },
    status: { fontSize: FontSize.xs, color: colors.textLight, marginTop: 4, textTransform: 'capitalize' },
  });
}

export default function SessionsTabScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const profile = useAuthStore((s) => s.profile);
  const getListenerById = useListenerStore((s) => s.getListenerById);
  const [sessions, setSessions] = useState<SessionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSessions = useCallback(() => {
    if (!profile) return;
    setLoading(true);
    getSessionHistory(profile.id, 'seeker')
      .then(setSessions)
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, [profile?.id]);

  useFocusEffect(
    useCallback(() => {
      loadSessions();
    }, [loadSessions])
  );

  const getListenerLabel = (item: SessionHistoryItem) => {
    if (item.listener_display_name) return item.listener_display_name;
    const listener = getListenerById(item.listener_id);
    return listener?.display_name ?? 'Listener';
  };

  const renderItem = ({ item }: { item: SessionHistoryItem }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.type}>{item.type} with {getListenerLabel(item)}</Text>
        {item.status === 'ended' && (
          <Text style={styles.amount}>{formatCurrency(item.total_amount)}</Text>
        )}
      </View>
      <Text style={styles.meta}>
        {item.ended_at ? formatDate(item.ended_at) : 'In progress'} ·{' '}
        {formatDuration(Math.round(item.total_minutes * 60))}
      </Text>
      {item.category_tag && <Text style={styles.meta}>{item.category_tag}</Text>}
      <Text style={styles.status}>{item.status}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Session History</Text>
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: Spacing.xl }} />
      ) : sessions.length === 0 ? (
        <Text style={styles.empty}>Your past sessions will appear here.</Text>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
