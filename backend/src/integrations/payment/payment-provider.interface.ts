export interface CreatePaymentOrderParams {
  applicationId: string;
  citizenId: string;
  amount: number;
  currency: string;
  idempotencyKey: string;
}

export interface PaymentOrderResult {
  paymentId: string;
  provider: string;
  providerRef: string;
  amount: number;
  currency: string;
  status: string;
}

export interface PaymentProvider {
  createOrder(params: CreatePaymentOrderParams): Promise<PaymentOrderResult>;
  verifyPayment(providerRef: string): Promise<{ success: boolean; providerRef: string }>;
  refund(providerRef: string, amount: number): Promise<{ success: boolean; providerRef: string }>;
}

export const PAYMENT_PROVIDER = Symbol('PAYMENT_PROVIDER');
