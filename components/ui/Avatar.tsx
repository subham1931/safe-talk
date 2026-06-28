import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { FlatColors, StatusIndicatorColors } from '@/constants/theme';
import { getAvatar, getAvatarBackground } from '@/constants/avatars';
import { useTheme } from '@/hooks/useTheme';

interface AvatarProps {
  avatarId?: string;
  imageUri?: string;
  size?: number;
  showOnline?: boolean;
  isOnline?: boolean;
}

function createStyles(colors: FlatColors) {
  return StyleSheet.create({
    circle: {
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    photo: {
      width: '100%',
      height: '100%',
    },
    dot: {
      position: 'absolute',
      borderWidth: 2,
      borderColor: colors.surface,
    },
  });
}

export function Avatar({ avatarId, imageUri, size = 48, showOnline, isOnline }: AvatarProps) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const avatar = getAvatar(avatarId);
  const backgroundColor = getAvatarBackground(avatarId, isDark);

  return (
    <View style={{ width: size, height: size }}>
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: imageUri ? colors.surfaceAlt : backgroundColor,
          },
        ]}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.photo} contentFit="cover" />
        ) : (
          <Text style={{ fontSize: size * 0.45 }}>{avatar.emoji}</Text>
        )}
      </View>
      {showOnline && (
        <View
          style={[
            styles.dot,
            {
              backgroundColor: isOnline ? StatusIndicatorColors.online : colors.offline,
              width: size * 0.25,
              height: size * 0.25,
              borderRadius: size * 0.125,
              right: 0,
              bottom: 0,
            },
          ]}
        />
      )}
    </View>
  );
}
