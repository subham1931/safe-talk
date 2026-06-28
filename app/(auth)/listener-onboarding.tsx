import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '@/components/ui/Button';
import { ProgressHeader } from '@/components/ui/ProgressHeader';
import { PillTextInput } from '@/components/ui/PillTextInput';
import { ChipSelector } from '@/components/ui/ChipSelector';
import { CircleToggle } from '@/components/ui/CircleToggle';
import { ScrollNumberPicker } from '@/components/ui/ScrollNumberPicker';
import { UploadBox } from '@/components/ui/UploadBox';
import { DecorativeDashedCircles } from '@/components/ui/DecorativeDashedCircles';
import { EXPERIENCE_TAGS, LANGUAGES } from '@/constants/categories';
import { FlatColors, Spacing, TypographyTokens, Fonts, FontSize } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { createListenerProfile } from '@/services/listener/ListenerService';
import { isAgeVerified } from '@/utils/helpers';
import { useTheme } from '@/hooks/useTheme';

const TOTAL_STEPS = 4;
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const YEARS = Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - 18 - i);

function createStyles(colors: FlatColors, typography: TypographyTokens) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: Spacing.lg, paddingTop: 60, paddingBottom: Spacing.xxl },
    stepTitle: { ...typography.headlineLarge },
    stepSubtitle: { ...typography.caption, marginTop: Spacing.sm, marginBottom: Spacing.lg },
    label: {
      fontFamily: Fonts.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.ink,
      marginTop: Spacing.md,
      marginBottom: Spacing.sm,
    },
    dobRow: { flexDirection: 'row', gap: Spacing.sm },
    pickerCol: { flex: 1 },
    pickerLabel: { ...typography.caption, textAlign: 'center', marginBottom: Spacing.xs },
    uploadRow: { flexDirection: 'row', gap: Spacing.md },
  });
}

export default function ListenerOnboardingScreen() {
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [day, setDay] = useState(1);
  const [month, setMonth] = useState(1);
  const [year, setYear] = useState(2000);
  const [languages, setLanguages] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [idUploaded, setIdUploaded] = useState(false);
  const [selfieUploaded, setSelfieUploaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const setupProfile = useAuthStore((s) => s.setupProfile);

  const dob = useMemo(
    () => `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    [year, month, day]
  );

  const pickImage = async (type: 'id' | 'selfie') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled) {
      if (type === 'id') setIdUploaded(true);
      else setSelfieUploaded(true);
    }
  };

  const handleAgeCheck = () => {
    if (!isAgeVerified(dob)) {
      Alert.alert(
        'Age requirement',
        'You must be 18 or older to become a Listener. Would you like to continue as a Seeker instead?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Become Seeker', onPress: () => router.replace('/(auth)/seeker-setup') },
        ]
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!handleAgeCheck()) return;

    setLoading(true);
    try {
      await setupProfile({
        role: 'listener',
        is_age_verified: true,
        date_of_birth: dob,
        gender,
      });

      const userId = useAuthStore.getState().profile?.id;
      if (userId) {
        await createListenerProfile(userId, {
          display_name: name,
          gender,
          languages,
          tags,
          bio,
          status: 'pending',
          id_document_url: idUploaded ? 'mock://id' : undefined,
          selfie_url: selfieUploaded ? 'mock://selfie' : undefined,
        });
      }

      router.replace('/(auth)/listener-pending');
    } catch (err) {
      Alert.alert('Submission failed', err instanceof Error ? err.message : 'Try again');
    } finally {
      setLoading(false);
    }
  };

  const languageOptions = LANGUAGES.map((l) => ({ id: l, label: l, icon: 'globe-outline' as const }));
  const tagOptions = EXPERIENCE_TAGS.map((t) => ({ id: t, label: t, icon: 'heart-outline' as const }));

  const steps = [
    <View key="0">
      <Text style={styles.stepTitle}>Age verification</Text>
      <Text style={styles.stepSubtitle}>Listeners must be 18 or older</Text>
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
      <Button title="Continue" onPress={() => handleAgeCheck() && setStep(1)} size="lg" style={{ marginTop: Spacing.lg }} />
    </View>,

    <View key="1">
      <Text style={styles.stepTitle}>Basic information</Text>
      <PillTextInput placeholder="Your name" value={name} onChangeText={setName} containerStyle={{ marginBottom: Spacing.md }} />
      <Text style={styles.label}>Gender</Text>
      <CircleToggle
        options={[
          { id: 'Male', label: 'Male', icon: 'male' },
          { id: 'Female', label: 'Female', icon: 'female' },
          { id: 'Other', label: 'Other', icon: 'person' },
        ]}
        value={gender}
        onChange={setGender}
      />
      <Text style={styles.label}>Languages spoken</Text>
      <ChipSelector options={languageOptions} selected={languages} onChange={setLanguages} />
      <Text style={styles.label}>Areas of experience</Text>
      <ChipSelector options={tagOptions} selected={tags} onChange={setTags} />
      <Button title="Continue" onPress={() => setStep(2)} size="lg" style={{ marginTop: Spacing.lg }} disabled={!name} />
    </View>,

    <View key="2">
      <Text style={styles.stepTitle}>Identity verification</Text>
      <Text style={styles.stepSubtitle}>Upload your ID and a selfie. Status will be Pending Review.</Text>
      <View style={styles.uploadRow}>
        <UploadBox label="ID Document" caption="Govt. ID" uploaded={idUploaded} onPress={() => pickImage('id')} />
        <UploadBox label="Selfie" caption="Face photo" uploaded={selfieUploaded} onPress={() => pickImage('selfie')} />
      </View>
      <Button title="Continue" onPress={() => setStep(3)} size="lg" style={{ marginTop: Spacing.lg }} disabled={!idUploaded || !selfieUploaded} />
    </View>,

    <View key="3">
      <Text style={styles.stepTitle}>My Story</Text>
      <Text style={styles.stepSubtitle}>Share a short story about a tough time you have overcome</Text>
      <PillTextInput
        placeholder="Your story..."
        multiline
        numberOfLines={5}
        value={bio}
        onChangeText={setBio}
        style={{ minHeight: 120, textAlignVertical: 'top' }}
        containerStyle={{ marginBottom: Spacing.md }}
      />
      <Button title="Submit Application" onPress={handleSubmit} loading={loading} size="lg" disabled={bio.length < 20} />
    </View>,
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} nestedScrollEnabled>
      <DecorativeDashedCircles tone="orange" />
      <ProgressHeader step={step + 1} totalSteps={TOTAL_STEPS} />
      {steps[step]}
    </ScrollView>
  );
}
