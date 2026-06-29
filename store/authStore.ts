import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { create } from 'zustand';
import { Profile, UserRole } from '@/types';
import {
  createProfile,
  devSignIn,
  getProfile,
  getSession,
  signInWithEmail,
  signOut,
  signUpWithEmail,
  subscribeToProfile,
  unsubscribeFromProfile,
  updateProfile,
} from '@/services/auth/AuthService';
import { removeAllSupabaseChannels } from '@/lib/supabase';
import { useWalletStore } from './walletStore';

const ONBOARDING_KEY = 'hasSeenOnboarding';

interface AuthState {
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasSeenOnboarding: boolean;
  initialize: () => Promise<void>;
  setHasSeenOnboarding: (value: boolean) => void;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  loginDev: (email: string, password: string) => Promise<void>;
  setupProfile: (data: Partial<Profile> & { role: UserRole }) => Promise<void>;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  let profileChannel: RealtimeChannel | null = null;

  const startProfileSubscription = (userId: string) => {
    if (profileChannel) {
      unsubscribeFromProfile(profileChannel);
    }
    profileChannel = subscribeToProfile(userId, (updated) => set({ profile: updated }));
  };

  const stopProfileSubscription = () => {
    if (!profileChannel) return;
    unsubscribeFromProfile(profileChannel);
    profileChannel = null;
  };

  const completeAuthSession = async () => {
    const session = await getSession();
    if (!session?.user) throw new Error('Authentication failed');

    const profile = await getProfile(session.user.id);
    if (profile) {
      startProfileSubscription(session.user.id);
    }

    set({ profile, isAuthenticated: true, isLoading: false });
  };

  return {
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  hasSeenOnboarding: false,

  initialize: async () => {
    try {
      const hasSeenOnboarding = (await AsyncStorage.getItem(ONBOARDING_KEY)) === 'true';

      const session = await getSession();
      if (!session?.user) {
        set({ isLoading: false, isAuthenticated: false, hasSeenOnboarding });
        return;
      }

      let profile = await getProfile(session.user.id);
      if (profile) {
        startProfileSubscription(session.user.id);
      }

      set({
        profile,
        isAuthenticated: true,
        isLoading: false,
        hasSeenOnboarding,
      });
    } catch {
      set({ isLoading: false, isAuthenticated: false });
    }
  },

  setHasSeenOnboarding: async (value) => {
    await AsyncStorage.setItem(ONBOARDING_KEY, value ? 'true' : 'false');
    set({ hasSeenOnboarding: value });
  },

  loginWithEmail: async (email, password) => {
    await signInWithEmail(email, password);
    await completeAuthSession();
  },

  registerWithEmail: async (email, password) => {
    await signUpWithEmail(email, password);
    await completeAuthSession();
  },

  loginDev: async (email, password) => {
    await devSignIn(email, password);
    await completeAuthSession();
  },

  setupProfile: async (data) => {
    const session = await getSession();
    if (!session?.user) throw new Error('Not authenticated');

    const existing = await getProfile(session.user.id);
    let profile: Profile;

    if (existing) {
      profile = await updateProfile(session.user.id, { ...data, onboarding_complete: true });
    } else {
      profile = await createProfile(session.user.id, {
        ...data,
        onboarding_complete: true,
        wallet_balance: 0,
        is_age_verified: data.is_age_verified ?? false,
        blocked_user_ids: [],
      });
    }

    startProfileSubscription(session.user.id);
    set({ profile, isAuthenticated: true });
  },

  refreshProfile: async () => {
    const session = await getSession();
    if (!session?.user) return;

    const profile = await getProfile(session.user.id);
    if (profile) {
      startProfileSubscription(session.user.id);
    }
    set({ profile, isAuthenticated: true });
  },

  logout: async () => {
    stopProfileSubscription();
    removeAllSupabaseChannels();
    try {
      await signOut();
    } catch {
      // Local state is still cleared below so the user can sign in again.
    }
    useWalletStore.getState().reset();
    set({ profile: null, isAuthenticated: false, isLoading: false });
  },
};
});
