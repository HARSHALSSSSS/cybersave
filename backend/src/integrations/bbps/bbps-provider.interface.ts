export const BBPS_PROVIDER = Symbol('BBPS_PROVIDER');

export type BbpsAsyncStatus = 'processing' | 'pending' | 'success' | 'failed';

export interface BbpsAccountHolderParam {
  name: string;
  data_type?: string;
  optional?: boolean;
  min_length?: number;
  max_length?: number;
  regex?: string;
  values?: string[];
  visibility?: boolean;
}

export interface BbpsBillerRecord {
  id: string;
  gatewayBillerId?: string;
  name: string;
  aliasName?: string;
  category: string;
  status: string;
  logoUrl?: string;
  country?: string;
  state?: string;
  city?: string;
  supportedChannels?: string[];
  accountHolderConfig?: { params?: BbpsAccountHolderParam[]; param_group?: unknown };
  billRequestConfig?: Record<string, unknown>;
  paymentConfig?: Record<string, unknown>;
  feeConfig?: Record<string, unknown>;
  rawConfiguration?: Record<string, unknown>;
  gatewayUpdatedAt?: number;
}

export interface CreateBillRequestParams {
  billerId: string;
  gatewayBillerId?: string;
  accountHolder: Record<string, string>;
}

export interface BillRequestResult {
  id: string;
  status: BbpsAsyncStatus;
  billDetails?: Record<string, unknown>;
  accountHolder?: Record<string, unknown>;
  error?: { code?: string; description?: string; reason?: string };
}

export interface CreateBillPaymentParams {
  billRequestId?: string;
  billerId?: string;
  gatewayBillerId?: string;
  accountHolder?: Record<string, string>;
  razorpayPaymentId: string;
  amount: number;
  device?: Record<string, string>;
}

export interface BillPaymentResult {
  id: string;
  status: BbpsAsyncStatus;
  amount?: number;
  references?: Record<string, string>;
  error?: { code?: string; description?: string; reason?: string };
}

export interface CreatePgOrderParams {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface PgOrderResult {
  orderId: string;
  amount: number;
  currency: string;
  keyId?: string;
}

export interface BbpsProvider {
  readonly name: string;

  getCategories(): Promise<string[]>;

  getBillers(params: {
    category?: string;
    state?: string;
    city?: string;
    search?: string;
    updatedSince?: number;
    skip?: number;
    count?: number;
    billerId?: string;
  }): Promise<{ count: number; items: BbpsBillerRecord[] }>;

  createBillRequest(params: CreateBillRequestParams): Promise<BillRequestResult>;

  fetchBillRequest(id: string): Promise<BillRequestResult>;

  createPgOrder(params: CreatePgOrderParams): Promise<PgOrderResult>;

  captureMockPayment(orderId: string): Promise<{ paymentId: string; status: string }>;

  createBillPayment(params: CreateBillPaymentParams): Promise<BillPaymentResult>;

  fetchBillPayment(id: string): Promise<BillPaymentResult>;

  resolvePgPayment(
    orderId: string,
    paymentId?: string,
  ): Promise<{ paymentId: string }>;
}
