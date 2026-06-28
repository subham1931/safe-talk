import { PaymentResult, PaymentService } from './PaymentService';

/**
 * MockPaymentService — simulates payment delay and success/failure.
 * Replace with RazorpayPaymentService when merchant account is ready.
 */
export class MockPaymentService implements PaymentService {
  async charge(amount: number, metadata?: Record<string, string>): Promise<PaymentResult> {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (amount <= 0) {
      return { success: false, transactionId: '', error: 'Invalid amount' };
    }

    const transactionId = `mock_txn_${Date.now()}_${metadata?.packId ?? 'custom'}`;
    return { success: true, transactionId };
  }
}

export const paymentService = new MockPaymentService();
