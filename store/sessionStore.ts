import { create } from 'zustand';
import { Session, SessionType } from '@/types';
import { supabase } from '@/lib/supabase';
import { saveLocalSessionHistory } from '@/services/session/LocalSessionHistory';
import { debitWallet } from '@/services/wallet/WalletService';
import { useWalletStore } from './walletStore';
import { useAuthStore } from './authStore';

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
  endSession: (sessionId: string, opts?: { listenerDisplayName?: string }) => Promise<Session>;
  setActiveSession: (session: Session | null) => void;
  setPendingRequest: (session: Session | null) => void;
  subscribeToIncomingRequests: (listenerId: string) => () => void;
  subscribeToSessionStatus: (sessionId: string, onUpdate: (session: Session) => void) => () => void;
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
    if (session.status === 'active') {
      set({ activeSession: session });
    }
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

  endSession: async (sessionId, opts) => {
    const isMock = sessionId.startsWith('mock-');
    const active = get().activeSession;
    const elapsed = get().elapsedSeconds;
    const totalMinutes = elapsed / 60;
    const totalAmount = totalMinutes * (active?.rate_per_min ?? 0);
    let session: Session;

    if (isMock) {
      session = {
        ...active!,
        status: 'ended',
        ended_at: new Date().toISOString(),
        total_minutes: totalMinutes,
        total_amount: totalAmount,
      };
      if (active?.seeker_id) {
        await saveLocalSessionHistory(active.seeker_id, {
          ...session,
          listener_display_name: opts?.listenerDisplayName,
        });
      }
    } else {
      const { data, error } = await supabase
        .from('sessions')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString(),
          total_minutes: totalMinutes,
          total_amount: totalAmount,
        })
        .eq('id', sessionId)
        .select()
        .single();
      if (error) throw error;
      session = data as Session;
    }

    const chargeAmount = Math.round(totalAmount * 100) / 100;
    if (chargeAmount > 0) {
      try {
        const sessionRef = isMock ? null : sessionId;
        const { wallet_balance } = await debitWallet(
          chargeAmount,
          sessionRef,
          `${session.type} session`
        );
        useWalletStore.getState().setBalance(wallet_balance);
        await useAuthStore.getState().refreshProfile();
      } catch (err) {
        console.warn('Wallet debit failed — apply debit_wallet migration:', err);
      }
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

  subscribeToSessionStatus: (sessionId, onUpdate) => {
    const channel = supabase
      .channel(`session-status:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sessions',
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          const session = payload.new as Session;
          if (session.status === 'active') {
            set({ activeSession: session });
          }
          onUpdate(session);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
}));
