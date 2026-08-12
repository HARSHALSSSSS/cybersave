/** Live catalog comes from GET /services — filters only remain here for UI chips. */

export const SERVICE_FILTERS = ['All', 'Popular', 'Government', 'Finance'] as const;
export type ServiceFilter = (typeof SERVICE_FILTERS)[number];

export type ServiceIconKey =
  | 'shield'
  | 'card'
  | 'badge'
  | 'bill'
  | 'bank'
  | 'umbrella'
  | 'book'
  | 'document'
  | 'health'
  | 'building'
  | 'home'
  | 'tax'
  | 'transport';

export type ServiceCategoryMeta = {
  id: string;
  label: string;
  color: string;
  bg: string;
  icon: ServiceIconKey;
  filters: ServiceFilter[];
};

export type ServiceOption = {
  id: string;
  label: string;
  fee: string;
  processingTime: string;
};

export type ServiceDetail = {
  id: string;
  title: string;
  description: string;
  fee: string;
  processingTime: string;
  documents: string[];
  formFields: Array<{ label: string; key: string; required?: boolean }>;
};

/** @deprecated Use API catalog. Kept for type compatibility only. */
export const ALL_SERVICE_CATEGORIES: ServiceCategoryMeta[] = [];

/** @deprecated Use API catalog. */
export const SERVICE_OPTIONS: Record<string, ServiceOption[]> = {};

/** @deprecated Use API catalog. */
export const SERVICE_DETAILS: Record<string, Record<string, ServiceDetail>> = {};

/** @deprecated Use profile from auth store. */
export const DEFAULT_APPLICATION_FORM = {
  fullName: '',
  phone: '',
  email: '',
  address: '',
};

export const PAYMENT_METHODS = ['UPI', 'Card', 'Net Banking'] as const;

export function getServiceCategory(_categoryId: string) {
  return undefined;
}

export function getServiceOptions(_categoryId: string) {
  return [] as ServiceOption[];
}

export function getServiceOption(_categoryId: string, _optionId: string) {
  return undefined;
}

export function getServiceDetail(_categoryId: string, _optionId: string) {
  return undefined;
}

export function getFilteredServices(_filter: ServiceFilter) {
  return ALL_SERVICE_CATEGORIES;
}

export function getDetailOrGeneric(_categoryId: string, _optionId: string) {
  return undefined;
}

export function buildGenericDetail(_categoryId: string, _optionId: string) {
  return undefined;
}
