import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export async function logoutAndRedirect() {
  try {
    await useAuthStore.getState().logout();
    router.replace('/(auth)/phone');
  } catch (err) {
    Alert.alert('Logout failed', err instanceof Error ? err.message : 'Try again');
  }
}
