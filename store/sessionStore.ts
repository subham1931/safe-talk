import { create } from 'zustand';
import { Session, SessionType } from '@/types';
import { supabase } from '@/lib/supabase';

interface SessionState {
  activeSession: Session | null;
  pendingRequest: Session | null;
  elapsedSeconds: number;
  setElapsedSeconds: (seconds: number) => void;
  createSession: (
    seekerId: string,
    listenerId: string,
    type: SessionType,
    ratePerMin: number,
    categoryTag?: string
  ) => Promise<Session>;
  acceptSession: (sessionId: string) => Promise<void>;
  declineSession: (sessionId: string) => Promise<void>;
  endSession: (sessionId: string) => Promise<Session>;
  setActiveSession: (session: Session | null) => void;
  setPendingRequest: (session: Session | null) => void;
  subscribeToIncomingRequests: (listenerId: string) => () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  activeSession: null,
  pendingRequest: null,
  elapsedSeconds: 0,

  setElapsedSeconds: (seconds) => set({ elapsedSeconds: seconds }),

  createSession: async (seekerId, listenerId, type, ratePerMin, categoryTag) => {
    const isMock = listenerId.startsWith('mock-');

    if (isMock) {
      const mockSession: Session = {
        id: `mock-session-${Date.now()}`,
        seeker_id: seekerId,
        listener_id: listenerId,
        type,
        status: 'active',
        category_tag: categoryTag,
        started_at: new Date().toISOString(),
        rate_per_min: ratePerMin,
        total_amount: 0,
        total_minutes: 0,
      };
      set({ activeSession: mockSession });
      return mockSession;
    }

    const { data, error } = await supabase
      .from('sessions')
      .insert({
        seeker_id: seekerId,
        listener_id: listenerId,
        type,
        status: 'pending',
        rate_per_min: ratePerMin,
        category_tag: categoryTag,
      })
      .select()
      .single();

    if (error) throw error;
    const session = data as Session;
    set({ activeSession: session });
    return session;
  },

  acceptSession: async (sessionId) => {
    const { data, error } = await supabase
      .from('sessions')
      .update({ status: 'active', started_at: new Date().toISOString() })
      .eq('id', sessionId)
      .select()
      .single();
    if (error) throw error;
    set({ activeSession: data as Session, pendingRequest: null });
  },

  declineSession: async (sessionId) => {
    await supabase.from('sessions').update({ status: 'declined' }).eq('id', sessionId);
    set({ pendingRequest: null });
  },

  endSession: async (sessionId) => {
    const isMock = sessionId.startsWith('mock-');
    let session: Session;

    if (isMock) {
      session = {
        ...get().activeSession!,
        status: 'ended',
        ended_at: new Date().toISOString(),
        total_minutes: get().elapsedSeconds / 60,
        total_amount: (get().elapsedSeconds / 60) * (get().activeSession?.rate_per_min ?? 0),
      };
    } else {
      const { data, error } = await supabase
        .from('sessions')
        .update({ status: 'ended', ended_at: new Date().toISOString() })
        .eq('id', sessionId)
        .select()
        .single();
      if (error) throw error;
      session = data as Session;
    }

    set({ activeSession: null, elapsedSeconds: 0 });
    return session;
  },

  setActiveSession: (session) => set({ activeSession: session }),
  setPendingRequest: (session) => set({ pendingRequest: session }),

  subscribeToIncomingRequests: (listenerId) => {
    const channel = supabase
      .channel(`incoming:${listenerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sessions',
          filter: `listener_id=eq.${listenerId}`,
        },
        (payload) => {
          const session = payload.new as Session;
          if (session.status === 'pending') {
            set({ pendingRequest: session });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
}));
