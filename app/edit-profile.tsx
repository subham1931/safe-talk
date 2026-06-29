import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router, Stack } from 'expo-router';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SeekerProfileForm } from '@/components/SeekerProfileForm';
import { ListenerProfileForm } from '@/components/ListenerProfileForm';
import { Spacing } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';

export default function EditProfileScreen() {
  const { colors, getStackHeaderOptions } = useTheme();
  const profile = useAuthStore((s) => s.profile);
  const [successVisible, setSuccessVisible] = useState(false);

  const handleSaved = () => setSuccessVisible(true);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Stack.Screen options={getStackHeaderOptions('Edit Profile')} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled>
        {profile?.role === 'listener' ? (
          <ListenerProfileForm hideHeader onSaved={handleSaved} />
        ) : (
          <SeekerProfileForm hideHeader onSaved={handleSaved} />
        )}
      </ScrollView>

      <ConfirmDialog
        visible={successVisible}
        title="Profile updated"
        message="Your changes have been saved."
        variant="success"
        confirmLabel="Done"
        onConfirm={() => {
          setSuccessVisible(false);
          router.back();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  container: { flex: 1 },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
});
