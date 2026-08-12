import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type {
  BillPaymentResult,
  BillRequestResult,
  BbpsBillerRecord,
  BbpsProvider,
  CreateBillPaymentParams,
  CreateBillRequestParams,
  CreatePgOrderParams,
  PgOrderResult,
} from './bbps-provider.interface';

@Injectable()
export class RazorpayBbpsProvider implements BbpsProvider {
  readonly name = 'razorpay';
  private readonly logger = new Logger(RazorpayBbpsProvider.name);

  constructor(private readonly configService: ConfigService) {}

  async getCategories(): Promise<string[]> {
    const response = await this.request<{ categories: string[] }>(
      '/bill_payments/billers/categories',
      'GET',
    );
    return response.categories ?? [];
  }

  async getBillers(params: {
    category?: string;
    state?: string;
    city?: string;
    search?: string;
    updatedSince?: number;
    skip?: number;
    count?: number;
    billerId?: string;
  }): Promise<{ count: number; items: BbpsBillerRecord[] }> {
    const query = new URLSearchParams();
    if (params.category) query.set('category', params.category);
    if (params.state) query.set('geo_coverage.state', params.state);
    if (params.city) query.set('geo_coverage.city', params.city);
    if (params.updatedSince) query.set('updated_since', String(params.updatedSince));
    if (params.billerId) query.set('biller_id', params.billerId);
    if (params.skip != null) query.set('skip', String(params.skip));
    query.set('count', String(params.count ?? 100));
    query.set('status', 'active');

    const path = `/bill_payments/billers?${query.toString()}`;
    const response = await this.request<{
      count: number;
      items: Array<Record<string, unknown>>;
    }>(path, 'GET');

    let items = (response.items ?? []).map((item) => this.mapBiller(item));

    if (params.search?.trim()) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          (b.aliasName ?? '').toLowerCase().includes(q),
      );
    }

    return { count: items.length, items };
  }

  async createBillRequest(
    params: CreateBillRequestParams,
  ): Promise<BillRequestResult> {
    const body: Record<string, unknown> = {
      biller_id: params.billerId,
      biller_data: {
        account_holder: params.accountHolder,
      },
      device: this.buildMobileDevice(),
    };
    if (params.gatewayBillerId) {
      body.gateway_biller_id = params.gatewayBillerId;
    }

    const response = await this.request<Record<string, unknown>>(
      '/bill_payments/bill_requests',
      'POST',
      body,
    );
    return this.mapBillRequest(response);
  }

  async fetchBillRequest(id: string): Promise<BillRequestResult> {
    const response = await this.request<Record<string, unknown>>(
      `/bill_payments/bill_requests/${id}`,
      'GET',
    );
    return this.mapBillRequest(response);
  }

  async createPgOrder(params: CreatePgOrderParams): Promise<PgOrderResult> {
    const response = await this.request<{
      id: string;
      amount: number;
      currency: string;
    }>('/orders', 'POST', {
      amount: Math.round(params.amount * 100),
      currency: params.currency,
      receipt: params.receipt.slice(0, 40),
      notes: params.notes,
    });

    return {
      orderId: response.id,
      amount: params.amount,
      currency: params.currency,
      keyId: this.configService.get<string>('payment.razorpayKeyId'),
    };
  }

  async captureMockPayment(_orderId: string): Promise<{ paymentId: string; status: string }> {
    throw new BadRequestException(
      'Mock capture is not available when BBPS_PROVIDER=razorpay',
    );
  }

  async resolvePgPayment(
    orderId: string,
    paymentId?: string,
  ): Promise<{ paymentId: string }> {
    if (paymentId?.startsWith('pay_')) {
      return { paymentId };
    }
    const response = await this.request<{ items: Array<{ id: string; status: string }> }>(
      `/orders/${orderId}/payments`,
      'GET',
    );
    const payment = response.items.find(
      item => item.status === 'captured' || item.status === 'authorized',
    );
    if (!payment) {
      throw new BadRequestException(
        'No captured Razorpay payment found. Complete checkout first.',
      );
    }
    return { paymentId: payment.id };
  }

  async createBillPayment(
    params: CreateBillPaymentParams,
  ): Promise<BillPaymentResult> {
    const body: Record<string, unknown> = {
      payments: [{ id: params.razorpayPaymentId }],
    };

    if (params.billRequestId) {
      body.bill_request_id = params.billRequestId;
    } else {
      body.biller_id = params.billerId;
      body.biller_data = { account_holder: params.accountHolder };
      if (params.gatewayBillerId) {
        body.gateway_biller_id = params.gatewayBillerId;
      }
      body.device = params.device ?? this.buildMobileDevice();
    }

    const response = await this.request<Record<string, unknown>>(
      '/bill_payments/payments',
      'POST',
      body,
    );
    return this.mapBillPayment(response);
  }

  async fetchBillPayment(id: string): Promise<BillPaymentResult> {
    const response = await this.request<Record<string, unknown>>(
      `/bill_payments/payments/${id}`,
      'GET',
    );
    return this.mapBillPayment(response);
  }

  private mapBiller(item: Record<string, unknown>): BbpsBillerRecord {
    const geo = item.geo_coverage as Record<string, string> | undefined;
    const gatewayData = item.gateway_data as Record<string, unknown> | undefined;

    return {
      id: String(item.id),
      gatewayBillerId: item.gateway_biller_id as string | undefined,
      name: String(item.name),
      aliasName: item.alias_name as string | undefined,
      category: String(item.category),
      status: String(item.status ?? 'active'),
      logoUrl: item.logo_url as string | undefined,
      country: geo?.country,
      state: geo?.state,
      city: geo?.city,
      supportedChannels: item.supported_channels as string[] | undefined,
      accountHolderConfig: (gatewayData?.account_holder_config ??
        item.account_holder_config) as BbpsBillerRecord['accountHolderConfig'],
      billRequestConfig: (gatewayData?.bill_request_config ??
        item.bill_request_config) as Record<string, unknown>,
      paymentConfig: gatewayData?.payment_config as Record<string, unknown>,
      feeConfig: gatewayData?.fee_config as Record<string, unknown>,
      rawConfiguration: item,
      gatewayUpdatedAt: item.gateway_updated_at as number | undefined,
    };
  }

  private mapBillRequest(raw: Record<string, unknown>): BillRequestResult {
    const status = String(raw.status ?? 'processing').toLowerCase() as BillRequestResult['status'];
    return {
      id: String(raw.id),
      status,
      billDetails: (raw.bill ?? raw.bill_details ?? raw) as Record<string, unknown>,
      accountHolder: raw.account_holder as Record<string, unknown> | undefined,
      error: raw.error as BillRequestResult['error'],
    };
  }

  private mapBillPayment(raw: Record<string, unknown>): BillPaymentResult {
    const status = String(raw.status ?? 'processing').toLowerCase() as BillPaymentResult['status'];
    return {
      id: String(raw.id),
      status,
      amount: raw.amount ? Number(raw.amount) / 100 : undefined,
      references: {
        ...(raw.bbps_reference
          ? { bbps_reference: String(raw.bbps_reference) }
          : {}),
        ...(raw.biller_reference
          ? { biller_reference: String(raw.biller_reference) }
          : {}),
        ...(raw.npci_reference
          ? { npci_reference: String(raw.npci_reference) }
          : {}),
      },
      error: raw.error as BillPaymentResult['error'],
    };
  }

  private buildMobileDevice(): Record<string, string> {
    return {
      initiating_channel: 'mobile',
      app: 'cybersave',
      os: 'android',
      ip: '127.0.0.1',
      geocode: '12.9716,77.5946',
      imei: '000000000000000',
    };
  }

  private async request<T>(
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
    const started = Date.now();
    const response = await fetch(`https://api.razorpay.com/v1${path}`, {
      method,
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const payload = (await response.json()) as T & {
      error?: { description?: string; code?: string; reason?: string };
    };

    if (!response.ok) {
      const message =
        payload.error?.description ?? `Razorpay BBPS error (${response.status})`;
      this.logger.error(
        `${method} ${path} failed in ${Date.now() - started}ms: ${message}`,
      );
      throw new BadRequestException(message);
    }

    return payload;
  }
}
