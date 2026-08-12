import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import {
  CreatePaymentOrderParams,
  PaymentOrderResult,
  PaymentProvider,
} from './payment-provider.interface';

@Injectable()
export class MockPaymentProvider implements PaymentProvider {
  async createOrder(params: CreatePaymentOrderParams): Promise<PaymentOrderResult> {
    const providerRef = `mock_${randomUUID()}`;
    return {
      paymentId: providerRef,
      provider: 'mock',
      providerRef,
      amount: params.amount,
      currency: params.currency,
      status: 'PENDING',
    };
  }

  async verifyPayment(providerRef: string) {
    return { success: true, providerRef };
  }

  async refund(providerRef: string) {
    return { success: true, providerRef };
  }
}
