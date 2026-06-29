import { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PillTextInput } from '@/components/ui/PillTextInput';
import { CircleToggle } from '@/components/ui/CircleToggle';
import { ScrollNumberPicker } from '@/components/ui/ScrollNumberPicker';
import {
  AVATARS,
  CUSTOM_AVATAR_ID,
  generateAnonymousName,
  getAvatarBackground,
} from '@/constants/avatars';
import { FlatColors, Spacing, BorderRadius, TypographyTokens, Fonts, FontSize } from '@/constants/theme';
import { uploadSeekerAvatar } from '@/services/avatar/AvatarUploadService';
import { useAuthStore } from '@/store/authStore';
import { isAgeVerified } from '@/utils/helpers';
import { parseDateOfBirth } from '@/utils/parseDateOfBirth';
import { useTheme } from '@/hooks/useTheme';

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const YEARS = Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - 18 - i);

function createStyles(colors: FlatColors, typography: TypographyTokens) {
  return StyleSheet.create({
    title: { ...typography.headlineLarge },
    subtitle: { ...typography.caption, marginTop: Spacing.sm, marginBottom: Spacing.xl },
    label: {
      fontFamily: Fonts.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.ink,
      marginBottom: Spacing.sm,
      marginTop: Spacing.md,
    },
    photoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      marginBottom: Spacing.md,
    },
    photoPreview: {
      width: 72,
      height: 72,
      borderRadius: 36,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
    },
    photoPreviewSelected: {
      borderColor: colors.primary,
    },
    photoImage: { width: '100%', height: '100%' },
    photoPlaceholder: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    uploadBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      borderRadius: BorderRadius.pill,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    uploadBtnText: {
      fontFamily: Fonts.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.ink,
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

interface SeekerProfileFormProps {
  mode?: 'setup' | 'edit';
  hideHeader?: boolean;
  onSaved: () => void;
}

export function SeekerProfileForm({ mode = 'edit', hideHeader, onSaved }: SeekerProfileFormProps) {
  const { colors, typography, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  const profile = useAuthStore((s) => s.profile);
  const setupProfile = useAuthStore((s) => s.setupProfile);

  const [anonymousName, setAnonymousName] = useState(generateAnonymousName());
  const [avatarId, setAvatarId] = useState(AVATARS[0].id);
  const [customAvatarUri, setCustomAvatarUri] = useState<string | null>(null);
  const [gender, setGender] = useState('');
  const [day, setDay] = useState(1);
  const [month, setMonth] = useState(1);
  const [year, setYear] = useState(YEARS[Math.min(10, YEARS.length - 1)] ?? 2000);
  const [hydrated, setHydrated] = useState(mode === 'setup');
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState<{ title: string; message: string; variant: 'warning' | 'error' } | null>(
    null
  );

  useEffect(() => {
    if (mode === 'setup') {
      setHydrated(true);
      return;
    }
    if (!profile) return;

    if (profile.anonymous_name) setAnonymousName(profile.anonymous_name);
    if (profile.avatar_url) {
      setCustomAvatarUri(profile.avatar_url);
      setAvatarId(CUSTOM_AVATAR_ID);
    } else if (profile.avatar_id) {
      setAvatarId(profile.avatar_id);
      setCustomAvatarUri(null);
    }
    if (profile.gender) setGender(profile.gender);

    if (profile.date_of_birth) {
      const parsed = parseDateOfBirth(profile.date_of_birth);
      if (parsed) {
        if (DAYS.includes(parsed.day)) setDay(parsed.day);
        if (MONTHS.includes(parsed.month)) setMonth(parsed.month);
        if (YEARS.includes(parsed.year)) setYear(parsed.year);
      }
    }

    setHydrated(true);
  }, [profile, mode]);

  const dob = useMemo(
    () => `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    [year, month, day]
  );

  const pickProfilePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setDialog({
        title: 'Permission needed',
        message: 'Allow photo library access to upload a profile picture.',
        variant: 'warning',
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCustomAvatarUri(result.assets[0].uri);
      setAvatarId(CUSTOM_AVATAR_ID);
    }
  };

  const selectPresetAvatar = (id: string) => {
    setAvatarId(id);
    setCustomAvatarUri(null);
  };

  const handleSubmit = async () => {
    if (!isAgeVerified(dob)) {
      setDialog({
        title: 'Age requirement',
        message: 'You must be 18 or older to use safeTalk.',
        variant: 'warning',
      });
      return;
    }

    setLoading(true);
    try {
      let avatarUrl: string | undefined;
      const usingCustomPhoto = avatarId === CUSTOM_AVATAR_ID && customAvatarUri;

      if (usingCustomPhoto && profile?.id) {
        avatarUrl = await uploadSeekerAvatar(profile.id, customAvatarUri);
      }

      await setupProfile({
        role: 'seeker',
        anonymous_name: anonymousName,
        avatar_id: usingCustomPhoto ? CUSTOM_AVATAR_ID : avatarId,
        avatar_url: usingCustomPhoto ? avatarUrl : null,
        gender: gender || undefined,
        date_of_birth: dob,
        is_age_verified: true,
      });
      onSaved();
    } catch (err) {
      setDialog({
        title: 'Save failed',
        message: err instanceof Error ? err.message : 'Try again',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const usingCustomPhoto = avatarId === CUSTOM_AVATAR_ID && !!customAvatarUri;

  return (
    <View>
      {!hideHeader && (
        <Text style={styles.title}>
          {mode === 'setup' ? 'Your anonymous identity' : 'Edit profile'}
        </Text>
      )}
      {!hideHeader && (
        <Text style={styles.subtitle}>
          {mode === 'setup'
            ? 'This is how listeners will see you — no real name or photo'
            : 'Update how listeners see you — still anonymous'}
        </Text>
      )}

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

      <Text style={styles.label}>Profile photo (optional)</Text>
      <View style={styles.photoRow}>
        <View style={[styles.photoPreview, usingCustomPhoto && styles.photoPreviewSelected]}>
          {customAvatarUri ? (
            <Image source={{ uri: customAvatarUri }} style={styles.photoImage} contentFit="cover" />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="person" size={28} color={colors.inkSecondary} />
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.uploadBtn} onPress={pickProfilePhoto} activeOpacity={0.85}>
          <Ionicons name="camera-outline" size={20} color={colors.primary} />
          <Text style={styles.uploadBtnText}>
            {customAvatarUri ? 'Change photo' : 'Upload photo'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Or choose an avatar</Text>
      <View style={styles.avatarGrid}>
        {AVATARS.map((a) => (
          <TouchableOpacity
            key={a.id}
            style={[styles.avatarItem, avatarId === a.id && !usingCustomPhoto && styles.avatarSelected]}
            onPress={() => selectPresetAvatar(a.id)}>
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
      {hydrated ? (
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
      ) : null}

      <Button
        title={mode === 'setup' ? 'Continue' : 'Save changes'}
        onPress={handleSubmit}
        loading={loading}
        size="lg"
        style={{ marginTop: Spacing.lg }}
      />

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
