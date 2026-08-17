import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Receipt, Zap } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PortalCard, SearchBar, SectionHeading } from '@/components/ui/portal-primitives';
import { LoadingBlock, EmptyState } from '@/components/ui/primitives';
import { billPaymentsApi, billPaymentsQueryKeys } from '@/services/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useState } from 'react';

const CATEGORY_ICONS: Record<string, string> = {
  electricity: '⚡',
  water: '💧',
  gas: '🔥',
  broadband: '🌐',
  mobile: '📱',
  mobile_postpaid: '📱',
  dth: '📺',
  insurance: '🛡️',
  loan_repayment: '🏦',
  education: '🎓',
  fastag: '🚗',
};

export function PayBillsHomePage() {
  const [search, setSearch] = useState('');
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);

  const { data: categories = [], isLoading, isError, refetch } = useQuery({
    queryKey: billPaymentsQueryKeys.categories(),
    queryFn: () => billPaymentsApi.listCategories(),
  });

  const { data: history } = useQuery({
    queryKey: billPaymentsQueryKeys.history('all', 1),
    queryFn: () => billPaymentsApi.getBillPaymentHistory({ page: 1, limit: 5 }),
    enabled: isAuthenticated,
  });

  const { data: recent = [] } = useQuery({
    queryKey: billPaymentsQueryKeys.recent(),
    queryFn: () => billPaymentsApi.listRecentBillers(),
    enabled: isAuthenticated,
  });

  const { data: saved = [] } = useQuery({
    queryKey: billPaymentsQueryKeys.saved(),
    queryFn: () => billPaymentsApi.listSavedBillers(),
    enabled: isAuthenticated,
  });

  const filtered = categories.filter(c => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return c.displayName.toLowerCase().includes(q) || c.providerCategory.toLowerCase().includes(q);
  });

  const popular = filtered.filter(c => c.isFeatured).slice(0, 6);

  return (
    <div className="space-y-8 pb-4">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Pay Bills' }]} />

      <section className="rounded-2xl border border-[#E8EDF5] bg-gradient-to-br from-[#EFF6FF] to-white p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2563EB] text-white">
            <Zap className="h-7 w-7" />
          </span>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-[#0A1629]">Pay Bills</h1>
            <p className="mt-2 max-w-xl text-sm leading-7 text-[#64748B]">
              Pay electricity, water, gas, DTH, mobile and other utility bills from one place.
              Search a category, fetch the bill, then pay securely.
            </p>
          </div>
        </div>
        <div className="mt-6 max-w-xl">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search electricity, water, DTH…"
          />
        </div>
      </section>

      {isError ? (
        <EmptyState
          title="Could not load bill categories"
          description="Check your connection and try again."
          action={
            <button type="button" className="text-sm font-semibold text-[#2563EB]" onClick={() => refetch()}>
              Retry
            </button>
          }
        />
      ) : null}

      {popular.length > 0 ? (
        <section>
          <SectionHeading title="Popular" subtitle="Most used bill categories" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map(cat => (
              <CategoryCard key={cat.id} cat={cat} />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <SectionHeading title="All Categories" subtitle="Select a category to find your biller" />
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <LoadingBlock key={i} className="h-28" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No categories found" description="Try a different search." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(cat => (
              <CategoryCard key={`all-${cat.id}`} cat={cat} />
            ))}
          </div>
        )}
      </section>

      {recent.length > 0 ? (
        <section>
          <SectionHeading title="Pay again" />
          <div className="grid gap-3 sm:grid-cols-2">
            {recent.map(item => (
              <Link
                key={`${item.billerId}-${item.accountMasked}`}
                to={`/pay-bills/biller/${item.billerId}`}
                state={{ accountHolder: item.accountHolder }}
                className="flex items-center justify-between rounded-xl border border-[#E8EDF5] bg-white p-4 shadow-sm hover:border-[#BFDBFE]"
              >
                <div>
                  <p className="font-semibold text-[#0A1629]">{item.billerName}</p>
                  <p className="text-xs text-[#64748B]">{item.accountMasked}</p>
                </div>
                <span className="text-sm font-semibold text-[#2563EB]">Pay</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {saved.length > 0 ? (
        <section>
          <SectionHeading title="Saved billers" />
          <div className="grid gap-3 sm:grid-cols-2">
            {saved.map(item => (
              <Link
                key={item.id}
                to={`/pay-bills/biller/${item.billerId}`}
                state={{ accountHolder: item.accountHolderData }}
                className="flex items-center justify-between rounded-xl border border-[#E8EDF5] bg-white p-4 shadow-sm hover:border-[#BFDBFE]"
              >
                <div>
                  <p className="font-semibold text-[#0A1629]">{item.nickname || item.billerName}</p>
                  <p className="text-xs text-[#64748B]">{item.accountMasked}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-[#94A3B8]" />
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {isAuthenticated ? (
        <section>
          <div className="mb-3 flex items-end justify-between">
            <SectionHeading title="Recent Payments" />
            <Link to="/pay-bills/history" className="text-sm font-semibold text-[#2563EB]">
              View all
            </Link>
          </div>
          {(history?.data.length ?? 0) > 0 ? (
            <PortalCard padding="none" className="divide-y divide-[#F1F5F9]">
              {history!.data.map(tx => (
                <Link
                  key={tx.id}
                  to={`/pay-bills/receipt/${tx.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-[#F8FAFC]"
                >
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
                </Link>
              ))}
            </PortalCard>
          ) : (
            <p className="text-sm text-[#64748B]">No bill payments yet. Pay your first bill above.</p>
          )}
        </section>
      ) : (
        <p className="text-sm text-[#64748B]">Sign in to fetch bills, save billers, and view payment history.</p>
      )}
    </div>
  );
}

function CategoryCard({
  cat,
}: {
  cat: { id: string; providerCategory: string; displayName: string; description: string | null };
}) {
  return (
    <Link
      to={`/pay-bills/category/${encodeURIComponent(cat.providerCategory)}`}
      className="group flex items-center gap-4 rounded-2xl border border-[#E8EDF5] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#BFDBFE] hover:shadow-md"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFF6FF] text-2xl">
        {CATEGORY_ICONS[cat.providerCategory.toLowerCase()] ?? '📄'}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-[#0A1629] group-hover:text-[#2563EB]">{cat.displayName}</p>
        {cat.description ? (
          <p className="mt-0.5 truncate text-xs text-[#64748B]">{cat.description}</p>
        ) : null}
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-[#94A3B8]" />
    </Link>
  );
}
