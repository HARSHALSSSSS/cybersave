import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PortalCard } from '@/components/ui/portal-primitives';
import { Button, Input, Label } from '@/components/ui/button';
import { LoadingBlock, EmptyState } from '@/components/ui/primitives';
import { billPaymentsApi, billPaymentsQueryKeys } from '@/services/api';

export function PayBillsBillerPage() {
  const navigate = useNavigate();
  const { billerId = '' } = useParams();
  const [values, setValues] = useState<Record<string, string>>({});

  const { data: biller, isLoading } = useQuery({
    queryKey: billPaymentsQueryKeys.biller(billerId),
    queryFn: () => billPaymentsApi.getBiller(billerId),
    enabled: Boolean(billerId),
  });

  const fetchBill = useMutation({
    mutationFn: () => billPaymentsApi.createBillRequest(billerId, values),
    onSuccess: data => {
      if (data.status === 'failed') {
        toast.error(data.errorMessage ?? 'Could not fetch bill');
        return;
      }
      navigate(`/pay-bills/bill/${data.id}`);
    },
    onError: () => toast.error('Could not fetch bill details'),
  });

  if (isLoading) return <LoadingBlock className="h-96" />;
  if (!biller) return <EmptyState title="Biller not found" />;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    for (const field of biller!.fields) {
      if (field.required && !values[field.key]?.trim()) {
        toast.error(`${field.label} is required`);
        return;
      }
    }
    fetchBill.mutate();
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 pb-4">
      <Breadcrumbs
        items={[
          { label: 'Pay Bills', to: '/pay-bills' },
          { label: biller.name },
        ]}
      />
      <h1 className="font-display text-2xl font-bold text-[#0A1629]">{biller.name}</h1>
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
                  onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
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
                  onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                  placeholder={field.placeholder ?? undefined}
                  className="mt-1.5"
                  required={field.required}
                />
              )}
              {field.helpText ? (
                <p className="mt-1 text-xs text-[#94A3B8]">{field.helpText}</p>
              ) : null}
            </div>
          ))}
          <Button type="submit" size="lg" className="w-full" disabled={fetchBill.isPending}>
            {fetchBill.isPending ? 'Fetching bill…' : 'Fetch Bill'}
          </Button>
        </form>
      </PortalCard>
    </div>
  );
}
