import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

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

/** Mock catalogue — clearly marked; replace via Razorpay sync in production. */
const MOCK_CATEGORIES = [
  'electricity',
  'water',
  'gas',
  'broadband',
  'mobile_postpaid',
  'dth',
  'insurance',
  'loan_repayment',
  'education',
  'fastag',
];

const MOCK_BILLERS: BbpsBillerRecord[] = [
  {
    id: 'mock_biller_mseb',
    gatewayBillerId: 'MSEB00000MH01',
    name: 'MSEDCL',
    aliasName: 'Maharashtra State Electricity Distribution',
    category: 'electricity',
    status: 'active',
    state: 'MH',
    city: 'Mumbai',
    logoUrl: null as unknown as undefined,
    accountHolderConfig: {
      params: [
        {
          name: 'Consumer Number',
          data_type: 'numeric',
          optional: false,
          min_length: 8,
          max_length: 12,
        },
        {
          name: 'Mobile Number',
          data_type: 'mobile',
          optional: true,
          min_length: 10,
          max_length: 10,
          regex: '^[6-9][0-9]{9}$',
        },
      ],
    },
    billRequestConfig: { bill_request_required: 'mandatory' },
  },
  {
    id: 'mock_biller_tata_power',
    gatewayBillerId: 'TATA00000MH01',
    name: 'Tata Power',
    aliasName: 'Tata Power Mumbai',
    category: 'electricity',
    status: 'active',
    state: 'MH',
    city: 'Mumbai',
    accountHolderConfig: {
      params: [
        {
          name: 'Account Number',
          data_type: 'string',
          optional: false,
          min_length: 6,
          max_length: 15,
        },
      ],
    },
    billRequestConfig: { bill_request_required: 'mandatory' },
  },
  {
    id: 'mock_biller_bescom',
    gatewayBillerId: 'BESC00000KA01',
    name: 'BESCOM',
    aliasName: 'Bangalore Electricity Supply',
    category: 'electricity',
    status: 'active',
    state: 'KA',
    city: 'Bengaluru',
    accountHolderConfig: {
      params: [
        {
          name: 'Consumer ID',
          data_type: 'string',
          optional: false,
          min_length: 10,
          max_length: 10,
        },
      ],
    },
    billRequestConfig: { bill_request_required: 'mandatory' },
  },
  {
    id: 'mock_biller_bwssb',
    gatewayBillerId: 'BWSS00000KA01',
    name: 'BWSSB Water',
    category: 'water',
    status: 'active',
    state: 'KA',
    city: 'Bengaluru',
    accountHolderConfig: {
      params: [
        {
          name: 'RR Number',
          data_type: 'string',
          optional: false,
          min_length: 8,
          max_length: 12,
        },
      ],
    },
    billRequestConfig: { bill_request_required: 'mandatory' },
  },
  {
    id: 'mock_biller_indane',
    gatewayBillerId: 'INDA00000DL01',
    name: 'Indane Gas',
    category: 'gas',
    status: 'active',
    state: 'DL',
    city: 'New Delhi',
    accountHolderConfig: {
      params: [
        {
          name: 'LPG ID',
          data_type: 'numeric',
          optional: false,
          min_length: 9,
          max_length: 17,
        },
      ],
    },
    billRequestConfig: { bill_request_required: 'mandatory' },
  },
  {
    id: 'mock_biller_airtel_bb',
    gatewayBillerId: 'AIRT00000MH01',
    name: 'Airtel Broadband',
    category: 'broadband',
    status: 'active',
    state: 'MH',
    accountHolderConfig: {
      params: [
        {
          name: 'Account Number',
          data_type: 'string',
          optional: false,
          min_length: 10,
          max_length: 12,
        },
      ],
    },
    billRequestConfig: { bill_request_required: 'mandatory' },
  },
  {
    id: 'mock_biller_jio_post',
    gatewayBillerId: 'JIO000000MH01',
    name: 'Jio Postpaid',
    category: 'mobile_postpaid',
    status: 'active',
    accountHolderConfig: {
      params: [
        {
          name: 'Mobile Number',
          data_type: 'mobile',
          optional: false,
          min_length: 10,
          max_length: 10,
          regex: '^[6-9][0-9]{9}$',
        },
      ],
    },
    billRequestConfig: { bill_request_required: 'mandatory' },
  },
  {
    id: 'mock_biller_tata_sky',
    gatewayBillerId: 'TATA00000DTH01',
    name: 'Tata Play DTH',
    category: 'dth',
    status: 'active',
    accountHolderConfig: {
      params: [
        {
          name: 'Subscriber ID',
          data_type: 'numeric',
          optional: false,
          min_length: 10,
          max_length: 11,
        },
      ],
    },
    billRequestConfig: { bill_request_required: 'mandatory' },
  },
];

type StoredBillRequest = BillRequestResult & {
  billerId: string;
  accountHolder: Record<string, string>;
  createdAt: number;
};

type StoredBillPayment = BillPaymentResult & {
  createdAt: number;
  pollCount: number;
};

@Injectable()
export class MockBbpsProvider implements BbpsProvider {
  readonly name = 'mock';

  private readonly billRequests = new Map<string, StoredBillRequest>();
  private readonly billPayments = new Map<string, StoredBillPayment>();
  private readonly orders = new Map<string, { amount: number; captured: boolean }>();

  async getCategories(): Promise<string[]> {
    return [...MOCK_CATEGORIES];
  }

  async getBillers(params: {
    category?: string;
    state?: string;
    city?: string;
    search?: string;
    billerId?: string;
    skip?: number;
    count?: number;
  }): Promise<{ count: number; items: BbpsBillerRecord[] }> {
    let items = [...MOCK_BILLERS];

    if (params.billerId) {
      items = items.filter((b) => b.id === params.billerId);
    }
    if (params.category) {
      items = items.filter(
        (b) => b.category.toLowerCase() === params.category!.toLowerCase(),
      );
    }
    if (params.state) {
      items = items.filter(
        (b) => !b.state || b.state.toLowerCase() === params.state!.toLowerCase(),
      );
    }
    if (params.city) {
      items = items.filter(
        (b) => !b.city || b.city.toLowerCase().includes(params.city!.toLowerCase()),
      );
    }
    if (params.search?.trim()) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          (b.aliasName ?? '').toLowerCase().includes(q),
      );
    }

    const skip = params.skip ?? 0;
    const count = params.count ?? 50;
    const slice = items.slice(skip, skip + count);
    return { count: slice.length, items: slice };
  }

  async createBillRequest(
    params: CreateBillRequestParams,
  ): Promise<BillRequestResult> {
    const id = `billreq_mock_${randomUUID().slice(0, 12)}`;
    const accountKey = Object.values(params.accountHolder)[0] ?? '0000';
    const amountBase = 500 + (parseInt(accountKey.replace(/\D/g, '').slice(-4), 10) % 2000);

    const result: StoredBillRequest = {
      id,
      status: 'processing',
      billerId: params.billerId,
      accountHolder: params.accountHolder,
      createdAt: Date.now(),
    };

    this.billRequests.set(id, result);

    // Simulate async completion on first fetch after ~1s
    setTimeout(() => {
      const stored = this.billRequests.get(id);
      if (!stored || stored.status !== 'processing') return;
      if (accountKey.endsWith('0000')) {
        stored.status = 'failed';
        stored.error = {
          code: 'BILL_NOT_FOUND',
          description: 'No outstanding bill found',
        };
        return;
      }
      stored.status = 'success';
      stored.billDetails = {
        customer_name: 'Demo Customer',
        bill_amount: amountBase,
        amount_due: amountBase,
        due_date: new Date(Date.now() + 7 * 86400000).toISOString(),
        bill_date: new Date().toISOString(),
        bill_number: `MOCK${Date.now().toString().slice(-8)}`,
        bill_period: 'Monthly',
        breakdown: {
          base_amount: amountBase - 150,
          other_charges: 100,
          taxes_fees: 50,
        },
      };
      stored.accountHolder = {
        ...params.accountHolder,
        customer_name: 'Demo Customer',
      };
    }, 800);

    return { id: result.id, status: result.status };
  }

  async fetchBillRequest(id: string): Promise<BillRequestResult> {
    const stored = this.billRequests.get(id);
    if (!stored) {
      return {
        id,
        status: 'failed',
        error: { description: 'Bill request not found' },
      };
    }

    // Auto-success after 2s if still processing
    if (stored.status === 'processing' && Date.now() - stored.createdAt > 2000) {
      const accountKey = Object.values(stored.accountHolder)[0] ?? '0000';
      if (accountKey.endsWith('0000')) {
        stored.status = 'failed';
        stored.error = { description: 'No bill found' };
      } else {
        const amountBase = 850;
        stored.status = 'success';
        stored.billDetails = {
          customer_name: 'Demo Customer',
          bill_amount: amountBase,
          amount_due: amountBase,
          due_date: new Date(Date.now() + 7 * 86400000).toISOString(),
          bill_date: new Date().toISOString(),
          bill_number: `MOCK${Date.now().toString().slice(-8)}`,
        };
      }
    }

    return {
      id: stored.id,
      status: stored.status,
      billDetails: stored.billDetails,
      accountHolder: stored.accountHolder,
      error: stored.error,
    };
  }

  async createPgOrder(params: CreatePgOrderParams): Promise<PgOrderResult> {
    const orderId = `order_mock_${randomUUID().slice(0, 12)}`;
    this.orders.set(orderId, { amount: params.amount, captured: false });
    return {
      orderId,
      amount: params.amount,
      currency: params.currency,
      keyId: 'mock_key',
    };
  }

  async captureMockPayment(orderId: string) {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    order.captured = true;
    return {
      paymentId: `pay_mock_${randomUUID().slice(0, 12)}`,
      status: 'captured',
    };
  }

  async resolvePgPayment(orderId: string): Promise<{ paymentId: string }> {
    const captured = await this.captureMockPayment(orderId);
    return { paymentId: captured.paymentId };
  }

  async createBillPayment(
    params: CreateBillPaymentParams,
  ): Promise<BillPaymentResult> {
    const id = `billpay_mock_${randomUUID().slice(0, 12)}`;
    const stored: StoredBillPayment = {
      id,
      status: 'processing',
      amount: params.amount,
      createdAt: Date.now(),
      pollCount: 0,
    };
    this.billPayments.set(id, stored);
    return { id, status: 'processing', amount: params.amount };
  }

  async fetchBillPayment(id: string): Promise<BillPaymentResult> {
    const stored = this.billPayments.get(id);
    if (!stored) {
      return {
        id,
        status: 'failed',
        error: { description: 'Payment not found' },
      };
    }

    stored.pollCount += 1;
    if (
      stored.status === 'processing' &&
      (stored.pollCount >= 1 || Date.now() - stored.createdAt > 400)
    ) {
      stored.status = 'success';
      stored.references = {
        bbps_reference: `BBPS${Date.now().toString().slice(-10)}`,
        biller_reference: `BLR${Date.now().toString().slice(-8)}`,
        npci_reference: `NPCI${Date.now().toString().slice(-10)}`,
      };
    }

    return {
      id: stored.id,
      status: stored.status,
      amount: stored.amount,
      references: stored.references,
      error: stored.error,
    };
  }
}
