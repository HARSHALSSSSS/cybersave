/** Shared, cross-feature type definitions. */

export type ThemeMode = 'light' | 'dark';

export type SortDirection = 'asc' | 'desc';

/**
 * Canonical status vocabulary used across the app (users, applications,
 * transactions, tickets, ...). UI components map these to visual variants.
 */
export type StatusValue =
  | 'completed'
  | 'success'
  | 'active'
  | 'approved'
  | 'pending'
  | 'processing'
  | 'in-review'
  | 'review'
  | 'rejected'
  | 'failed'
  | 'danger'
  | 'unverified'
  | 'inactive'
  | 'blocked'
  | 'suspended';

/** Visual variant a status maps to, consumed by `Badge` / `StatusBadge`. */
export type StatusVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'muted'
  | 'blocked';

export interface SelectOption<TValue = string> {
  label: string;
  value: TValue;
  disabled?: boolean;
}

export interface PaginationState {
  page: number;
  limit: number;
}

export type ID = string | number;
