import type { RealtimeChannel } from '@supabase/supabase-js';
import {
  invokeEdgeFunction,
  removeSupabaseChannel,
  supabase,
  unsubscribeSupabaseChannel,
} from '@/lib/supabase';
import { Transaction } from '@/types';

export async function rechargeWallet(amount: number, paymentReference: string) {
  try {
    return await invokeEdgeFunction<{ success: boolean; wallet_balance: number }>('wallet-recharge', {
      amount,
      paymentReference,
    });
  } catch {
    const { data, error } = await supabase.rpc('credit_wallet', {
      p_amount: amount,
      p_reference: paymentReference,
    });
    if (error) throw error;
    return data as { success: boolean; wallet_balance: number };
  }
}

export async function creditWallet(amount: number, reference = 'Manual credit') {
  const { data, error } = await supabase.rpc('credit_wallet', {
    p_amount: amount,
    p_reference: reference,
  });
  if (error) throw error;
  return data as { success: boolean; wallet_balance: number };
}

export async function debitWallet(
  amount: number,
  sessionId?: string | null,
  reference = 'Session charge'
) {
  const rounded = Math.round(amount * 100) / 100;

  try {
    return await invokeEdgeFunction<{ success: boolean; wallet_balance: number }>('wallet-debit', {
      amount: rounded,
      sessionId: sessionId ?? null,
      reference,
    });
  } catch {
    const { data, error } = await supabase.rpc('debit_wallet', {
      p_amount: rounded,
      p_session_id: sessionId ?? null,
      p_reference: reference,
    });
    if (error) throw error;
    return data as { success: boolean; wallet_balance: number };
  }
}

export async function getTransactions(userId: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Transaction[];
}

export function subscribeToWallet(userId: string, callback: (balance: number) => void): RealtimeChannel {
  const channelName = `wallet:${userId}`;
  removeSupabaseChannel(channelName);

  return supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
      (payload) => callback(Number((payload.new as { wallet_balance: number }).wallet_balance))
    )
    .subscribe();
}

export function unsubscribeFromWallet(channel: RealtimeChannel) {
  unsubscribeSupabaseChannel(channel);
}
