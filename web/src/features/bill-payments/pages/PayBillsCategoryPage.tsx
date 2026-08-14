import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { SearchBar } from '@/components/ui/portal-primitives';
import { LoadingBlock, EmptyState } from '@/components/ui/primitives';
import { billPaymentsApi, billPaymentsQueryKeys } from '@/services/api';

export function PayBillsCategoryPage() {
  const { category = '' } = useParams();
  const decoded = decodeURIComponent(category);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: billPaymentsQueryKeys.billers(decoded, search),
    queryFn: () => billPaymentsApi.listBillers({ category: decoded, search: search || undefined, limit: 50 }),
  });

  const billers = data?.data ?? [];

  return (
    <div className="space-y-6 pb-4">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Pay Bills', to: '/pay-bills' },
          { label: decoded.replace(/_/g, ' ') },
        ]}
      />
      <h1 className="font-display text-2xl font-bold capitalize text-[#0A1629]">
        {decoded.replace(/_/g, ' ')} Billers
      </h1>
      <SearchBar value={search} onChange={setSearch} placeholder="Search billers…" className="max-w-xl" />

      {isLoading ? (
        <LoadingBlock className="h-64" />
      ) : billers.length === 0 ? (
        <EmptyState title="No billers found" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {billers.map(b => (
            <Link
              key={b.id}
              to={`/pay-bills/biller/${b.id}`}
              className="flex items-center justify-between rounded-xl border border-[#E8EDF5] bg-white p-4 shadow-sm transition hover:border-[#BFDBFE]"
            >
              <div>
                <p className="font-semibold text-[#0A1629]">{b.name}</p>
                {b.state ? <p className="text-xs text-[#64748B]">{b.state}</p> : null}
              </div>
              <ChevronRight className="h-5 w-5 text-[#94A3B8]" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
