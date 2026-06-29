import { router } from 'expo-router';
import { Session, SessionType } from '@/types';

export function getSessionPathname(type: SessionType) {
  if (type === 'chat') return '/session/chat/[id]' as const;
  if (type === 'call') return '/session/call/[id]' as const;
  return '/session/video/[id]' as const;
}

export function navigateToSession(
  session: Session,
  opts: { listenerName: string; perspective?: 'seeker' | 'listener' }
) {
  const { listenerName, perspective = 'seeker' } = opts;

  if (!session.id.startsWith('mock-') && session.status === 'pending' && perspective === 'seeker') {
    router.push({
      pathname: '/session/waiting/[id]',
      params: {
        id: session.id,
        listenerId: session.listener_id,
        listenerName,
        rate: session.rate_per_min.toString(),
        type: session.type,
      },
    });
    return;
  }

  router.push({
    pathname: getSessionPathname(session.type),
    params: {
      id: session.id,
      listenerId: perspective === 'listener' ? session.seeker_id : session.listener_id,
      listenerName: perspective === 'listener' ? 'Anonymous Seeker' : listenerName,
      rate: session.rate_per_min.toString(),
    },
  });
}
