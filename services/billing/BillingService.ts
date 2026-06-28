import { invokeEdgeFunction } from '@/lib/supabase';

export interface BillingResult {
  success: boolean;
  wallet_balance: number;
  total_amount?: number;
  low_balance_warning?: boolean;
  session_ended?: boolean;
  reason?: string;
}

export async function debitSession(sessionId: string): Promise<BillingResult> {
  return invokeEdgeFunction<BillingResult>('session-billing', {
    sessionId,
    action: 'debit',
  });
}

export async function endSessionBilling(sessionId: string) {
  return invokeEdgeFunction<{ success: boolean }>('session-billing', {
    sessionId,
    action: 'end',
  });
}

/** Client-side billing tick — calls Edge Function every interval (never mutates balance locally) */
export function startBillingInterval(
  sessionId: string,
  onTick: (result: BillingResult) => void,
  intervalMs = 60000
) {
  const interval = setInterval(async () => {
    try {
      const result = await debitSession(sessionId);
      onTick(result);
      if (result.session_ended) clearInterval(interval);
    } catch {
      // Edge function may fail if session ended
    }
  }, intervalMs);

  return () => clearInterval(interval);
}
