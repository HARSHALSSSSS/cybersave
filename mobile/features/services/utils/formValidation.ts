import type { FormFieldConfig } from '@services/api';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PINCODE_RE = /^\d{6}$/;
const PHONE_RE = /^\d{10}$/;
const NAME_RE = /^[A-Za-z\s.'-]+$/;

function validationNumber(field: FormFieldConfig, key: string): number | undefined {
  const raw = field.validation?.[key];
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string' && raw !== '') {
    const parsed = Number(raw);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

function validationString(field: FormFieldConfig, key: string): string | undefined {
  const raw = field.validation?.[key];
  return typeof raw === 'string' ? raw : undefined;
}

function fieldKind(field: FormFieldConfig): string {
  const key = `${field.key} ${field.label}`.toLowerCase();
  if (field.type === 'DATE') return 'date';
  if (field.type === 'EMAIL') return 'email';
  if (field.type === 'PHONE') return 'phone';
  if (field.type === 'PINCODE') return 'pincode';
  if (field.type === 'NUMBER') return 'number';
  if (key.includes('name') && field.type === 'TEXT') return 'name';
  if (key.includes('dob') || key.includes('birth')) return 'date';
  return field.type.toLowerCase();
}

export function sanitizeFieldInput(field: FormFieldConfig, raw: string): string {
  const kind = fieldKind(field);
  switch (kind) {
    case 'name':
      return raw.replace(/[^A-Za-z\s.'-]/g, '');
    case 'phone':
      return raw.replace(/\D/g, '').slice(0, 10);
    case 'pincode':
      return raw.replace(/\D/g, '').slice(0, 6);
    case 'number':
      return raw.replace(/[^\d.-]/g, '');
    case 'date':
      return raw.replace(/[^\d-]/g, '').slice(0, 10);
    default:
      return raw;
  }
}

function isEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

export function validateFormField(
  field: FormFieldConfig,
  value: unknown,
): string | null {
  if (!field.visible) return null;

  if (field.required && isEmpty(value)) {
    return `${field.label} is required`;
  }
  if (isEmpty(value)) return null;

  const str = String(value).trim();
  const kind = fieldKind(field);

  switch (kind) {
    case 'name':
      if (!NAME_RE.test(str) || str.length < 2) {
        return 'Enter a valid name (letters only)';
      }
      break;
    case 'date':
      if (!DATE_RE.test(str)) {
        return 'Use date format YYYY-MM-DD';
      }
      break;
    case 'email':
      if (!EMAIL_RE.test(str)) return 'Enter a valid email address';
      break;
    case 'phone':
      if (!PHONE_RE.test(str.replace(/\D/g, ''))) {
        return 'Enter a valid 10-digit mobile number';
      }
      break;
    case 'pincode':
      if (!PINCODE_RE.test(str)) return 'Enter a valid 6-digit PIN code';
      break;
    case 'number': {
      const num = Number(str);
      if (Number.isNaN(num)) return 'Enter a valid number';
      const min = validationNumber(field, 'min');
      const max = validationNumber(field, 'max');
      if (min != null && num < min) return `Minimum value is ${min}`;
      if (max != null && num > max) return `Maximum value is ${max}`;
      break;
    }
    default: {
      const pattern = validationString(field, 'pattern');
      const patternMessage = validationString(field, 'patternMessage');
      if (pattern) {
        try {
          const re = new RegExp(pattern);
          if (!re.test(str)) return patternMessage ?? 'Invalid format';
        } catch {
          // ignore bad admin pattern
        }
      }
      const minLength = validationNumber(field, 'minLength');
      const maxLength = validationNumber(field, 'maxLength');
      if (minLength != null && str.length < minLength) {
        return `Minimum ${minLength} characters`;
      }
      if (maxLength != null && str.length > maxLength) {
        return `Maximum ${maxLength} characters`;
      }
    }
  }
  return null;
}

export function validateFormFields(
  fields: FormFieldConfig[],
  values: Record<string, unknown>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fields.filter(f => f.visible)) {
    const err = validateFormField(field, values[field.key]);
    if (err) errors[field.key] = err;
  }
  return errors;
}
