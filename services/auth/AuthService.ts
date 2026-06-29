import type { RealtimeChannel } from '@supabase/supabase-js';
import { Profile, UserRole } from '@/types';
import { removeSupabaseChannel, supabase, unsubscribeSupabaseChannel } from '@/lib/supabase';

export async function sendOtp(phone: string) {
  const formatted = phone.startsWith('+') ? phone : `+91${phone}`;
  const { error } = await supabase.auth.signInWithOtp({ phone: formatted });
  if (error) throw error;
  return formatted;
}

export async function verifyOtp(phone: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email: string, password: string) {
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError && !signUpError.message.includes('already registered')) {
    throw signUpError;
  }

  if (signUpData.session) return signUpData;

  return signInWithEmail(email, password);
}

/** @deprecated Use signInWithEmail or signUpWithEmail */
export async function devSignIn(email: string, password: string) {
  return signUpWithEmail(email, password);
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    const { error: localError } = await supabase.auth.signOut({ scope: 'local' });
    if (localError) throw localError;
  }
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) return null;
  return data as Profile;
}

export async function createProfile(
  userId: string,
  profile: Partial<Profile> & { role: UserRole; phone?: string }
) {
  const { data, error } = await supabase
    .from('profiles')
    .insert({ id: userId, ...profile })
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function blockUser(userId: string, blockedUserId: string) {
  const profile = await getProfile(userId);
  if (!profile) throw new Error('Profile not found');
  if (profile.blocked_user_ids.includes(blockedUserId)) return profile;

  return updateProfile(userId, {
    blocked_user_ids: [...profile.blocked_user_ids, blockedUserId],
  });
}

export function subscribeToProfile(userId: string, callback: (profile: Profile) => void): RealtimeChannel {
  const channelName = `profile:${userId}`;
  removeSupabaseChannel(channelName);

  return supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
      (payload) => callback(payload.new as Profile)
    )
    .subscribe();
}

export function unsubscribeFromProfile(channel: RealtimeChannel) {
  unsubscribeSupabaseChannel(channel);
}
