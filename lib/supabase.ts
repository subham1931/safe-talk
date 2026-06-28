import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export function removeSupabaseChannel(channelName: string) {
  supabase
    .getChannels()
    .filter((channel) => channel.topic === `realtime:${channelName}`)
    .forEach((channel) => {
      void supabase.removeChannel(channel);
    });
}

export function unsubscribeSupabaseChannel(channel: RealtimeChannel) {
  void supabase.removeChannel(channel);
}

export function removeAllSupabaseChannels() {
  supabase.getChannels().forEach((channel) => {
    void supabase.removeChannel(channel);
  });
}

export async function invokeEdgeFunction<T>(
  name: string,
  body: Record<string, unknown>
): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) throw error;
  return data as T;
}
