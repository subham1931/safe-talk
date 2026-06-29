import { blockUser } from '@/services/auth/AuthService';
import { supabase } from '@/lib/supabase';
import { ListenerProfile } from '@/types';

export async function createListenerProfile(
  userId: string,
  data: Partial<ListenerProfile> & { display_name: string }
) {
  const { data: profile, error } = await supabase
    .from('listener_profiles')
    .insert({ id: userId, ...data })
    .select()
    .single();
  if (error) throw error;
  return profile as ListenerProfile;
}

export async function updateListenerProfile(userId: string, updates: Partial<ListenerProfile>) {
  const { data, error } = await supabase
    .from('listener_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data as ListenerProfile;
}

export async function getListenerProfile(userId: string): Promise<ListenerProfile | null> {
  const { data, error } = await supabase
    .from('listener_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data as ListenerProfile;
}

export async function submitReport(
  reporterId: string,
  reportedId: string,
  reason: string,
  details: string,
  sessionId?: string
) {
  const { error } = await supabase.from('st_user_reports').insert({
    reporter_id: reporterId,
    reported_id: reportedId,
    reason,
    details,
    session_id: sessionId,
  });
  if (error) throw error;

  await blockUser(reporterId, reportedId);
}

export async function submitReview(
  sessionId: string,
  seekerId: string,
  listenerId: string,
  rating: number,
  feedback?: string
) {
  await supabase.from('session_reviews').insert({
    session_id: sessionId,
    seeker_id: seekerId,
    listener_id: listenerId,
    rating,
    feedback,
  });

  await supabase
    .from('sessions')
    .update({ seeker_rating: rating, seeker_feedback: feedback })
    .eq('id', sessionId);
}
