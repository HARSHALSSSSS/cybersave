import { useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ChevronRight, ExternalLink, MapPin } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PortalCard, SearchBar, SectionHeading } from '@/components/ui/portal-primitives';
import { Button } from '@/components/ui/button';
import { ServiceIcon, LoadingBlock, EmptyState } from '@/components/ui/primitives';
import { getCatalogIconStyle } from '@/lib/catalog';
import { buildServiceDetailPath } from '@/features/services/utils/service-navigation';
import { FEATURED_STATES, getFeaturedState, getStateName } from '@/lib/states';
import { servicesApi, servicesQueryKeys, type MainServiceCatalogItem } from '@/services/api';
import { useState } from 'react';

function servicesForState(catalog: MainServiceCatalogItem[], stateCode: string) {
  return catalog.flatMap(main =>
    main.subServices
      .filter(sub => sub.requiresStateSelection && sub.availableStates?.some(s => s.code === stateCode))
      .map(sub => ({ main, sub })),
  );
}

export function StateServicesPage() {
  const { stateCode = '' } = useParams();
  const code = stateCode.toUpperCase();
  const state = getFeaturedState(code);
  const [search, setSearch] = useState('');

  const { data: catalog = [], isLoading } = useQuery({
    queryKey: servicesQueryKeys.catalog(),
    queryFn: () => servicesApi.getServicesCatalog(),
  });

  const items = useMemo(() => servicesForState(catalog, code), [catalog, code]);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter(({ main, sub }) => {
      const hay = `${main.name} ${sub.name} ${sub.displayName} ${sub.description ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, search]);

  const byCategory = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const item of filtered) {
      const list = map.get(item.main.slug) ?? [];
      list.push(item);
      map.set(item.main.slug, list);
    }
    return map;
  }, [filtered]);

  if (isLoading) return <LoadingBlock className="h-96" />;

  return (
    <div className="space-y-8 pb-4">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Services', to: '/services' },
          { label: state?.name ?? getStateName(code) },
        ]}
      />

      <section
        className="overflow-hidden rounded-2xl border border-[#E8EDF5] p-6 sm:p-8"
        style={{
          background: state
            ? `linear-gradient(135deg, ${state.bg} 0%, white 60%)`
            : 'linear-gradient(135deg, #EFF6FF 0%, white 60%)',
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-md"
              style={{ backgroundColor: state?.color ?? '#2563EB' }}
            >
              {code.slice(0, 2)}
            </span>
            <div>
              <h1 className="font-display text-3xl font-bold text-[#0A1629]">
                {state?.name ?? getStateName(code)} Services
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-7 text-[#64748B]">
                {state
                  ? `${state.tagline} · Apply for certificates, welfare schemes and government services available in ${state.name}.`
                  : `Browse state-specific government services configured for ${code}.`}
              </p>
              {state ? (
                <a
                  href={state.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563EB] hover:underline"
                >
                  {state.portal} <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </div>
          </div>
          <div className="rounded-xl border border-[#E8EDF5] bg-white px-4 py-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-[#0A1629]">{items.length}</p>
            <p className="text-xs text-[#64748B]">Services available</p>
          </div>
        </div>
        <div className="mt-6 max-w-xl">
          <SearchBar value={search} onChange={setSearch} placeholder={`Search ${state?.name ?? code} services…`} />
        </div>
      </section>

      {/* Other states */}
      <section>
        <SectionHeading title="Browse Other States" subtitle="Select a state to view available services" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED_STATES.filter(s => s.code !== code).map(s => (
            <Link
              key={s.code}
              to={`/services/state/${s.code}`}
              className="flex items-center gap-3 rounded-xl border border-[#E8EDF5] bg-white p-4 shadow-sm transition hover:border-[#BFDBFE] hover:shadow-md"
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                style={{ backgroundColor: s.color }}
              >
                {s.code}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-[#0A1629]">{s.name}</p>
                <p className="truncate text-xs text-[#94A3B8]">{s.portal}</p>
              </div>
              <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-[#CBD5E1]" />
            </Link>
          ))}
        </div>
      </section>

      {filtered.length === 0 ? (
        <EmptyState
          title="No services found"
          description={
            items.length === 0
              ? 'No state-specific services are configured for this state yet. Run the backend seed or add services in Admin.'
              : 'Try a different search term.'
          }
        />
      ) : (
        Array.from(byCategory.entries()).map(([mainSlug, categoryItems]) => {
          const main = categoryItems[0].main;
          const style = getCatalogIconStyle(main.slug, 0);
          return (
            <section key={mainSlug}>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ServiceIcon icon={style.icon} color={style.iconColor} bg={style.iconBg} size="sm" />
                  <h2 className="font-display text-xl font-bold text-[#0A1629]">{main.name}</h2>
                  <span className="rounded-full bg-[#F1F5F9] px-2.5 py-0.5 text-xs font-medium text-[#64748B]">
                    {categoryItems.length}
                  </span>
                </div>
                <Link
                  to={`/services/category/${main.slug}`}
                  className="text-sm font-semibold text-[#2563EB]"
                >
                  View category
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categoryItems.map(({ main: m, sub }, index) => {
                  const iconStyle = getCatalogIconStyle(m.slug, index);
                  return (
                    <Link
                      key={sub.id}
                      to={buildServiceDetailPath(m.slug, sub.slug, sub, {
                        stateCode: code,
                        stateName: state?.name ?? getStateName(code),
                      })}
                      className="group flex flex-col rounded-2xl border border-[#E8EDF5] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#BFDBFE] hover:shadow-md"
                    >
                      <div className="flex items-start gap-3">
                        <ServiceIcon
                          icon={iconStyle.icon}
                          color={iconStyle.iconColor}
                          bg={iconStyle.iconBg}
                          size="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-[#0A1629] group-hover:text-[#2563EB]">
                            {sub.displayName}
                          </p>
                          <p className="mt-1 line-clamp-2 text-xs text-[#64748B]">
                            {sub.shortDescription ?? sub.description}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-[#94A3B8]">{sub.processingTime ?? '7-15 days'}</span>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB]">
                          Apply <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })
      )}

      <PortalCard className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-[#2563EB]" />
          <p className="text-sm text-[#64748B]">
            All services connect to official state portals configured in Admin · Backend seed.
          </p>
        </div>
        <Link to="/services">
          <Button variant="outline">All Services</Button>
        </Link>
      </PortalCard>
    </div>
  );
}
