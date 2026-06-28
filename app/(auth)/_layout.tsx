import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="phone" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="role" />
      <Stack.Screen name="seeker-setup" />
      <Stack.Screen name="listener-onboarding" />
      <Stack.Screen name="listener-pending" />
    </Stack>
  );
}
