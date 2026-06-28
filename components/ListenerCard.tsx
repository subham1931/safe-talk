import { useMemo } from 'react';
import { ListenerProfile, SessionType } from '@/types';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from './ui/Avatar';
import { Badge } from './ui/Badge';
import { getListenerAvatarUrl } from '@/constants/listenerAvatars';
import { FlatColors, BorderRadius, FontSize, Spacing, Fonts, createElevation } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface ListenerCardProps {
  listener: ListenerProfile;
  onPress: () => void;
  onChat?: () => void;
  onCall?: () => void;
  onVideo?: () => void;
  compact?: boolean;
}

function createStyles(colors: FlatColors, elevation: ReturnType<typeof createElevation>, compact?: boolean) {
  const avatarSize = compact ? 48 : 64;

  return StyleSheet.create({
    card: {
      ...elevation.card,
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: BorderRadius.card,
      padding: Spacing.md,
      marginHorizontal: Spacing.lg,
      marginBottom: Spacing.sm,
      gap: Spacing.md,
    },
    avatarCol: {
      width: avatarSize,
      alignSelf: 'flex-start',
    },
    content: {
      flex: 1,
      minWidth: 0,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: Spacing.sm,
    },
    name: {
      flex: 1,
      fontFamily: Fonts.bodySemiBold,
      fontSize: FontSize.md,
      color: colors.ink,
    },
    rating: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    ratingText: {
      fontFamily: Fonts.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.inkSecondary,
      lineHeight: FontSize.sm * 1.2,
    },
    bio: {
      fontFamily: Fonts.body,
      fontSize: FontSize.sm,
      color: colors.inkSecondary,
      marginTop: Spacing.sm,
      lineHeight: 20,
    },
    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: Spacing.sm + 2,
      gap: Spacing.sm,
    },
    tags: {
      flex: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: Spacing.xs,
    },
    rate: {
      fontFamily: Fonts.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.ink,
      flexShrink: 0,
    },
    actions: {
      alignSelf: 'center',
      gap: Spacing.sm,
    },
    actionBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.actionTertiaryFill,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}

export function ListenerCard({
  listener,
  onPress,
  onChat,
  onCall,
  onVideo,
  compact,
}: ListenerCardProps) {
  const { colors, elevation } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, elevation, compact),
    [colors, elevation, compact]
  );
  const avatarSize = compact ? 48 : 64;
  const photoUri = getListenerAvatarUrl(listener);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.avatarCol}>
        <Avatar
          imageUri={photoUri}
          size={avatarSize}
          showOnline
          isOnline={listener.is_online}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {listener.display_name}
          </Text>
          <View style={styles.rating}>
            <Ionicons name="star" size={14} color={colors.rating} />
            <Text style={styles.ratingText}>{listener.rating.toFixed(1)}</Text>
          </View>
        </View>

        {!compact && (
          <Text style={styles.bio} numberOfLines={2}>
            {listener.bio}
          </Text>
        )}

        <View style={styles.footerRow}>
          <View style={styles.tags}>
            {listener.languages.slice(0, 2).map((lang) => (
              <Badge key={lang} label={lang} chipStyle="filled" />
            ))}
          </View>
          <Text style={styles.rate}>₹{listener.rate_per_min_chat}/min</Text>
        </View>
      </View>

      {!compact && listener.is_online && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={onChat} hitSlop={4}>
            <Ionicons name="chatbubble" size={20} color={colors.ink} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={onCall} hitSlop={4}>
            <Ionicons name="call" size={20} color={colors.ink} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={onVideo} hitSlop={4}>
            <Ionicons name="videocam" size={20} color={colors.ink} />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

export function getRateForType(listener: ListenerProfile, type: SessionType): number {
  switch (type) {
    case 'chat':
      return listener.rate_per_min_chat;
    case 'call':
      return listener.rate_per_min_call;
    case 'video':
      return listener.rate_per_min_video;
  }
}
