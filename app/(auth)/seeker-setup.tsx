import { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { PillTextInput } from '@/components/ui/PillTextInput';
import { CircleToggle } from '@/components/ui/CircleToggle';
import { ScrollNumberPicker } from '@/components/ui/ScrollNumberPicker';
import { DecorativeDashedCircles } from '@/components/ui/DecorativeDashedCircles';
import { AVATARS, generateAnonymousName, getAvatarBackground } from '@/constants/avatars';
import { FlatColors, Spacing, BorderRadius, TypographyTokens, Fonts, FontSize } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { isAgeVerified } from '@/utils/helpers';
import { useTheme } from '@/hooks/useTheme';

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const YEARS = Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - 18 - i);

function createStyles(colors: FlatColors, typography: TypographyTokens) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: Spacing.lg, paddingTop: 60, paddingBottom: Spacing.xxl },
    title: { ...typography.headlineLarge },
    subtitle: { ...typography.caption, marginTop: Spacing.sm, marginBottom: Spacing.xl },
    label: {
      fontFamily: Fonts.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.ink,
      marginBottom: Spacing.sm,
      marginTop: Spacing.md,
    },
    avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    avatarItem: { padding: 4, borderRadius: BorderRadius.full, borderWidth: 2, borderColor: 'transparent' },
    avatarSelected: { borderColor: colors.primary },
    avatarCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
    avatarEmoji: { fontSize: 28 },
    dobRow: { flexDirection: 'row', gap: Spacing.sm },
    pickerCol: { flex: 1 },
    pickerLabel: { ...typography.caption, textAlign: 'center', marginBottom: Spacing.xs },
  });
}

export default function SeekerSetupScreen() {
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const isEdit = edit === '1' || edit === 'true';
  const { colors, typography, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  const profile = useAuthStore((s) => s.profile);
  const [anonymousName, setAnonymousName] = useState(generateAnonymousName());
  const [avatarId, setAvatarId] = useState(AVATARS[0].id);
  const [gender, setGender] = useState('');
  const [day, setDay] = useState(1);
  const [month, setMonth] = useState(1);
  const [year, setYear] = useState(2000);
  const [loading, setLoading] = useState(false);
  const setupProfile = useAuthStore((s) => s.setupProfile);

  useEffect(() => {
    if (!isEdit || !profile) return;
    if (profile.anonymous_name) setAnonymousName(profile.anonymous_name);
    if (profile.avatar_id) setAvatarId(profile.avatar_id);
    if (profile.gender) setGender(profile.gender);
    if (profile.date_of_birth) {
      const [yearStr, monthStr, dayStr] = profile.date_of_birth.split('-');
      const parsedYear = Number(yearStr);
      const parsedMonth = Number(monthStr);
      const parsedDay = Number(dayStr);
      if (parsedYear) setYear(parsedYear);
      if (parsedMonth) setMonth(parsedMonth);
      if (parsedDay) setDay(parsedDay);
    }
  }, [isEdit, profile]);

  const dob = useMemo(
    () => `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    [year, month, day]
  );

  const handleSubmit = async () => {
    if (!isAgeVerified(dob)) {
      Alert.alert('Age requirement', 'You must be 18 or older to use safeTalk.');
      return;
    }

    setLoading(true);
    try {
      await setupProfile({
        role: 'seeker',
        anonymous_name: anonymousName,
        avatar_id: avatarId,
        gender: gender || undefined,
        date_of_birth: dob,
        is_age_verified: true,
      });
      if (isEdit) {
        router.back();
      } else {
        router.replace('/(seeker)');
      }
    } catch (err) {
      Alert.alert('Setup failed', err instanceof Error ? err.message : 'Try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} nestedScrollEnabled>
      <DecorativeDashedCircles tone="plum" />
      {isEdit && (
        <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={{ marginBottom: Spacing.md }}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </TouchableOpacity>
      )}
      <Text style={styles.title}>{isEdit ? 'Edit profile' : 'Your anonymous identity'}</Text>
      <Text style={styles.subtitle}>
        {isEdit
          ? 'Update how listeners see you — still anonymous'
          : 'This is how listeners will see you — no real name or photo'}
      </Text>

      <PillTextInput
        label="Display name"
        value={anonymousName}
        onChangeText={setAnonymousName}
        rightSlot={
          <TouchableOpacity onPress={() => setAnonymousName(generateAnonymousName())} hitSlop={8}>
            <Ionicons name="shuffle" size={20} color={colors.primary} />
          </TouchableOpacity>
        }
        containerStyle={{ marginBottom: Spacing.md }}
      />

      <Text style={styles.label}>Choose an avatar</Text>
      <View style={styles.avatarGrid}>
        {AVATARS.map((a) => (
          <TouchableOpacity
            key={a.id}
            style={[styles.avatarItem, avatarId === a.id && styles.avatarSelected]}
            onPress={() => setAvatarId(a.id)}>
            <View style={[styles.avatarCircle, { backgroundColor: getAvatarBackground(a.id, isDark) }]}>
              <Text style={styles.avatarEmoji}>{a.emoji}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Gender (optional)</Text>
      <CircleToggle
        options={[
          { id: 'Male', label: 'Male', icon: 'male' },
          { id: 'Female', label: 'Female', icon: 'female' },
          { id: 'Other', label: 'Other', icon: 'person' },
        ]}
        value={gender}
        onChange={setGender}
      />

      <Text style={[styles.label, { marginTop: Spacing.lg }]}>Date of birth (must be 18+)</Text>
      <View style={styles.dobRow}>
        <View style={styles.pickerCol}>
          <Text style={styles.pickerLabel}>Day</Text>
          <ScrollNumberPicker values={DAYS} value={day} onChange={setDay} />
        </View>
        <View style={styles.pickerCol}>
          <Text style={styles.pickerLabel}>Month</Text>
          <ScrollNumberPicker values={MONTHS} value={month} onChange={setMonth} />
        </View>
        <View style={styles.pickerCol}>
          <Text style={styles.pickerLabel}>Year</Text>
          <ScrollNumberPicker values={YEARS} value={year} onChange={setYear} />
        </View>
      </View>

      <Button
        title={isEdit ? 'Save changes' : 'Continue'}
        onPress={handleSubmit}
        loading={loading}
        size="lg"
        style={{ marginTop: Spacing.lg }}
      />
    </ScrollView>
  );
}
