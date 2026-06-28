import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { FlatColors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { submitReview } from '@/services/listener/ListenerService';
import { formatDuration, formatCurrency } from '@/utils/helpers';
import { useTheme } from '@/hooks/useTheme';

function createStyles(colors: FlatColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: Spacing.lg, paddingTop: 80 },
    summary: { alignItems: 'center', marginBottom: Spacing.xl },
    title: { fontSize: FontSize.xxl, fontWeight: '800', color: colors.text, marginTop: Spacing.md },
    subtitle: { fontSize: FontSize.md, color: colors.textSecondary },
    stats: { flexDirection: 'row', gap: Spacing.xl, marginTop: Spacing.lg },
    stat: { alignItems: 'center' },
    statLabel: { fontSize: FontSize.sm, color: colors.textSecondary },
    statValue: { fontSize: FontSize.xl, fontWeight: '800', color: colors.text, marginTop: 4 },
    ratingSection: { marginBottom: Spacing.xl },
    ratingTitle: {
      fontSize: FontSize.lg,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: Spacing.md,
    },
    stars: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm, marginBottom: Spacing.lg },
    feedbackInput: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      fontSize: FontSize.md,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 80,
      textAlignVertical: 'top',
      marginBottom: Spacing.md,
    },
    thankYou: { textAlign: 'center', fontSize: FontSize.lg, color: colors.primary, marginBottom: Spacing.xl },
    actions: { marginTop: 'auto' },
  });
}

export default function PostSessionScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { id, duration, amount, listenerId, listenerName } = useLocalSearchParams<{
    id: string;
    duration: string;
    amount: string;
    listenerId: string;
    listenerName: string;
  }>();

  const profile = useAuthStore((s) => s.profile);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!profile || rating === 0) return;
    if (!id.startsWith('mock-')) {
      await submitReview(id, profile.id, listenerId, rating, feedback).catch(() => {});
    }
    setSubmitted(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <Ionicons name="checkmark-circle" size={64} color={colors.success} />
        <Text style={styles.title}>Session Complete</Text>
        <Text style={styles.subtitle}>with {listenerName}</Text>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Duration</Text>
            <Text style={styles.statValue}>{formatDuration(parseInt(duration ?? '0'))}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Amount spent</Text>
            <Text style={styles.statValue}>{formatCurrency(parseFloat(amount ?? '0'))}</Text>
          </View>
        </View>
      </View>

      {!submitted ? (
        <View style={styles.ratingSection}>
          <Text style={styles.ratingTitle}>Rate your experience</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={36}
                  color={colors.amber}
                />
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.feedbackInput}
            placeholder="Optional feedback..."
            placeholderTextColor={colors.textLight}
            value={feedback}
            onChangeText={setFeedback}
            multiline
          />
          <Button title="Submit Rating" onPress={handleSubmit} disabled={rating === 0} size="lg" />
        </View>
      ) : (
        <Text style={styles.thankYou}>Thank you for your feedback! 💜</Text>
      )}

      <View style={styles.actions}>
        <Button title="Talk Again" onPress={() => router.push(`/listener/${listenerId}`)} variant="outline" />
        <Button title="Back to Home" onPress={() => router.replace('/(seeker)')} size="lg" style={{ marginTop: Spacing.sm }} />
      </View>
    </View>
  );
}
