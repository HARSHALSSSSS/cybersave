import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PortalCard } from '@/components/ui/portal-primitives';
import { Button, Input, Label } from '@/components/ui/button';
import { LoadingBlock, EmptyState } from '@/components/ui/primitives';
import { useRequireAuth } from '@/features/auth/hooks/useRequireAuth';
import { extractErrorMessage, extractValidationIssues } from '@/features/apply/utils/validation-errors';
import { billPaymentsApi, billPaymentsQueryKeys, type BbpsField } from '@/services/api';

function validateFields(fields: BbpsField[], values: Record<string, string>): Record<string, string> {
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
        if (!new RegExp(field.regex).test(value)) {
          errors[field.key] = `${field.label} format is invalid`;
        }
      } catch {
        // ignore invalid provider regex
      }
    }
  }
  return errors;
}

export function PayBillsBillerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const requireAuth = useRequireAuth();
  const { billerId = '' } = useParams();
  const preset = (location.state as { accountHolder?: Record<string, string> } | null)?.accountHolder;
  const [values, setValues] = useState<Record<string, string>>(preset ?? {});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saveBiller, setSaveBiller] = useState(Boolean(preset));

  const { data: biller, isLoading, isError, refetch } = useQuery({
    queryKey: billPaymentsQueryKeys.biller(billerId),
    queryFn: () => billPaymentsApi.getBiller(billerId),
    enabled: Boolean(billerId),
    retry: 1,
  });

  useEffect(() => {
    if (preset) setValues(prev => ({ ...preset, ...prev }));
  }, [preset]);

  const fetchBill = useMutation({
    mutationFn: () => billPaymentsApi.createBillRequest(billerId, values),
    onSuccess: async data => {
      if (saveBiller) {
        try {
          await billPaymentsApi.saveBiller(billerId, values);
        } catch {
          // Payment can still continue if save fails
        }
      }
      if (data.status === 'failed') {
        toast.error(data.errorMessage ?? 'Could not fetch bill');
        return;
      }
      navigate(`/pay-bills/bill/${data.id}`);
    },
    onError: (error: unknown) => {
      const issues = extractValidationIssues(error);
      if (issues.length > 0) {
        setFieldErrors(Object.fromEntries(issues.map(issue => [issue.field, issue.message])));
      }
      toast.error(extractErrorMessage(error, 'Could not fetch bill details'));
    },
  });

  if (isLoading) return <LoadingBlock className="h-96" />;
  if (isError || !biller) {
    return (
      <EmptyState
        title="Biller not found"
        description="This provider may be unavailable. Try another biller."
        action={
          <button type="button" className="text-sm font-semibold text-[#2563EB]" onClick={() => refetch()}>
            Retry
          </button>
        }
      />
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors = validateFields(biller!.fields, values);
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error('Please check the highlighted fields');
      return;
    }
    requireAuth(() => fetchBill.mutate(), {
      redirectTo: location.pathname,
      requireProfile: false,
    });
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 pb-4">
      <Breadcrumbs
        items={[
          { label: 'Pay Bills', to: '/pay-bills' },
          { label: biller.name },
        ]}
      />
      <div>
        <h1 className="font-display text-2xl font-bold text-[#0A1629]">{biller.name}</h1>
        {biller.aliasName ? <p className="mt-1 text-sm text-[#64748B]">{biller.aliasName}</p> : null}
      </div>
      <PortalCard>
        <form onSubmit={handleSubmit} className="space-y-4">
          {biller.fields.map(field => (
            <div key={field.key}>
              <Label htmlFor={field.key}>
                {field.label}
                {field.required ? ' *' : ''}
              </Label>
              {field.options && field.options.length > 0 ? (
                <select
                  id={field.key}
                  value={values[field.key] ?? ''}
                  onChange={e => {
                    setValues(v => ({ ...v, [field.key]: e.target.value }));
                    setFieldErrors(prev => ({ ...prev, [field.key]: '' }));
                  }}
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#E2E8F0] px-3 text-sm"
                  required={field.required}
                >
                  <option value="">Select…</option>
                  {field.options.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id={field.key}
                  value={values[field.key] ?? ''}
                  onChange={e => {
                    setValues(v => ({ ...v, [field.key]: e.target.value }));
                    setFieldErrors(prev => ({ ...prev, [field.key]: '' }));
                  }}
                  placeholder={field.placeholder ?? undefined}
                  className="mt-1.5"
                  required={field.required}
                  inputMode={field.type === 'number' || field.type === 'mobile' ? 'numeric' : undefined}
                />
              )}
              {fieldErrors[field.key] ? (
                <p className="mt-1 text-xs text-red-600">{fieldErrors[field.key]}</p>
              ) : field.helpText ? (
                <p className="mt-1 text-xs text-[#94A3B8]">{field.helpText}</p>
              ) : null}
            </div>
          ))}
          <label className="flex items-center gap-2 text-sm text-[#334155]">
            <input
              type="checkbox"
              checked={saveBiller}
              onChange={e => setSaveBiller(e.target.checked)}
              className="h-4 w-4 rounded border-[#CBD5E1]"
            />
            Save this biller for next time
          </label>
          <Button type="submit" size="lg" className="w-full" disabled={fetchBill.isPending}>
            {fetchBill.isPending ? 'Fetching bill…' : 'Fetch Bill'}
          </Button>
        </form>
      </PortalCard>
    </div>
  );
}
