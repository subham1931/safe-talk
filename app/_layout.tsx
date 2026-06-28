import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import {
  Sora_600SemiBold,
  Sora_700Bold,
  Sora_800ExtraBold,
} from '@expo-google-fonts/sora';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { useAuthStore } from '@/store/authStore';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { useTheme } from '@/hooks/useTheme';

SplashScreen.preventAutoHideAsync();

function AppStack() {
  const { colors, isDark, stackHeaderOptions } = useTheme();

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(seeker)" />
        <Stack.Screen name="(listener)" />
        <Stack.Screen
          name="listener/[id]"
          options={{ ...stackHeaderOptions, title: 'Listener' }}
        />
        <Stack.Screen
          name="directory"
          options={{ ...stackHeaderOptions, title: 'All Listeners' }}
        />
        <Stack.Screen
          name="recharge"
          options={{
            ...stackHeaderOptions,
            presentation: 'modal',
            title: 'Recharge',
          }}
        />
        <Stack.Screen
          name="transactions"
          options={{ ...stackHeaderOptions, title: 'Transactions' }}
        />
        <Stack.Screen
          name="faqs"
          options={{ ...stackHeaderOptions, title: 'FAQs' }}
        />
        <Stack.Screen name="session/chat/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="session/call/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="session/video/[id]" options={{ headerShown: false }} />
        <Stack.Screen
          name="post-session/[id]"
          options={{ headerShown: false, gestureEnabled: false }}
        />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);

  const [fontsLoaded] = useFonts({
    Sora_600SemiBold,
    Sora_700Bold,
    Sora_800ExtraBold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
  });

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <ThemeProvider>
        <LoadingShell />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <AppStack />
    </ThemeProvider>
  );
}

function LoadingShell() {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
      }}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}
