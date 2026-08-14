import type { FormFieldConfig } from '@/services/api/services.api';
import { Input, Label } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type DynamicFormFieldsProps = {
  fields: FormFieldConfig[];
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
};

function normalizeType(type: string) {
  if (type === 'DROPDOWN') return 'SELECT';
  return type;
}

/** Admin fields are visible unless explicitly hidden */
export function getVisibleFormFields(fields: FormFieldConfig[]) {
  return fields.filter(f => f.visible !== false).sort((a, b) => a.sortOrder - b.sortOrder);
}

function FieldWrapper({
  field,
  error,
  children,
}: {
  field: FormFieldConfig;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={field.key} className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
        {field.label}
        {field.required ? <span className="text-red-500"> *</span> : null}
      </Label>
      {children}
      {field.helpText ? <p className="text-xs text-[#9CA3AF]">{field.helpText}</p> : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

export function DynamicFormFields({ fields, values, onChange, errors = {}, disabled = false }: DynamicFormFieldsProps) {
  const visible = getVisibleFormFields(fields);

  if (visible.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-4 py-6 text-center text-sm text-[#64748B]">
        No form fields are configured for this service yet. Please contact support or try manual apply on
        the official portal.
      </p>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {visible.map(field => {
        const type = normalizeType(field.type);
        const value = values[field.key] ?? '';
        const error = errors[field.key];
        const spanFull =
          type === 'TEXTAREA' ||
          type === 'RADIO' ||
          type === 'CHECKBOX' ||
          type === 'MULTI_SELECT' ||
          field.config?.fullWidth === true;

        const inputClass =
          'h-11 w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-sm text-[#0A1629] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 disabled:cursor-not-allowed disabled:opacity-70';

        let control: React.ReactNode;

        if (type === 'TEXTAREA') {
          control = (
            <textarea
              id={field.key}
              rows={4}
              disabled={disabled}
              value={String(value)}
              placeholder={field.placeholder ?? undefined}
              onChange={e => onChange(field.key, e.target.value)}
              className={cn(inputClass, 'h-auto py-2.5')}
            />
          );
        } else if (type === 'SELECT' || type === 'STATE' || type === 'DISTRICT') {
          control = (
            <select
              id={field.key}
              disabled={disabled}
              value={String(value)}
              onChange={e => onChange(field.key, e.target.value)}
              className={inputClass}
            >
              <option value="">{field.placeholder ?? 'Select…'}</option>
              {(field.options ?? []).map(opt => (
                <option key={opt.id} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          );
        } else if (type === 'RADIO') {
          control = (
            <div className="flex flex-wrap gap-2">
              {(field.options ?? []).map(opt => {
                const selected = value === opt.value;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange(field.key, opt.value)}
                    className={cn(
                      'rounded-xl border px-4 py-2 text-sm font-medium transition',
                      selected
                        ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]'
                        : 'border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#CBD5E1]',
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          );
        } else if (type === 'CHECKBOX') {
          control = (
            <label className="flex items-center gap-2 text-sm text-[#0A1629]">
              <input
                id={field.key}
                type="checkbox"
                disabled={disabled}
                checked={Boolean(value)}
                onChange={e => onChange(field.key, e.target.checked)}
                className="h-4 w-4 rounded border-[#E5E7EB] text-[#2563EB]"
              />
              {field.placeholder ?? field.label}
            </label>
          );
        } else {
          const inputType =
            type === 'NUMBER' || type === 'PINCODE'
              ? 'number'
              : type === 'EMAIL'
                ? 'email'
                : type === 'PHONE'
                  ? 'tel'
                  : type === 'DATE'
                    ? 'date'
                    : 'text';

          control = (
            <Input
              id={field.key}
              type={inputType}
              disabled={disabled}
              value={String(value)}
              placeholder={field.placeholder ?? undefined}
              onChange={e => onChange(field.key, e.target.value)}
              className="border-[#E5E7EB] bg-[#F9FAFB]"
            />
          );
        }

        return (
          <div key={field.id} className={spanFull ? 'sm:col-span-2' : undefined}>
            <FieldWrapper field={field} error={error}>
              {control}
            </FieldWrapper>
          </div>
        );
      })}
    </div>
  );
}

export function validateFormFields(
  fields: FormFieldConfig[],
  values: Record<string, unknown>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of getVisibleFormFields(fields)) {
    const val = values[field.key];
    const empty =
      val === undefined ||
      val === null ||
      val === '' ||
      (Array.isArray(val) && val.length === 0);
    if (field.required && empty) {
      errors[field.key] = `${field.label} is required`;
      continue;
    }
    if (empty) continue;

    const type = normalizeType(field.type);
    const text = String(val);

    if (type === 'EMAIL' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
      errors[field.key] = 'Enter a valid email address';
    } else if (type === 'PHONE') {
      const digits = text.replace(/\D/g, '');
      const national =
        digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
      if (!/^[6-9]\d{9}$/.test(national)) {
        errors[field.key] = 'Enter a valid 10-digit mobile number';
      }
    } else if ((type === 'NUMBER' || type === 'PINCODE') && Number.isNaN(Number(text))) {
      errors[field.key] = 'Enter a valid number';
    }
  }
  return errors;
}
