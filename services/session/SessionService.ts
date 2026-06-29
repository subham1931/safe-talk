import { supabase } from '@/lib/supabase';
import { Session, UserRole } from '@/types';
import {
  getLocalSessionHistory,
  SessionHistoryItem,
} from '@/services/session/LocalSessionHistory';

async function getRemoteSessionHistory(userId: string, role: UserRole): Promise<Session[]> {
  const column = role === 'seeker' ? 'seeker_id' : 'listener_id';
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq(column, userId)
    .in('status', ['ended', 'declined'])
    .order('ended_at', { ascending: false, nullsFirst: false })
    .limit(50);

  if (error) throw error;
  return (data ?? []) as Session[];
}

export async function getSessionHistory(
  userId: string,
  role: UserRole
): Promise<SessionHistoryItem[]> {
  const [remote, local] = await Promise.all([
    getRemoteSessionHistory(userId, role).catch(() => [] as Session[]),
    getLocalSessionHistory(userId, role),
  ]);

  const byId = new Map<string, SessionHistoryItem>();
  for (const session of [...local, ...remote]) {
    byId.set(session.id, session);
  }

  return [...byId.values()].sort((a, b) => {
    const aTime = a.ended_at ?? a.started_at;
    const bTime = b.ended_at ?? b.started_at;
    return bTime.localeCompare(aTime);
  });
}
