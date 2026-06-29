import { useMemo } from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';
import {
  BorderRadius,
  FlatColors,
  FontSize,
  Fonts,
  Spacing,
  TypographyTokens,
  createElevation,
} from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

export type ConfirmDialogVariant = 'success' | 'error' | 'warning' | 'info' | 'danger';

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  /** When true, confirm button uses danger styling (e.g. End session, Log out). */
  destructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

function variantConfig(variant: ConfirmDialogVariant, colors: FlatColors) {
  switch (variant) {
    case 'success':
      return { icon: 'checkmark-circle' as const, color: colors.success, bg: colors.success + '18' };
    case 'error':
      return { icon: 'close-circle' as const, color: colors.error, bg: colors.error + '18' };
    case 'warning':
      return { icon: 'warning' as const, color: colors.warning, bg: colors.warning + '18' };
    case 'danger':
      return { icon: 'log-out-outline' as const, color: colors.error, bg: colors.error + '18' };
    default:
      return { icon: 'information-circle' as const, color: colors.primary, bg: colors.primary + '18' };
  }
}

function createStyles(
  colors: FlatColors,
  typography: TypographyTokens,
  elevation: ReturnType<typeof createElevation>
) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    overlay: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing.lg,
    },
    dismissArea: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.background,
    },
    card: {
      width: '100%',
      maxWidth: 340,
      padding: Spacing.lg,
      ...elevation.soft,
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      zIndex: 2,
      elevation: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.35,
      shadowRadius: 24,
    },
    iconWrap: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      marginBottom: Spacing.md,
    },
    title: {
      ...typography.headlineMedium,
      textAlign: 'center',
      marginBottom: Spacing.sm,
    },
    message: {
      fontFamily: Fonts.body,
      fontSize: FontSize.md,
      lineHeight: 24,
      color: colors.inkSecondary,
      textAlign: 'center',
      marginBottom: Spacing.lg,
    },
    actions: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    actionSingle: { flex: 1 },
    actionHalf: { flex: 1 },
  });
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'OK',
  cancelLabel,
  variant = 'info',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { colors, typography, elevation } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, typography, elevation),
    [colors, typography, elevation]
  );
  const config = variantConfig(variant, colors);
  const hasCancel = Boolean(cancelLabel);
  const confirmVariant = destructive || variant === 'danger' ? 'danger' : 'primary';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      onRequestClose={onCancel ?? onConfirm}>
      <View style={styles.root}>
        <View style={styles.overlay}>
          <Pressable
            style={styles.dismissArea}
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel="Dismiss dialog"
          />
          <View style={styles.card} accessibilityViewIsModal>
            <View style={[styles.iconWrap, { backgroundColor: config.bg }]}>
              <Ionicons name={config.icon} size={32} color={config.color} />
            </View>
            <Text style={styles.title}>{title}</Text>
            {message ? <Text style={styles.message}>{message}</Text> : null}
            <View style={styles.actions}>
              {hasCancel && (
                <View style={styles.actionHalf}>
                  <Button title={cancelLabel!} variant="outline" onPress={onCancel!} size="md" />
                </View>
              )}
              <View style={hasCancel ? styles.actionHalf : styles.actionSingle}>
                <Button
                  title={confirmLabel}
                  variant={confirmVariant}
                  onPress={onConfirm}
                  size="md"
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
