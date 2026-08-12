import type { BbpsAccountHolderParam } from './bbps-provider.interface';

export interface NormalizedBillerField {
  key: string;
  label: string;
  type: string;
  required: boolean;
  minLength?: number;
  maxLength?: number;
  regex?: string;
  placeholder?: string;
  helpText?: string;
  options?: Array<{ label: string; value: string }>;
}

function slugifyFieldKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function mapDataType(dataType?: string): string {
  switch ((dataType ?? 'string').toLowerCase()) {
    case 'numeric':
    case 'number':
      return 'number';
    case 'mobile':
    case 'phone':
      return 'mobile';
    case 'email':
      return 'email';
    case 'date':
      return 'date';
    default:
      return 'text';
  }
}

export function normalizeAccountHolderFields(
  config: unknown,
): NormalizedBillerField[] {
  if (!config || typeof config !== 'object') {
    return [];
  }

  const root = config as Record<string, unknown>;
  const params =
    (root.params as BbpsAccountHolderParam[] | undefined) ??
    ((root.gateway_data as Record<string, unknown> | undefined)
      ?.account_holder_config as { params?: BbpsAccountHolderParam[] } | undefined)
      ?.params ??
    [];

  return params
    .filter((param) => param.visibility !== false)
    .map((param) => ({
      key: slugifyFieldKey(param.name),
      label: param.name,
      type: mapDataType(param.data_type),
      required: !param.optional,
      minLength: param.min_length,
      maxLength: param.max_length,
      regex: param.regex,
      placeholder: param.name,
      options: param.values?.length
        ? param.values.map((value) => ({ label: value, value }))
        : undefined,
    }));
}

export function remapAccountHolderForProvider(
  config: unknown,
  values: Record<string, string>,
): Record<string, string> {
  const fields = normalizeAccountHolderFields(config);
  const mapped: Record<string, string> = {};

  for (const field of fields) {
    const value = values[field.key]?.trim();
    if (value) {
      mapped[field.label] = value;
    }
  }

  for (const [key, value] of Object.entries(values)) {
    if (!value?.trim()) continue;
    if (fields.some(field => field.key === key)) continue;
    mapped[key] = value.trim();
  }

  return mapped;
}

export function normalizeBillAmountFromProvider(
  rawAmount: number,
  providerName: string,
): number {
  if (!rawAmount || rawAmount <= 0) return 0;
  if (providerName === 'mock') return rawAmount;
  if (Number.isInteger(rawAmount) && rawAmount >= 100) {
    return rawAmount / 100;
  }
  return rawAmount;
}

export function maskAccountValue(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length <= 4) {
    return '••••';
  }
  return `•••• ${trimmed.slice(-4)}`;
}

export function maskAccountHolderData(
  data: Record<string, string>,
): string {
  const first = Object.values(data).find((v) => v?.trim());
  return first ? maskAccountValue(first) : '••••';
}

export function validateAccountHolderData(
  fields: NormalizedBillerField[],
  values: Record<string, string>,
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field of fields) {
    const value = values[field.key]?.trim() ?? '';
    if (field.required && !value) {
      errors[field.key] = `${field.label} is required`;
      continue;
    }
    if (!value) continue;
    if (field.minLength && value.length < field.minLength) {
      errors[field.key] = `${field.label} must be at least ${field.minLength} characters`;
    }
    if (field.maxLength && value.length > field.maxLength) {
      errors[field.key] = `${field.label} must be at most ${field.maxLength} characters`;
    }
    if (field.regex) {
      try {
        const re = new RegExp(field.regex);
        if (!re.test(value)) {
          errors[field.key] = `${field.label} format is invalid`;
        }
      } catch {
        // ignore invalid regex from provider
      }
    }
  }

  return errors;
}

export const CATEGORY_DISPLAY: Record<string, { name: string; icon: string }> = {
  electricity: { name: 'Electricity', icon: 'bolt' },
  water: { name: 'Water', icon: 'water' },
  gas: { name: 'Gas', icon: 'flame' },
  broadband: { name: 'Broadband', icon: 'wifi' },
  mobile_postpaid: { name: 'Mobile Postpaid', icon: 'mobile' },
  dth: { name: 'DTH', icon: 'tv' },
  insurance: { name: 'Insurance', icon: 'shield' },
  loan: { name: 'Loan Repayment', icon: 'bank' },
  loan_repayment: { name: 'Loan Repayment', icon: 'bank' },
  education: { name: 'Education', icon: 'book' },
  fastag: { name: 'FASTag', icon: 'car' },
};

export function categoryDisplayName(providerCategory: string): string {
  return (
    CATEGORY_DISPLAY[providerCategory.toLowerCase()]?.name ??
    providerCategory
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export function categoryIcon(providerCategory: string): string {
  return CATEGORY_DISPLAY[providerCategory.toLowerCase()]?.icon ?? 'bill';
}
