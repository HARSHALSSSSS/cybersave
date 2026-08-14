import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ChevronLeft, ChevronRight, Clock, ShieldCheck } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import {
  PortalCard,
  SearchBar,
  StatusPill,
} from '@/components/ui/portal-primitives';
import { ServiceIcon, LoadingBlock, EmptyState } from '@/components/ui/primitives';
import { getCatalogIconStyle } from '@/lib/catalog';
import { buildServiceDetailPath } from '@/features/services/utils/service-navigation';
import { servicesApi, servicesQueryKeys } from '@/services/api';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 12;

export function CategoryServicesPage() {
  const { mainSlug = '' } = useParams();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'popular' | 'name' | 'fee'>('popular');
  const [page, setPage] = useState(1);

  const { data: catalog = [], isLoading } = useQuery({
    queryKey: servicesQueryKeys.catalog(),
    queryFn: () => servicesApi.getServicesCatalog(),
  });

  const main = catalog.find(m => m.slug === mainSlug);

  const filtered = useMemo(() => {
    if (!main) return [];
    let subs = [...main.subServices];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      subs = subs.filter(
        s =>
          s.displayName.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          (s.description ?? '').toLowerCase().includes(q),
      );
    }
    if (sort === 'name') subs.sort((a, b) => a.displayName.localeCompare(b.displayName));
    if (sort === 'fee') subs.sort((a, b) => Number(a.baseFee) - Number(b.baseFee));
    return subs;
  }, [main, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (isLoading) return <LoadingBlock className="h-96" />;

  if (!main) {
    return (
      <EmptyState title="Category not found" description="Return to the services catalog." />
    );
  }

  const style = getCatalogIconStyle(main.slug, 0);

  return (
    <div className="space-y-8 pb-4">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'All Services', to: '/services' },
          { label: main.name },
        ]}
      />

      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-bold text-[#0A1629]">{main.name}</h1>
            <StatusPill tone="blue">{main.subServices.length} Services Available</StatusPill>
          </div>
          <p className="mt-3 text-sm leading-7 text-[#64748B] sm:text-base">
            {main.description ??
              'Establishing, updating, and authenticating official credentials through verified government channels.'}
          </p>
        </div>

        <div className="flex gap-3">
          <PortalCard padding="sm" className="min-w-[140px] text-center">
            <Clock className="mx-auto h-5 w-5 text-[#2563EB]" />
            <p className="mt-2 text-xs text-[#64748B]">Average Speed</p>
            <p className="font-bold text-[#0A1629]">48 Hours</p>
          </PortalCard>
          <PortalCard padding="sm" className="min-w-[140px] text-center">
            <ShieldCheck className="mx-auto h-5 w-5 text-emerald-600" />
            <p className="mt-2 text-xs text-[#64748B]">Verified Status</p>
            <p className="font-bold text-emerald-600">100% Secure</p>
          </PortalCard>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <SearchBar
          value={search}
          onChange={v => {
            setSearch(v);
            setPage(1);
          }}
          placeholder={`Search ${main.name.toLowerCase()}…`}
          className="flex-1"
        />
        <div className="flex flex-wrap gap-3">
          <select
            value={sort}
            onChange={e => setSort(e.target.value as typeof sort)}
            className="h-12 rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm outline-none focus:border-[#2563EB]"
          >
            <option value="popular">Sort by: Most Popular</option>
            <option value="name">Sort by: Name</option>
            <option value="fee">Sort by: Fee</option>
          </select>
        </div>
      </div>

      {pageItems.length === 0 ? (
        <EmptyState title="No services in this category" description="Try a different search term." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pageItems.map(sub => (
            <Link
              key={sub.id}
              to={buildServiceDetailPath(main.slug, sub.slug, sub)}
              className="group flex flex-col rounded-2xl border border-[#E8EDF5] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#BFDBFE] hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <ServiceIcon
                  icon={style.icon}
                  color={style.iconColor}
                  bg={style.iconBg}
                  size="sm"
                />
                <span className="shrink-0 rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-[10px] font-bold text-[#2563EB]">
                  {sub.processingTime ?? '2-3 Days'}
                </span>
              </div>
              <p className="mt-3 text-[10px] font-bold tracking-wider text-[#94A3B8] uppercase">
                {main.name.split(' ')[0]}
              </p>
              <h3 className="mt-1 font-semibold text-[#0A1629] group-hover:text-[#2563EB]">
                {sub.displayName}
              </h3>
              <p className="mt-2 flex-1 line-clamp-3 text-sm leading-6 text-[#64748B]">
                {sub.shortDescription ?? sub.description ?? 'Apply online through Cybersave.'}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#2563EB]">
                Apply Now <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="flex h-10 items-center gap-1 rounded-lg border border-[#E2E8F0] px-3 text-sm disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPage(i + 1)}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium',
                page === i + 1
                  ? 'bg-[#2563EB] text-white'
                  : 'border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]',
              )}
            >
              {i + 1}
            </button>
          ))}
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="flex h-10 items-center gap-1 rounded-lg border border-[#E2E8F0] px-3 text-sm disabled:opacity-40"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <Link
        to="/services"
        className="inline-flex items-center gap-1 text-sm font-medium text-[#2563EB]"
      >
        <ChevronLeft className="h-4 w-4" /> Back to all services
      </Link>
    </div>
  );
}
