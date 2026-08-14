import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Receipt, Zap } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PortalCard, SearchBar, SectionHeading } from '@/components/ui/portal-primitives';
import { LoadingBlock, EmptyState } from '@/components/ui/primitives';
import { billPaymentsApi, billPaymentsQueryKeys } from '@/services/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useState } from 'react';

const CATEGORY_ICONS: Record<string, string> = {
  electricity: '⚡',
  mobile: '📱',
  dth: '📺',
  gas: '🔥',
  water: '💧',
  broadband: '🌐',
};

export function PayBillsHomePage() {
  const [search, setSearch] = useState('');

  const { data: categories = [], isLoading } = useQuery({
    queryKey: billPaymentsQueryKeys.categories(),
    queryFn: () => billPaymentsApi.listCategories(),
  });

  const { data: history } = useQuery({
    queryKey: billPaymentsQueryKeys.history('all', 1),
    queryFn: () => billPaymentsApi.getBillPaymentHistory({ page: 1, limit: 5 }),
  });

  const filtered = categories.filter(c => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return c.displayName.toLowerCase().includes(q) || c.providerCategory.toLowerCase().includes(q);
  });

  const featured = filtered.filter(c => c.isFeatured);
  const list = featured.length > 0 ? featured : filtered;

  return (
    <div className="space-y-8 pb-4">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Pay Bills' }]} />

      <section className="rounded-2xl border border-[#E8EDF5] bg-gradient-to-br from-[#EFF6FF] to-white p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2563EB] text-white">
            <Zap className="h-7 w-7" />
          </span>
          <div>
            <h1 className="font-display text-3xl font-bold text-[#0A1629]">Pay Bills</h1>
            <p className="mt-2 max-w-xl text-sm leading-7 text-[#64748B]">
              Pay electricity, mobile, DTH, gas and utility bills securely via BBPS · Razorpay.
            </p>
          </div>
        </div>
        <div className="mt-6 max-w-xl">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search bill categories…"
          />
        </div>
      </section>

      <section>
        <SectionHeading title="Bill Categories" subtitle="Select a category to pay your bill" />
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <LoadingBlock key={i} className="h-28" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <EmptyState title="No categories found" description="Try a different search." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map(cat => (
              <Link
                key={cat.id}
                to={`/pay-bills/category/${encodeURIComponent(cat.providerCategory)}`}
                className="group flex items-center gap-4 rounded-2xl border border-[#E8EDF5] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#BFDBFE] hover:shadow-md"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFF6FF] text-2xl">
                  {CATEGORY_ICONS[cat.providerCategory.toLowerCase()] ?? '📄'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#0A1629] group-hover:text-[#2563EB]">
                    {cat.displayName}
                  </p>
                  {cat.description ? (
                    <p className="mt-0.5 truncate text-xs text-[#64748B]">{cat.description}</p>
                  ) : null}
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-[#94A3B8]" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {(history?.data.length ?? 0) > 0 ? (
        <section>
          <SectionHeading title="Recent Payments" />
          <PortalCard padding="none" className="divide-y divide-[#F1F5F9]">
            {history!.data.map(tx => (
              <div key={tx.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <Receipt className="h-5 w-5 text-[#2563EB]" />
                  <div>
                    <p className="font-medium text-[#0A1629]">{tx.biller.name}</p>
                    <p className="text-xs text-[#94A3B8]">{formatDate(tx.createdAt)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#0A1629]">{formatCurrency(tx.totalAmount)}</p>
                  <p className="text-xs capitalize text-emerald-600">{tx.status}</p>
                </div>
              </div>
            ))}
          </PortalCard>
        </section>
      ) : null}
    </div>
  );
}
