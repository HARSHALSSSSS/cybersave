import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export type DateInput = string | number | Date | dayjs.Dayjs;

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const inrFormatterPrecise = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

/** Format a number as Indian Rupees, e.g. `formatCurrency(125000)` -> "₹1,25,000". */
export function formatCurrency(amount: number, precise = false): string {
  if (!Number.isFinite(amount)) return '₹0';
  return (precise ? inrFormatterPrecise : inrFormatter).format(amount);
}

/** Compact large numbers, e.g. `12500` -> "12.5K". */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en-IN', { notation: 'compact' }).format(value);
}

/** Format a date, e.g. `formatDate(date)` -> "06 Aug 2026". */
export function formatDate(date: DateInput, template = 'DD MMM YYYY'): string {
  return dayjs(date).format(template);
}

/** Format a date with time, e.g. "06 Aug 2026, 06:15 PM". */
export function formatDateTime(date: DateInput, template = 'DD MMM YYYY, hh:mm A'): string {
  return dayjs(date).format(template);
}

/** Human-relative time, e.g. "3 hours ago". */
export function formatRelativeTime(date: DateInput): string {
  return dayjs(date).fromNow();
}
