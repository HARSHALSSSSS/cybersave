import { formatCurrency } from '@/lib/utils';

export function formatServiceFee(amount: number, zeroLabel = 'As per portal'): string {
  if (!Number.isFinite(amount) || amount <= 0) return zeroLabel;
  return formatCurrency(amount);
}

export function formatIncludedFee(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) return 'Included';
  return formatCurrency(amount);
}

export function formatBytes(bytes?: number): string | null {
  if (!bytes || bytes <= 0) return null;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB max`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB max`;
}
