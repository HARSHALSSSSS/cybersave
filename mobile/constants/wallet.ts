export const WALLET_BALANCE_INITIAL = 3250.0;

let demoWalletBalance = WALLET_BALANCE_INITIAL;

export function getWalletBalance(): number {
  return demoWalletBalance;
}

export function addToWalletBalance(amount: number): number {
  if (amount > 0) {
    demoWalletBalance += amount;
  }
  return demoWalletBalance;
}

/** @deprecated use getWalletBalance() — kept for backwards compatibility */
export const WALLET_BALANCE = WALLET_BALANCE_INITIAL;

export const LINKED_PAYMENT_METHOD = {
  bankName: 'State Bank of India',
  accountMasked: '************1204',
  isPrimary: true,
};

export const PAYMENT_SOURCES = [
  {
    id: 'sbi',
    title: 'SBI Bank Account',
    subtitle: 'Primary • **********1204',
    type: 'bank' as const,
  },
  {
    id: 'upi',
    title: 'UPI Payment',
    subtitle: 'Google Pay, PhonePe, BHIM',
    type: 'upi' as const,
  },
  {
    id: 'card',
    title: 'Debit / Credit Card',
    subtitle: 'Visa, MasterCard, RuPay',
    type: 'card' as const,
  },
] as const;

export const QUICK_AMOUNTS = [500, 1000, 2000, 5000] as const;

export const TRANSACTION_FILTERS = [
  'All',
  'Credits',
  'Debits',
  'Refunds',
] as const;

export type TransactionFilter = (typeof TRANSACTION_FILTERS)[number];

export type TransactionType = 'debit' | 'credit' | 'refund';

export type WalletTransaction = {
  id: string;
  title: string;
  ref: string;
  time: string;
  dateGroup: string;
  amount: number;
  type: TransactionType;
  paymentMethod?: string;
  category?: string;
  beneficiary?: string;
  status?: 'success' | 'refund_pending';
};

export const WALLET_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'tx1',
    title: 'Electricity Bill Payment',
    ref: 'ELEC849204',
    time: 'Today, 2:30 PM',
    dateGroup: 'TODAY, 12 MAY',
    amount: -1450,
    type: 'debit',
    paymentMethod: 'SBI Bank Account',
    category: 'BBPS Bill Payment',
    beneficiary: 'MSEB — Electricity',
    status: 'success',
  },
  {
    id: 'tx2',
    title: 'Refund Received',
    ref: 'REF8391823',
    time: 'Yesterday, 11:15 AM',
    dateGroup: 'YESTERDAY, 11 MAY',
    amount: 50,
    type: 'refund',
    status: 'refund_pending',
  },
  {
    id: 'tx3',
    title: 'Wallet Added via UPI',
    ref: 'UPI9284710',
    time: '10 May, 6:00 PM',
    dateGroup: '10 MAY',
    amount: 2000,
    type: 'credit',
    paymentMethod: 'UPI Payment',
    category: 'Wallet Top-up',
    status: 'success',
  },
  {
    id: 'tx4',
    title: 'PAN Card Verification Fee',
    ref: 'PAN3948293',
    time: '2:30 PM',
    dateGroup: 'TODAY, 12 MAY',
    amount: -110,
    type: 'debit',
    paymentMethod: 'SBI Bank Account',
    category: 'Digital Governance Fees',
    beneficiary: 'PAN Verification Service',
    status: 'success',
  },
  {
    id: 'tx5',
    title: 'Aadhaar Service Payment',
    ref: 'ADH3920194',
    time: '9:00 AM',
    dateGroup: 'YESTERDAY, 11 MAY',
    amount: -50,
    type: 'debit',
    paymentMethod: 'SBI Bank Account',
    category: 'Digital Governance Fees',
    beneficiary: 'Aadhaar Update Service',
    status: 'success',
  },
];

export type TransactionDetail = {
  id: string;
  ref: string;
  txnId: string;
  dateTime: string;
  paymentMethod: string;
  category: string;
  beneficiary: string;
  amount: number;
  status: 'success' | 'refund_pending';
  title: string;
};

export const TRANSACTION_DETAILS: Record<string, TransactionDetail> = {
  tx1: {
    id: 'tx1',
    title: 'Electricity Bill Payment',
    ref: 'ELEC849204',
    txnId: 'TXN839481029302',
    dateTime: '12 May 2024, 02:30 PM',
    paymentMethod: 'SBI Bank Account',
    category: 'BBPS Bill Payment',
    beneficiary: 'MSEB — Electricity',
    amount: 1450,
    status: 'success',
  },
  tx3: {
    id: 'tx3',
    title: 'Wallet Added via UPI',
    ref: 'UPI9284710',
    txnId: 'TXN928471029301',
    dateTime: '10 May 2024, 06:00 PM',
    paymentMethod: 'UPI Payment',
    category: 'Wallet Top-up',
    beneficiary: 'Cybersave Wallet',
    amount: 2000,
    status: 'success',
  },
  tx4: {
    id: 'tx4',
    title: 'PAN Card Verification Fee',
    ref: 'PAN3948293',
    txnId: 'TXN394829301928',
    dateTime: '12 May 2024, 02:30 PM',
    paymentMethod: 'SBI Bank Account',
    category: 'Digital Governance Fees',
    beneficiary: 'PAN Verification Service',
    amount: 110,
    status: 'success',
  },
  tx5: {
    id: 'tx5',
    title: 'Aadhaar Service Payment',
    ref: 'ADH3920194',
    txnId: 'TXN392019483920',
    dateTime: '11 May 2024, 09:00 AM',
    paymentMethod: 'SBI Bank Account',
    category: 'Digital Governance Fees',
    beneficiary: 'Aadhaar Update Service',
    amount: 50,
    status: 'success',
  },
};

export function getTransactionById(id: string): WalletTransaction | undefined {
  return WALLET_TRANSACTIONS.find(tx => tx.id === id);
}

export function getTransactionDetails(transactionId: string): TransactionDetail {
  const existing = TRANSACTION_DETAILS[transactionId];
  if (existing) return existing;

  const tx = getTransactionById(transactionId);
  if (!tx) {
    return TRANSACTION_DETAILS.tx1;
  }

  return {
    id: tx.id,
    title: tx.title,
    ref: tx.ref,
    txnId: `TXN${tx.ref.replace(/\D/g, '').slice(0, 12)}`,
    dateTime: tx.time,
    paymentMethod: tx.paymentMethod ?? 'Cybersave Wallet',
    category: tx.category ?? 'Transaction',
    beneficiary: tx.beneficiary ?? tx.title,
    amount: Math.abs(tx.amount),
    status: tx.status ?? 'success',
  };
}

export type RefundDetail = {
  refundId: string;
  status: string;
  amount: number;
  ref: string;
  steps: Array<{
    id: string;
    title: string;
    description: string;
    timestamp: string;
    state: 'completed' | 'current' | 'pending';
  }>;
  destination: {
    bankName: string;
    accountNumber: string;
    referenceNumber: string;
  };
};

export const REFUND_DETAILS_MAP: Record<string, RefundDetail> = {
  REF8391823: {
    refundId: 'REF8391823',
    status: 'REFUND IN PROGRESS',
    amount: 50,
    ref: 'REF8391823',
    steps: [
      {
        id: '1',
        title: 'Refund Initiated',
        description: 'Merchant accepted refund request',
        timestamp: '12 May, 04:00 PM',
        state: 'completed',
      },
      {
        id: '2',
        title: 'Processing by Bank',
        description: 'Awaiting clearance from partner bank',
        timestamp: '13 May, 10:30 AM',
        state: 'current',
      },
      {
        id: '3',
        title: 'Credited to Wallet',
        description: 'Funds will reflect in available balance',
        timestamp: 'Expected: 15 May',
        state: 'pending',
      },
    ],
    destination: {
      bankName: 'State Bank of India',
      accountNumber: '**********1204',
      referenceNumber: 'REV-REF-39482910',
    },
  },
};

/** @deprecated use getRefundDetails(refundId) */
export const REFUND_DETAILS = REFUND_DETAILS_MAP.REF8391823;

export function getRefundDetails(refundId: string): RefundDetail {
  return (
    REFUND_DETAILS_MAP[refundId] ?? {
      ...REFUND_DETAILS_MAP.REF8391823,
      refundId,
      ref: refundId,
    }
  );
}

export const DATE_RANGE_LABEL = 'Showing: 01 May 2024 - 15 May 2024';

export const formatCurrency = (amount: number): string => {
  const formatted = Math.abs(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const prefix = amount >= 0 ? '+ ' : '- ';
  return `${prefix}₹${formatted}`;
};

export const formatAmountInput = (amount: number): string =>
  amount.toLocaleString('en-IN');

export function navigateWalletTransaction(
  navigation: { navigate: (screen: string, params?: object) => void },
  tx: WalletTransaction,
) {
  if (tx.type === 'refund') {
    navigation.navigate('RefundStatus', { refundId: tx.ref });
    return;
  }
  navigation.navigate('TransactionDetails', { transactionId: tx.id });
}
