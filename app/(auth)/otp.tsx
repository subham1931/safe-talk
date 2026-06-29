import { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { OTPInput } from '@/components/ui/OTPInput';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DecorativeDashedCircles } from '@/components/ui/DecorativeDashedCircles';
import { FlatColors, Spacing, TypographyTokens, Fonts, FontSize } from '@/constants/theme';
import { verifyOtp, sendOtp } from '@/services/auth/AuthService';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';
import { ConfirmDialogVariant } from '@/components/ui/ConfirmDialog';

function maskPhone(phone: string) {
  if (phone.length < 4) return phone;
  return phone.slice(0, -4).replace(/\d/g, '•') + phone.slice(-4);
}

function createStyles(colors: FlatColors, typography: TypographyTokens) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: Spacing.lg,
      paddingTop: 80,
      overflow: 'hidden',
    },
    title: { ...typography.headlineLarge, marginBottom: Spacing.sm },
    subtitle: { ...typography.caption, marginBottom: Spacing.xl },
    resend: { ...typography.caption, textAlign: 'center', marginTop: Spacing.lg },
    resendLink: {
      fontFamily: Fonts.bodyMedium,
      fontSize: FontSize.sm,
      color: colors.primary,
      textAlign: 'center',
      marginTop: Spacing.lg,
    },
  });
}

export default function OtpScreen() {
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [dialog, setDialog] = useState<{
    title: string;
    message: string;
    variant: ConfirmDialogVariant;
  } | null>(null);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setDialog({
        title: 'Invalid OTP',
        message: 'Please enter the 6-digit code.',
        variant: 'warning',
      });
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(phone!, otp);
      await refreshProfile();
      router.replace('/(auth)/role');
    } catch {
      setDialog({
        title: 'Verification failed',
        message: 'Invalid or expired OTP. Please try again.',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!phone) return;
    try {
      await sendOtp(phone);
      setTimer(30);
      setDialog({
        title: 'Code sent',
        message: 'A new verification code has been sent.',
        variant: 'success',
      });
    } catch {
      setDialog({
        title: 'Resend failed',
        message: 'Could not resend the code. Please try again.',
        variant: 'error',
      });
    }
  };

  return (
    <View style={styles.container}>
      <DecorativeDashedCircles tone="orange" />
      <Text style={styles.title}>Enter verification code</Text>
      <Text style={styles.subtitle}>Sent to {maskPhone(phone ?? '')}</Text>

      <OTPInput value={otp} onChange={setOtp} length={6} />

      <Button title="Verify" onPress={handleVerify} loading={loading} size="lg" />

      {timer > 0 ? (
        <Text style={styles.resend}>Resend code in {timer}s</Text>
      ) : (
        <TouchableOpacity onPress={handleResend}>
          <Text style={styles.resendLink}>Did not receive? Resend code</Text>
        </TouchableOpacity>
      )}

      <ConfirmDialog
        visible={dialog !== null}
        title={dialog?.title ?? ''}
        message={dialog?.message}
        variant={dialog?.variant}
        onConfirm={() => setDialog(null)}
      />
    </View>
  );
}
