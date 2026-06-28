import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export type ThemePreference = 'system' | 'light' | 'dark';

const STORAGE_KEY = '@safetalk/theme-preference';

interface ThemeState {
  preference: ThemePreference;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setPreference: (preference: ThemePreference) => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  preference: 'system',
  hydrated: false,

  hydrate: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        set({ preference: stored, hydrated: true });
        return;
      }
    } catch {
      // Fall back to system default.
    }
    set({ hydrated: true });
  },

  setPreference: async (preference) => {
    set({ preference });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, preference);
    } catch {
      // Preference still applies for this session.
    }
  },
}));
