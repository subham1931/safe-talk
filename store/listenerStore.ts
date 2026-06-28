import { create } from 'zustand';
import { ListenerProfile } from '@/types';
import { MOCK_LISTENERS } from '@/constants/mockListeners';
import { supabase } from '@/lib/supabase';

interface ListenerState {
  listeners: ListenerProfile[];
  isLoading: boolean;
  fetchListeners: () => Promise<void>;
  getListenerById: (id: string) => ListenerProfile | undefined;
  setOnlineStatus: (isOnline: boolean) => Promise<void>;
}

export const useListenerStore = create<ListenerState>((set, get) => ({
  listeners: MOCK_LISTENERS,
  isLoading: false,

  fetchListeners: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('listener_profiles')
        .select('*')
        .eq('status', 'approved');

      if (error || !data?.length) {
        set({ listeners: MOCK_LISTENERS, isLoading: false });
        return;
      }

      set({ listeners: data as ListenerProfile[], isLoading: false });
    } catch {
      set({ listeners: MOCK_LISTENERS, isLoading: false });
    }
  },

  getListenerById: (id) => {
    return get().listeners.find((l) => l.id === id) ?? MOCK_LISTENERS.find((l) => l.id === id);
  },

  setOnlineStatus: async (isOnline) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('listener_profiles').update({ is_online: isOnline }).eq('id', user.id);
    set((state) => ({
      listeners: state.listeners.map((l) =>
        l.id === user.id ? { ...l, is_online: isOnline } : l
      ),
    }));
  },
}));
