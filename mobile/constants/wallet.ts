import { getString, setString, StorageKeys } from '@services/storage';

export const WALLET_BALANCE_INITIAL = 3250.0;

function parseStoredBalance(): number {
  const raw = getString(StorageKeys.WALLET_BALANCE);
  if (!raw) return WALLET_BALANCE_INITIAL;
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : WALLET_BALANCE_INITIAL;
}

function loadExtraTransactions(): WalletTransaction[] {
  const raw = getString(StorageKeys.WALLET_EXTRA_TRANSACTIONS);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as WalletTransaction[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

let demoWalletBalance = parseStoredBalance();
let extraTransactions = loadExtraTransactions();

export function getWalletBalance(): number {
  return demoWalletBalance;
}

export function getWalletTransactions(): WalletTransaction[] {
  return [...extraTransactions, ...WALLET_TRANSACTIONS];
}

export function addToWalletBalance(
  amount: number,
  paymentSourceTitle: string,
): number {
  if (amount > 0) {
    demoWalletBalance += amount;
    setString(StorageKeys.WALLET_BALANCE, String(demoWalletBalance));

    const now = new Date();
    const tx: WalletTransaction = {
      id: `tx-topup-${now.getTime()}`,
      title: `Wallet Added via ${paymentSourceTitle}`,
      time: now.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      dateGroup: now.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      amount,
      type: 'credit',
      ref: `CSW${now.getTime().toString().slice(-8)}`,
      paymentMethod: paymentSourceTitle,
      category: 'Wallet Top-up',
      beneficiary: 'Cybersave Wallet',
    };
    extraTransactions = [tx, ...extraTransactions].slice(0, 50);
    setString(
      StorageKeys.WALLET_EXTRA_TRANSACTIONS,
      JSON.stringify(extraTransactions),
    );
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
  time: string;
  dateGroup: string;
  amount: number;
  type: TransactionType;
  ref: string;
  paymentMethod?: string;
  category?: string;
  beneficiary?: string;
};

export const WALLET_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'tx-1',
    title: 'Electricity Bill Payment',
    time: '12 Aug 2026, 10:24 AM',
    dateGroup: '12 Aug 2026',
    amount: -850,
    type: 'debit',
    ref: 'CSW48291037',
    paymentMethod: 'Cybersave Wallet',
    category: 'Bill Payment',
    beneficiary: 'BESCOM',
  },
  {
    id: 'tx-2',
    title: 'Wallet Added via UPI',
    time: '10 Aug 2026, 06:15 PM',
    dateGroup: '10 Aug 2026',
    amount: 2000,
    type: 'credit',
    ref: 'CSW48290112',
    paymentMethod: 'UPI Payment',
    category: 'Wallet Top-up',
    beneficiary: 'Cybersave Wallet',
  },
  {
    id: 'tx-3',
    title: 'Income Certificate Fee',
    time: '8 Aug 2026, 02:40 PM',
    dateGroup: '8 Aug 2026',
    amount: -149,
    type: 'debit',
    ref: 'CSW48289001',
    paymentMethod: 'Cybersave Wallet',
    category: 'Government Service',
    beneficiary: 'Revenue Department',
  },
  {
    id: 'tx-4',
    title: 'Wallet Added via UPI',
    time: '5 Aug 2026, 11:05 AM',
    dateGroup: '5 Aug 2026',
    amount: 1500,
    type: 'credit',
    ref: 'CSW48288044',
    paymentMethod: 'UPI Payment',
    category: 'Wallet Top-up',
    beneficiary: 'Cybersave Wallet',
  },
  {
    id: 'tx-5',
    title: 'Broadband Bill Payment',
    time: '2 Aug 2026, 09:18 AM',
    dateGroup: '2 Aug 2026',
    amount: -599,
    type: 'debit',
    ref: 'CSW48287022',
    paymentMethod: 'Cybersave Wallet',
    category: 'Bill Payment',
    beneficiary: 'Airtel Broadband',
  },
  {
    id: 'tx-6',
    title: 'Refund — DTH Recharge',
    time: '28 Jul 2026, 04:32 PM',
    dateGroup: '28 Jul 2026',
    amount: 299,
    type: 'refund',
    ref: 'CSW48286019',
    paymentMethod: 'Original Payment Method',
    category: 'Refund',
    beneficiary: 'Tata Play',
  },
];

export function getTransactionById(id: string): WalletTransaction | undefined {
  return getWalletTransactions().find(tx => tx.id === id);
}

export function getRefundByRef(ref: string): WalletTransaction | undefined {
  return getWalletTransactions().find(
    tx => tx.type === 'refund' && tx.ref === ref,
  );
}

export function getTransactionDetails(id: string) {
  const tx = getTransactionById(id);
  if (!tx) return null;

  const isCredit = tx.amount > 0;
  return {
    id: tx.id,
    title: tx.title,
    amount: Math.abs(tx.amount),
    ref: tx.ref,
    txnId: `TXN${tx.ref.replace(/\D/g, '').slice(-10)}`,
    dateTime: tx.time,
    paymentMethod: tx.paymentMethod ?? 'Cybersave Wallet',
    category: tx.category,
    beneficiary: tx.beneficiary,
    status: isCredit || tx.type === 'refund' ? 'Successful' : 'Successful',
    isCredit,
  };
}

export function getRefundDetails(refundId: string) {
  const refund = getWalletTransactions().find(
    tx => tx.type === 'refund' && (tx.ref === refundId || tx.id === refundId),
  );
  if (!refund) return null;

  return {
    ref: refund.ref,
    amount: Math.abs(refund.amount),
    status: 'completed' as const,
    initiatedAt: '28 Jul 2026, 04:32 PM',
    processedAt: '29 Jul 2026, 10:15 AM',
    creditedAt: '30 Jul 2026, 09:00 AM',
    bankName: LINKED_PAYMENT_METHOD.bankName,
    accountMasked: LINKED_PAYMENT_METHOD.accountMasked,
    referenceNumber: `RF${refund.ref.replace(/\D/g, '')}`,
    steps: [
      {
        key: 'initiated',
        title: 'Refund Initiated',
        subtitle: 'Merchant approved the refund request',
        completed: true,
      },
      {
        key: 'processed',
        title: 'Refund Processed',
        subtitle: 'Amount sent to your bank',
        completed: true,
      },
      {
        key: 'completed',
        title: 'Credited to Wallet',
        subtitle: 'Funds available in your wallet',
        completed: true,
      },
    ],
  };
}

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

export function getPaymentSourceTitle(sourceId: string): string {
  return PAYMENT_SOURCES.find(s => s.id === sourceId)?.title ?? 'UPI Payment';
}

export const DATE_RANGE_LABEL = 'Aug 2026';
