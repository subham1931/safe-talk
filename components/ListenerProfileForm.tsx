import { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PillTextInput } from '@/components/ui/PillTextInput';
import { ChipSelector } from '@/components/ui/ChipSelector';
import { EXPERIENCE_TAGS, LANGUAGES } from '@/constants/categories';
import { FlatColors, Spacing, TypographyTokens, Fonts, FontSize } from '@/constants/theme';
import { getListenerProfile, updateListenerProfile } from '@/services/listener/ListenerService';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';

function createStyles(colors: FlatColors, typography: TypographyTokens) {
  return StyleSheet.create({
    title: { ...typography.headlineLarge },
    subtitle: { ...typography.caption, marginTop: Spacing.sm, marginBottom: Spacing.xl },
    label: {
      fontFamily: Fonts.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.ink,
      marginTop: Spacing.md,
      marginBottom: Spacing.sm,
    },
  });
}

interface ListenerProfileFormProps {
  hideHeader?: boolean;
  onSaved: () => void;
}

export function ListenerProfileForm({ hideHeader, onSaved }: ListenerProfileFormProps) {
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  const profile = useAuthStore((s) => s.profile);

  const [name, setName] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState<{ title: string; message: string; variant: 'warning' | 'error' } | null>(
    null
  );

  useEffect(() => {
    if (!profile?.id) return;
    getListenerProfile(profile.id).then((listenerProfile) => {
      if (!listenerProfile) return;
      setName(listenerProfile.display_name);
      setLanguages(listenerProfile.languages);
      setTags(listenerProfile.tags);
      setBio(listenerProfile.bio ?? '');
    });
  }, [profile?.id]);

  const handleSubmit = async () => {
    if (!profile?.id) return;
    if (!name.trim()) {
      setDialog({ title: 'Missing name', message: 'Please enter your display name.', variant: 'warning' });
      return;
    }
    if (bio.length < 20) {
      setDialog({
        title: 'Bio too short',
        message: 'Please write at least 20 characters in your story.',
        variant: 'warning',
      });
      return;
    }

    setLoading(true);
    try {
      await updateListenerProfile(profile.id, {
        display_name: name.trim(),
        languages,
        tags,
        bio: bio.trim(),
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

  const languageOptions = LANGUAGES.map((l) => ({ id: l, label: l, icon: 'globe-outline' as const }));
  const tagOptions = EXPERIENCE_TAGS.map((t) => ({ id: t, label: t, icon: 'heart-outline' as const }));

  return (
    <View>
      {!hideHeader && <Text style={styles.title}>Edit profile</Text>}
      {!hideHeader && (
        <Text style={styles.subtitle}>Update your listener profile details</Text>
      )}

      <PillTextInput
        label="Display name"
        placeholder="Your name"
        value={name}
        onChangeText={setName}
        containerStyle={{ marginBottom: Spacing.md }}
      />

      <Text style={styles.label}>Languages spoken</Text>
      <ChipSelector options={languageOptions} selected={languages} onChange={setLanguages} />

      <Text style={styles.label}>Areas of experience</Text>
      <ChipSelector options={tagOptions} selected={tags} onChange={setTags} />

      <Text style={styles.label}>My Story</Text>
      <PillTextInput
        placeholder="Share a short story about a tough time you have overcome..."
        multiline
        numberOfLines={5}
        value={bio}
        onChangeText={setBio}
        style={{ minHeight: 120, textAlignVertical: 'top' }}
        containerStyle={{ marginBottom: Spacing.md }}
      />

      <Button
        title="Save changes"
        onPress={handleSubmit}
        loading={loading}
        size="lg"
        disabled={!name.trim() || bio.length < 20}
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
