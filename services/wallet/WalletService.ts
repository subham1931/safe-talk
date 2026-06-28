import type { RealtimeChannel } from '@supabase/supabase-js';
import {
  invokeEdgeFunction,
  removeSupabaseChannel,
  supabase,
  unsubscribeSupabaseChannel,
} from '@/lib/supabase';
import { Transaction } from '@/types';

export async function rechargeWallet(amount: number, paymentReference: string) {
  return invokeEdgeFunction<{ success: boolean; wallet_balance: number }>('wallet-recharge', {
    amount,
    paymentReference,
  });
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
