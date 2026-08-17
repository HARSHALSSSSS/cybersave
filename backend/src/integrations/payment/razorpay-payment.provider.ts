import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';

import {
  CreatePaymentOrderParams,
  PaymentOrderResult,
  PaymentProvider,
} from './payment-provider.interface';

interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

interface RazorpayPaymentEntity {
  id: string;
  order_id: string;
  status: string;
  amount: number;
  currency: string;
}

@Injectable()
export class RazorpayPaymentProvider implements PaymentProvider {
  private readonly logger = new Logger(RazorpayPaymentProvider.name);

  constructor(private readonly configService: ConfigService) {}

  async createOrder(params: CreatePaymentOrderParams): Promise<PaymentOrderResult> {
    const order = await this.createRazorpayOrder(params);
    return {
      paymentId: order.id,
      provider: 'razorpay',
      providerRef: order.id,
      amount: params.amount,
      currency: params.currency,
      status: order.status.toUpperCase(),
    };
  }

  async verifyPayment(providerRef: string) {
    const payment = await this.fetchPaymentForOrder(providerRef);
    const success = payment.status === 'captured' || payment.status === 'authorized';
    return { success, providerRef: payment.id };
  }

  async refund(providerRef: string, amount: number) {
    const paymentId = await this.resolvePaymentId(providerRef);
    const body = { amount: Math.round(amount * 100) };
    await this.razorpayRequest(`/payments/${paymentId}/refund`, 'POST', body);
    return { success: true, providerRef: paymentId };
  }

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const secret = this.configService.get<string>('payment.razorpayWebhookSecret');
    if (!secret) {
      this.logger.warn('RAZORPAY_WEBHOOK_SECRET not configured — skipping signature check');
      return true;
    }
    const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
    return expected === signature;
  }

  verifyCheckoutSignature(orderId: string, paymentId: string, signature: string): boolean {
    const secret = this.configService.get<string>('payment.razorpayKeySecret');
    if (!secret) {
      this.logger.warn('RAZORPAY_KEY_SECRET not configured — skipping checkout signature check');
      return true;
    }
    const expected = createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    return expected === signature;
  }

  getPublicKeyId(): string | undefined {
    return this.configService.get<string>('payment.razorpayKeyId');
  }

  private async createRazorpayOrder(
    params: CreatePaymentOrderParams,
  ): Promise<RazorpayOrderResponse> {
    const receipt = params.idempotencyKey.slice(0, 40);
    return this.razorpayRequest<RazorpayOrderResponse>('/orders', 'POST', {
      amount: Math.round(params.amount * 100),
      currency: params.currency,
      receipt,
      notes: {
        applicationId: params.applicationId,
        citizenId: params.citizenId,
      },
    });
  }

  private async fetchPaymentForOrder(orderId: string): Promise<RazorpayPaymentEntity> {
    const response = await this.razorpayRequest<{ items: RazorpayPaymentEntity[] }>(
      `/orders/${orderId}/payments`,
      'GET',
    );
    const payment = response.items.find(
      (item) => item.status === 'captured' || item.status === 'authorized',
    );
    if (!payment) {
      throw new BadRequestException('No successful Razorpay payment found for order');
    }
    return payment;
  }

  private async resolvePaymentId(providerRef: string): Promise<string> {
    if (providerRef.startsWith('pay_')) {
      return providerRef;
    }
    const payment = await this.fetchPaymentForOrder(providerRef);
    return payment.id;
  }

  private async razorpayRequest<T>(
    path: string,
    method: 'GET' | 'POST',
    body?: Record<string, unknown>,
  ): Promise<T> {
    const keyId = this.configService.get<string>('payment.razorpayKeyId');
    const keySecret = this.configService.get<string>('payment.razorpayKeySecret');

    if (!keyId || !keySecret) {
      throw new ServiceUnavailableException(
        'Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.',
      );
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const response = await fetch(`https://api.razorpay.com/v1${path}`, {
      method,
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const payload = (await response.json()) as T & { error?: { description?: string } };
    if (!response.ok) {
      const message = payload.error?.description ?? `Razorpay API error (${response.status})`;
      this.logger.error(`Razorpay ${method} ${path} failed: ${message}`);
      throw new BadRequestException(message);
    }

    return payload;
  }
}
