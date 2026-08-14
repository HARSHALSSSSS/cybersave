import { formatCurrency, formatDate } from '@/lib/utils';

export function downloadPaymentReceipt(payload: {
  publicRef: string;
  serviceName: string;
  transactionId: string;
  amount: number | string;
  paymentMethod?: string;
  status: string;
  paidAt: string;
  citizenName?: string;
}) {
  const lines = [
    'CYBERSAVE — OFFICIAL PAYMENT RECEIPT',
    '=====================================',
    '',
    `Application ID: ${payload.publicRef}`,
    `Service: ${payload.serviceName}`,
    payload.citizenName ? `Citizen: ${payload.citizenName}` : '',
    '',
    `Transaction ID: ${payload.transactionId}`,
    `Amount: ${formatCurrency(payload.amount)}`,
    `Payment Method: ${payload.paymentMethod ?? 'UPI'}`,
    `Status: ${payload.status}`,
    `Date: ${formatDate(payload.paidAt, 'long')}`,
    '',
    'This is a computer-generated receipt for government service fees.',
    'Cybersave Digital India Platform',
  ].filter(Boolean);

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `cybersave-receipt-${payload.publicRef.replace(/\s+/g, '-')}.txt`;
  anchor.click();
  URL.revokeObjectURL(url);
}
