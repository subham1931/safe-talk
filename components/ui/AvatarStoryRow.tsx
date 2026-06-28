import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { FlatColors, FontSize, Spacing, Fonts, StatusIndicatorColors } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

export interface AvatarStoryItem {
  id: string;
  avatarId?: string;
  imageUri?: string;
  label: string;
  isOnline?: boolean;
}

interface AvatarStoryRowProps {
  items: AvatarStoryItem[];
  onPress?: (id: string) => void;
}

function createStyles(colors: FlatColors) {
  return StyleSheet.create({
    row: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
      gap: Spacing.md,
    },
    item: {
      alignItems: 'center',
      width: 72,
    },
    ring: {
      padding: 3,
      borderRadius: 999,
      borderWidth: 2,
      marginBottom: Spacing.xs,
    },
    ringOnline: {
      borderColor: StatusIndicatorColors.online,
    },
    ringOffline: {
      borderColor: colors.border,
    },
    label: {
      fontFamily: Fonts.bodyMedium,
      fontSize: FontSize.xs,
      color: colors.ink,
      textAlign: 'center',
    },
  });
}

export function AvatarStoryRow({ items, onPress }: AvatarStoryRowProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (items.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.item}
          onPress={() => onPress?.(item.id)}
          activeOpacity={0.85}>
          <View
            style={[
              styles.ring,
              item.isOnline ? styles.ringOnline : styles.ringOffline,
            ]}>
            <Avatar avatarId={item.avatarId} imageUri={item.imageUri} size={56} />
          </View>
          <Text style={styles.label} numberOfLines={1}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
