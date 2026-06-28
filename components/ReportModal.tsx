import { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import { Button } from './ui/Button';
import { RadioRow } from './ui/RadioRow';
import { FlatColors, BorderRadius, FontSize, Spacing, TypographyTokens, Fonts, createElevation } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

const REASONS = ['Harassment', 'Inappropriate content', 'Spam', 'Other'];

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string, details: string) => void;
}

function createStyles(
  colors: FlatColors,
  typography: TypographyTokens,
  elevation: ReturnType<typeof createElevation>
) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(46,31,34,0.45)',
      justifyContent: 'flex-end',
    },
    sheet: {
      ...elevation.soft,
      borderTopLeftRadius: BorderRadius.xl,
      borderTopRightRadius: BorderRadius.xl,
      padding: Spacing.lg,
      maxHeight: '80%',
    },
    title: { ...typography.headlineMedium, marginBottom: Spacing.xs },
    subtitle: { ...typography.caption, marginBottom: Spacing.lg },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: BorderRadius.card,
      padding: Spacing.md,
      fontFamily: Fonts.body,
      fontSize: FontSize.md,
      color: colors.ink,
      minHeight: 80,
      textAlignVertical: 'top',
      marginTop: Spacing.sm,
    },
    actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.sm, marginTop: Spacing.lg },
  });
}

export function ReportModal({ visible, onClose, onSubmit }: ReportModalProps) {
  const { colors, typography, elevation } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, typography, elevation),
    [colors, typography, elevation]
  );
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');

  const handleSubmit = () => {
    if (!reason) return;
    onSubmit(reason, details);
    setReason('');
    setDetails('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Report & Block</Text>
          <Text style={styles.subtitle}>This will end the session and block this user.</Text>

          <ScrollView>
            {REASONS.map((r) => (
              <RadioRow key={r} label={r} selected={reason === r} onPress={() => setReason(r)} />
            ))}

            <TextInput
              style={styles.input}
              placeholder="Additional details (optional)"
              placeholderTextColor={colors.inkSecondary}
              value={details}
              onChangeText={setDetails}
              multiline
              numberOfLines={3}
            />
          </ScrollView>

          <View style={styles.actions}>
            <Button title="Cancel" onPress={onClose} variant="ghost" />
            <Button title="Submit Report" onPress={handleSubmit} variant="danger" disabled={!reason} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
