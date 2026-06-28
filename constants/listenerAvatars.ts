import { ListenerProfile } from '@/types';

/** Stable portrait URLs for mock / fallback listener avatars. */
const FEMALE_AVATARS = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=240&h=240&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461fadead4d?w=240&h=240&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&h=240&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=240&h=240&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e2?w=240&h=240&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&h=240&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=240&h=240&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&h=240&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=240&h=240&fit=crop&crop=face',
];

const MALE_AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&h=240&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&h=240&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&h=240&fit=crop&crop=face',
];

function hashId(id: string) {
  return id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export function getListenerAvatarUrl(listener: Pick<ListenerProfile, 'id' | 'gender' | 'avatar_url' | 'selfie_url'>) {
  if (listener.avatar_url) return listener.avatar_url;
  if (listener.selfie_url) return listener.selfie_url;

  const pool = listener.gender === 'Male' ? MALE_AVATARS : FEMALE_AVATARS;
  return pool[hashId(listener.id) % pool.length];
}
