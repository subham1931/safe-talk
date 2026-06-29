import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, UserRole } from '@/types';

const STORAGE_PREFIX = 'session_history_v1';

export type SessionHistoryItem = Session & {
  listener_display_name?: string;
};

function storageKey(userId: string) {
  return `${STORAGE_PREFIX}:${userId}`;
}

export async function getLocalSessionHistory(
  userId: string,
  role: UserRole
): Promise<SessionHistoryItem[]> {
  const raw = await AsyncStorage.getItem(storageKey(userId));
  if (!raw) return [];

  const items = JSON.parse(raw) as SessionHistoryItem[];
  const column = role === 'seeker' ? 'seeker_id' : 'listener_id';

  return items
    .filter((item) => item[column] === userId)
    .filter((item) => item.status === 'ended' || item.status === 'declined');
}

export async function saveLocalSessionHistory(
  userId: string,
  session: SessionHistoryItem
): Promise<void> {
  const raw = await AsyncStorage.getItem(storageKey(userId));
  const existing = raw ? (JSON.parse(raw) as SessionHistoryItem[]) : [];
  const next = [session, ...existing.filter((item) => item.id !== session.id)].slice(0, 50);
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify(next));
}
