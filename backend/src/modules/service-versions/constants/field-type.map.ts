import { FormFieldType } from '@prisma/client';

/** Maps admin wizard labels / keys to Prisma FormFieldType */
export const ADMIN_FIELD_TYPE_MAP: Record<string, FormFieldType> = {
  text: FormFieldType.TEXT,
  'text input': FormFieldType.TEXT,
  textarea: FormFieldType.TEXTAREA,
  'text area': FormFieldType.TEXTAREA,
  number: FormFieldType.NUMBER,
  'number input': FormFieldType.NUMBER,
  email: FormFieldType.EMAIL,
  'email address': FormFieldType.EMAIL,
  phone: FormFieldType.PHONE,
  'phone field': FormFieldType.PHONE,
  date: FormFieldType.DATE,
  'date picker': FormFieldType.DATE,
  dropdown: FormFieldType.DROPDOWN,
  'dropdown select': FormFieldType.DROPDOWN,
  select: FormFieldType.DROPDOWN,
  radio: FormFieldType.RADIO,
  'radio control': FormFieldType.RADIO,
  checkbox: FormFieldType.CHECKBOX,
  'checkbox option': FormFieldType.CHECKBOX,
  file: FormFieldType.FILE,
  'file upload': FormFieldType.FILE,
  image: FormFieldType.IMAGE,
  document: FormFieldType.DOCUMENT,
  address: FormFieldType.ADDRESS,
  pincode: FormFieldType.PINCODE,
  state: FormFieldType.STATE,
  district: FormFieldType.DISTRICT,
  city: FormFieldType.CITY,
  country: FormFieldType.COUNTRY,
  multiselect: FormFieldType.MULTI_SELECT,
  datetime: FormFieldType.DATETIME,
  time: FormFieldType.TIME,
};

export function resolveFormFieldType(input: string): FormFieldType {
  const normalized = input.trim().toLowerCase();
  return ADMIN_FIELD_TYPE_MAP[normalized] ?? FormFieldType.TEXT;
}

export function fieldKeyFromLabel(label: string, index: number): string {
  const base = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
  return base || `field_${index + 1}`;
}
