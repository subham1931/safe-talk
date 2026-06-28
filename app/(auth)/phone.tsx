import { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { PillTextInput } from '@/components/ui/PillTextInput';
import { DecorativeDashedCircles } from '@/components/ui/DecorativeDashedCircles';
import {
  FlatColors,
  FontSize,
  Spacing,
  Fonts,
  TypographyTokens,
  BorderRadius,
} from '@/constants/theme';
import { sendOtp } from '@/services/auth/AuthService';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';

type AuthMode = 'login' | 'register';

function createStyles(colors: FlatColors, typography: TypographyTokens) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: Spacing.lg, paddingTop: 80, paddingBottom: Spacing.xxl },
    logo: {
      fontFamily: Fonts.headlineExtra,
      fontSize: FontSize.xl,
      color: colors.primary,
      marginBottom: Spacing.xl,
    },
    title: { ...typography.headlineLarge, marginBottom: Spacing.sm },
    subtitle: { ...typography.caption, marginBottom: Spacing.xl },
    modeToggle: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.pill,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 4,
      marginBottom: Spacing.lg,
    },
    modeBtn: {
      flex: 1,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.pill,
      alignItems: 'center',
    },
    modeBtnActive: {
      backgroundColor: colors.primary,
    },
    modeBtnText: {
      fontFamily: Fonts.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.inkSecondary,
    },
    modeBtnTextActive: {
      color: colors.onPrimary,
    },
    countryText: {
      fontFamily: Fonts.bodySemiBold,
      fontSize: FontSize.md,
      color: colors.ink,
    },
    ghostLink: { alignItems: 'center', marginTop: Spacing.lg },
    ghostText: {
      fontFamily: Fonts.bodyMedium,
      fontSize: FontSize.sm,
      color: colors.primary,
    },
    modeSwitch: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: Spacing.lg,
      flexWrap: 'wrap',
    },
    modeSwitchText: {
      fontFamily: Fonts.body,
      fontSize: FontSize.sm,
      color: colors.inkSecondary,
    },
    modeSwitchAction: {
      fontFamily: Fonts.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.primary,
    },
  });
}

export default function PhoneScreen() {
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const loginWithEmail = useAuthStore((s) => s.loginWithEmail);

  const isLogin = mode === 'login';

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      await loginWithEmail(email.trim(), password);
      const profile = useAuthStore.getState().profile;
      if (profile?.onboarding_complete) {
        router.replace(profile.role === 'listener' ? '/(listener)' : '/(seeker)');
      } else {
        router.replace('/(auth)/role');
      }
    } catch (err) {
      Alert.alert('Login failed', err instanceof Error ? err.message : 'Try again');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (phone.length < 10) {
      Alert.alert('Invalid phone', 'Please enter a valid 10-digit phone number.');
      return;
    }

    setLoading(true);
    try {
      const formatted = await sendOtp(phone);
      router.push({ pathname: '/(auth)/otp', params: { phone: formatted } });
    } catch {
      Alert.alert(
        'OTP unavailable',
        'Phone verification is not configured yet. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <DecorativeDashedCircles tone="plum" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>🛡️ safeTalk</Text>

        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeBtn, isLogin && styles.modeBtnActive]}
            onPress={() => setMode('login')}
            activeOpacity={0.85}>
            <Text style={[styles.modeBtnText, isLogin && styles.modeBtnTextActive]}>Log in</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, !isLogin && styles.modeBtnActive]}
            onPress={() => setMode('register')}
            activeOpacity={0.85}>
            <Text style={[styles.modeBtnText, !isLogin && styles.modeBtnTextActive]}>Register</Text>
          </TouchableOpacity>
        </View>

        {isLogin ? (
          <>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Log in with your email and password</Text>

            <PillTextInput
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              containerStyle={{ marginBottom: Spacing.sm }}
            />
            <PillTextInput
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              containerStyle={{ marginBottom: Spacing.lg }}
            />

            <Button title="Log in" onPress={handleLogin} loading={loading} size="lg" />
          </>
        ) : (
          <>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>
              Enter your phone number — we will send a verification code
            </Text>

            <PillTextInput
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={setPhone}
              placeholder="9876543210"
              leftSlot={<Text style={styles.countryText}>🇮🇳 +91</Text>}
              containerStyle={{ marginBottom: Spacing.lg }}
            />

            <Button title="Register" onPress={handleRegister} loading={loading} size="lg" />

            <TouchableOpacity onPress={() => router.push('/(auth)/onboarding')} style={styles.ghostLink}>
              <Text style={styles.ghostText}>New here? Learn about safeTalk</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.modeSwitch}>
          <Text style={styles.modeSwitchText}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
          </Text>
          <TouchableOpacity onPress={() => setMode(isLogin ? 'register' : 'login')}>
            <Text style={styles.modeSwitchAction}>{isLogin ? 'Register' : 'Log in'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
