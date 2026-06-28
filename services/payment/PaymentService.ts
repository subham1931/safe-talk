export interface PaymentResult {
  success: boolean;
  transactionId: string;
  error?: string;
}

/**
 * PaymentService interface — swap MockPaymentService for RazorpayPaymentService later.
 */
export interface PaymentService {
  charge(amount: number, metadata?: Record<string, string>): Promise<PaymentResult>;
}
