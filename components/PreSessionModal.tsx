import { useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './ui/Button';
import { FlatColors, BorderRadius, FontSize, Spacing } from '@/constants/theme';
import { SessionType } from '@/types';
import { useTheme } from '@/hooks/useTheme';

interface PreSessionModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onRecharge: () => void;
  listenerName: string;
  sessionType: SessionType;
  ratePerMin: number;
  balance: number;
}

function createStyles(colors: FlatColors) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: BorderRadius.xl,
      borderTopRightRadius: BorderRadius.xl,
      padding: Spacing.lg,
      paddingBottom: Spacing.xxl,
    },
    closeBtn: { alignSelf: 'flex-end' },
    title: { fontSize: FontSize.xl, fontWeight: '800', color: colors.text, marginTop: Spacing.sm },
    subtitle: { fontSize: FontSize.md, color: colors.textSecondary, marginBottom: Spacing.lg },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    infoLabel: { fontSize: FontSize.md, color: colors.textSecondary },
    infoValue: { fontSize: FontSize.md, fontWeight: '700', color: colors.text },
    warning: { color: colors.warning },
    warningBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      backgroundColor: colors.warning + '15',
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
      marginTop: Spacing.md,
    },
    warningText: { flex: 1, fontSize: FontSize.sm, color: colors.warning },
    actions: { marginTop: Spacing.lg, gap: Spacing.sm },
  });
}

export function PreSessionModal({
  visible,
  onClose,
  onConfirm,
  onRecharge,
  listenerName,
  sessionType,
  ratePerMin,
  balance,
}: PreSessionModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const estimatedMinutes = Math.floor(balance / ratePerMin);
  const isLowBalance = estimatedMinutes < 2;

  const typeLabel = sessionType === 'chat' ? 'Chat' : sessionType === 'call' ? 'Voice Call' : 'Video Call';

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <Text style={styles.title}>Start {typeLabel}?</Text>
          <Text style={styles.subtitle}>with {listenerName}</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Rate</Text>
            <Text style={styles.infoValue}>₹{ratePerMin}/min</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Your balance</Text>
            <Text style={styles.infoValue}>₹{balance.toFixed(0)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Estimated time</Text>
            <Text style={[styles.infoValue, isLowBalance && styles.warning]}>
              ~{estimatedMinutes} min
            </Text>
          </View>

          {isLowBalance && (
            <View style={styles.warningBox}>
              <Ionicons name="warning" size={20} color={colors.warning} />
              <Text style={styles.warningText}>
                Low balance — recharge for a longer session
              </Text>
            </View>
          )}

          <View style={styles.actions}>
            {isLowBalance && (
              <Button title="Recharge Now" onPress={onRecharge} variant="outline" />
            )}
            <Button
              title={`Start ${typeLabel}`}
              onPress={onConfirm}
              disabled={estimatedMinutes < 1}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
