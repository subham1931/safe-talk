import { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { ListenerCard } from '@/components/ListenerCard';
import { CATEGORIES, Category } from '@/constants/categories';
import { FlatColors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { useListenerStore } from '@/store/listenerStore';
import { useTheme } from '@/hooks/useTheme';

function createStyles(colors: FlatColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    search: {
      margin: Spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      fontSize: FontSize.md,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sortRow: { flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: Spacing.sm, marginBottom: Spacing.sm },
    sortBtn: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sortActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    sortText: { fontSize: FontSize.xs, color: colors.textSecondary },
    sortTextActive: { color: colors.onPrimary, fontWeight: '600' },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
    chip: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipText: { fontSize: FontSize.sm, color: colors.textSecondary },
    chipTextActive: { color: colors.onPrimary },
    list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  });
}

export default function DirectoryScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { listeners, fetchListeners } = useListenerStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category>('All');
  const [sortBy, setSortBy] = useState<'online' | 'rating' | 'price'>('online');

  useEffect(() => {
    fetchListeners();
  }, []);

  let filtered = listeners.filter((l) => {
    const matchSearch =
      !search ||
      l.display_name.toLowerCase().includes(search.toLowerCase()) ||
      l.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = category === 'All' || l.tags.includes(category);
    return matchSearch && matchCategory;
  });

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'online') return (b.is_online ? 1 : 0) - (a.is_online ? 1 : 0);
    if (sortBy === 'rating') return b.rating - a.rating;
    return a.rate_per_min_chat - b.rate_per_min_chat;
  });

  return (
    <>
      <Stack.Screen options={{ title: 'All Listeners' }} />
      <View style={styles.container}>
        <TextInput
          style={styles.search}
          placeholder="Search by name or specialty..."
          placeholderTextColor={colors.textLight}
          value={search}
          onChangeText={setSearch}
        />

        <View style={styles.sortRow}>
          {(['online', 'rating', 'price'] as const).map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.sortBtn, sortBy === s && styles.sortActive]}
              onPress={() => setSortBy(s)}>
              <Text style={[styles.sortText, sortBy === s && styles.sortTextActive]}>
                {s === 'online' ? 'Online first' : s === 'rating' ? 'Top rated' : 'Lowest price'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.chips}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, category === cat && styles.chipActive]}
                  onPress={() => setCategory(cat)}>
                  <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          }
          renderItem={({ item }) => (
            <ListenerCard
              listener={item}
              onPress={() => router.push(`/listener/${item.id}`)}
            />
          )}
        />
      </View>
    </>
  );
}
