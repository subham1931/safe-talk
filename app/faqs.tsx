import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FAQS } from '@/constants/faqs';
import { FlatColors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

function createStyles(colors: FlatColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: Spacing.lg },
    item: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      marginBottom: Spacing.sm,
    },
    questionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    question: {
      flex: 1,
      fontSize: FontSize.md,
      fontWeight: '600',
      color: colors.text,
      paddingRight: Spacing.sm,
    },
    answer: { fontSize: FontSize.sm, color: colors.textSecondary, marginTop: Spacing.sm, lineHeight: 22 },
  });
}

export default function FAQsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <>
      <Stack.Screen options={{ title: 'FAQs' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {FAQS.map((faq) => (
          <TouchableOpacity
            key={faq.id}
            style={styles.item}
            onPress={() => setExpanded(expanded === faq.id ? null : faq.id)}
            activeOpacity={0.8}>
            <View style={styles.questionRow}>
              <Text style={styles.question}>{faq.question}</Text>
              <Ionicons
                name={expanded === faq.id ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.textSecondary}
              />
            </View>
            {expanded === faq.id && <Text style={styles.answer}>{faq.answer}</Text>}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );
}
