import { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, FlatColors, FontSize, Spacing, Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface UploadBoxProps {
  label: string;
  caption?: string;
  uploaded?: boolean;
  imageUri?: string;
  onPress: () => void;
}

function createStyles(colors: FlatColors) {
  return StyleSheet.create({
    box: {
      flex: 1,
      aspectRatio: 0.85,
      borderRadius: BorderRadius.card,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing.md,
      gap: Spacing.xs,
    },
    preview: {
      width: '100%',
      height: '100%',
      borderRadius: BorderRadius.card - 4,
    },
    label: {
      fontFamily: Fonts.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.ink,
      textAlign: 'center',
    },
    caption: {
      fontFamily: Fonts.body,
      fontSize: FontSize.xs,
      color: colors.inkSecondary,
      textAlign: 'center',
    },
    badge: {
      position: 'absolute',
      top: Spacing.sm,
      right: Spacing.sm,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}

export function UploadBox({ label, caption, uploaded, imageUri, onPress }: UploadBoxProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <TouchableOpacity style={styles.box} onPress={onPress} activeOpacity={0.85}>
      {uploaded && imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.preview} />
      ) : (
        <>
          <Ionicons name="cloud-upload-outline" size={32} color={colors.inkSecondary} />
          <Text style={styles.label}>{label}</Text>
          {caption && <Text style={styles.caption}>{caption}</Text>}
        </>
      )}
      {uploaded && (
        <View style={styles.badge}>
          <Ionicons name="add" size={16} color={colors.surface} />
        </View>
      )}
    </TouchableOpacity>
  );
}
