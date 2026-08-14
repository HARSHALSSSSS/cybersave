import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ChevronRight, Headphones, Sparkles } from 'lucide-react';
import { BrandWatermark } from '@/components/brand/BrandWatermark';
import {
  FilterPills,
  PortalCard,
  SearchBar,
  SectionHeading,
} from '@/components/ui/portal-primitives';
import { Button } from '@/components/ui/button';
import { ServiceIcon, LoadingBlock, EmptyState } from '@/components/ui/primitives';
import { useRequireAuthNavigate } from '@/features/auth/hooks/useRequireAuth';
import {
  findSubServiceBySlugHints,
  getCatalogIconStyle,
} from '@/lib/catalog';
import { buildServiceDetailPath } from '@/features/services/utils/service-navigation';
import { servicesApi, servicesQueryKeys, type MainServiceCatalogItem } from '@/services/api';
import { FEATURED_STATES } from '@/lib/states';
import { formatDate } from '@/lib/utils';

const FILTER_TAGS = [
  { id: 'all', label: 'All Services' },
  { id: 'popular', label: 'Popular' },
  { id: 'schemes', label: 'Government Schemes' },
  { id: 'new', label: 'New Tags' },
] as const;

type FilterTag = (typeof FILTER_TAGS)[number]['id'];

function matchesFilter(main: MainServiceCatalogItem, sub: MainServiceCatalogItem['subServices'][0], tag: FilterTag) {
  const hay = `${main.name} ${main.slug} ${sub.name} ${sub.slug} ${sub.displayName}`.toLowerCase();
  if (tag === 'all') return true;
  if (tag === 'popular') return true;
  if (tag === 'schemes') return hay.includes('scheme') || hay.includes('pm-') || hay.includes('yojana');
  if (tag === 'new') return hay.includes('new') || hay.includes('update');
  return true;
}

export function ServicesPage() {
  const requireAuthNavigate = useRequireAuthNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const qParam = searchParams.get('q') ?? '';
  const [search, setSearch] = useState(qParam);
  const [tag, setTag] = useState<FilterTag>('all');

  useEffect(() => setSearch(qParam), [qParam]);

  const { data: catalog = [], isLoading, isError } = useQuery({
    queryKey: servicesQueryKeys.catalog(),
    queryFn: () => servicesApi.getServicesCatalog(),
  });

  const allSubs = useMemo(
    () => catalog.flatMap(main => main.subServices.map(sub => ({ main, sub }))),
    [catalog],
  );

  const filteredSubs = useMemo(() => {
    let items = allSubs.filter(({ main, sub }) => matchesFilter(main, sub, tag));
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter(({ main, sub }) => {
        const hay = `${main.name} ${sub.name} ${sub.displayName} ${sub.description ?? ''}`.toLowerCase();
        return hay.includes(q);
      });
    }
    return items;
  }, [allSubs, tag, search]);

  function submitSearch() {
    const q = search.trim();
    if (q) setSearchParams({ q });
    else setSearchParams({});
  }

  const aadhaar = findSubServiceBySlugHints(catalog, ['aadhaar-update', 'aadhaar']);
  const pan = findSubServiceBySlugHints(catalog, ['pan-card', 'pan']);
  const aadhaarPath = aadhaar
    ? buildServiceDetailPath(aadhaar.main.slug, aadhaar.sub.slug, aadhaar.sub)
    : '/services/category/identity-kyc';
  const panPath = pan
    ? buildServiceDetailPath(pan.main.slug, pan.sub.slug, pan.sub)
    : '/services?q=pan';
  const mostUsed = allSubs.slice(0, 6);
  const recentUsed = allSubs.slice(0, 3);
  const newlyAdded = allSubs.slice(-3);

  return (
    <div className="space-y-10 pb-4">
      {/* Hero search */}
      <section className="relative overflow-hidden rounded-3xl border border-[#E8EDF5] bg-[radial-gradient(900px_320px_at_100%_0%,rgba(37,99,235,0.08),transparent_55%),linear-gradient(135deg,#FFFFFF_0%,#F8FBFF_100%)] p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)] sm:p-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-[#0A1629] sm:text-4xl">
          All Government Services
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#64748B] sm:text-base">
          Browse and manage services from various government departments. Search, filter, and apply
          online through one secure portal.
        </p>
        <div className="mt-6 max-w-3xl">
          <SearchBar
            value={search}
            onChange={setSearch}
            onSubmit={submitSearch}
            placeholder="Search for services e.g., Aadhaar, PAN Card, Birth Certificate…"
          />
        </div>
        <div className="mt-4">
          <FilterPills
            options={FILTER_TAGS.map(f => ({ id: f.id, label: f.label }))}
            value={tag}
            onChange={setTag}
          />
        </div>
      </section>

      {/* Browse by State */}
      {!search.trim() && tag === 'all' ? (
        <section>
          <SectionHeading
            title="Browse by State"
            subtitle="Maharashtra, Gujarat, Bihar and more — state-specific certificates & schemes"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURED_STATES.map(s => (
              <Link
                key={s.code}
                to={`/services/state/${s.code}`}
                className="group relative overflow-hidden rounded-2xl border border-[#E8EDF5] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#BFDBFE] hover:shadow-md"
              >
                <div
                  className="absolute inset-x-0 top-0 h-1"
                  style={{ backgroundColor: s.color }}
                />
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                    style={{ backgroundColor: s.color }}
                  >
                    {s.code}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#0A1629] group-hover:text-[#2563EB]">{s.name}</p>
                    <p className="truncate text-xs text-[#94A3B8]">{s.portal}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-5 text-[#64748B]">{s.tagline}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB]">
                  View services <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Featured hubs */}
      {!search.trim() && tag === 'all' ? (
        <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Link
            to={aadhaarPath}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A1629] via-[#1A3B8B] to-[#2563EB] p-8 text-white shadow-lg"
          >
            <p className="text-xs font-semibold tracking-wider text-blue-200 uppercase">Featured Hub</p>
            <h2 className="mt-3 font-display text-2xl font-bold sm:text-3xl">Aadhaar Services Hub</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-blue-100">
              Update address, mobile, biometrics and download your Aadhaar — all through verified
              UIDAI channels.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#2563EB]">
              Get Started Now
            </span>
            <BrandWatermark className="absolute -right-2 -bottom-2 h-36 w-36 sm:h-44 sm:w-44" size={176} />
          </Link>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {[
              {
                title: 'PAN Card Services',
                desc: 'Apply for new PAN or correction online',
                link: panPath,
                icon: 'card' as const,
                color: '#2563EB',
                bg: '#DBEAFE',
                cta: 'Manage Account',
              },
              {
                title: 'Digital Banking & AEPS',
                desc: 'Secure banking and Aadhaar-enabled payments',
                link: '/wallet',
                icon: 'bank' as const,
                color: '#10B981',
                bg: '#D1FAE5',
                cta: 'Open Account now',
              },
            ].map(hub => (
              <Link
                key={hub.title}
                to={hub.link}
                className="flex gap-4 rounded-2xl border border-[#E8EDF5] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <ServiceIcon icon={hub.icon} color={hub.color} bg={hub.bg} size="lg" />
                <div>
                  <h3 className="font-semibold text-[#0A1629]">{hub.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-[#64748B]">{hub.desc}</p>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB]">
                    {hub.cta} <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Browse by category OR search results */}
      <section>
        <SectionHeading
          title={search.trim() ? 'Search Results' : 'Browse by Category'}
          subtitle={
            search.trim()
              ? `${filteredSubs.length} services found`
              : 'Explore services organised by department'
          }
        />
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <LoadingBlock key={i} className="h-44" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState title="Could not load services" description="Ensure the backend is running." />
        ) : search.trim() || tag !== 'all' ? (
          filteredSubs.length === 0 ? (
            <EmptyState title="No services found" description="Try a different search or filter." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSubs.map(({ main, sub }, index) => {
                const style = getCatalogIconStyle(main.slug, index);
                return (
                  <Link
                    key={sub.id}
                    to={buildServiceDetailPath(main.slug, sub.slug, sub)}
                    className="group rounded-2xl border border-[#E8EDF5] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#BFDBFE] hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <ServiceIcon icon={style.icon} color={style.iconColor} bg={style.iconBg} />
                      <span className="rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-[10px] font-bold text-[#2563EB]">
                        {sub.processingTime ?? 'Online'}
                      </span>
                    </div>
                    <h3 className="mt-4 font-semibold text-[#0A1629] group-hover:text-[#2563EB]">
                      {sub.displayName}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-[#64748B]">
                      {sub.shortDescription ?? sub.description ?? 'Apply online through Cybersave.'}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#2563EB]">
                      Apply Now <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                );
              })}
            </div>
          )
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {catalog.map((main, index) => {
              const style = getCatalogIconStyle(main.slug, index);
              return (
                <Link
                  key={main.id}
                  to={`/services/category/${main.slug}`}
                  className="group rounded-2xl border border-[#E8EDF5] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#BFDBFE] hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <ServiceIcon icon={style.icon} color={style.iconColor} bg={style.iconBg} />
                    <span className="rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-[10px] font-bold text-[#2563EB]">
                      {main.subServices.length} Services
                    </span>
                  </div>
                  <h3 className="mt-4 font-semibold text-[#0A1629] group-hover:text-[#2563EB]">
                    {main.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-[#64748B]">
                    {main.description ?? 'Official government services in this category.'}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#2563EB]">
                    Explore Category <ChevronRight className="h-4 w-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Most used */}
      {!search.trim() && tag === 'all' ? (
        <>
          <section>
            <SectionHeading title="Most Used Services" />
            <div className="grid gap-3 sm:grid-cols-2">
              {mostUsed.map(({ main, sub }, index) => {
                const style = getCatalogIconStyle(main.slug, index);
                return (
                  <Link
                    key={sub.id}
                    to={buildServiceDetailPath(main.slug, sub.slug, sub)}
                    className="flex items-center gap-4 rounded-xl border border-[#E8EDF5] bg-white p-4 shadow-sm transition hover:bg-[#F8FAFC]"
                  >
                    <ServiceIcon icon={style.icon} color={style.iconColor} bg={style.iconBg} size="sm" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold tracking-wide text-[#94A3B8] uppercase">
                        {main.name}
                      </span>
                      <p className="truncate font-semibold text-[#0A1629]">{sub.displayName}</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-[#2563EB]">Apply Now →</span>
                  </Link>
                );
              })}
            </div>
          </section>

          <section>
            <SectionHeading title="Your Recent Services" />
            <PortalCard padding="none" className="divide-y divide-[#F1F5F9]">
              {recentUsed.map(({ main, sub }, index) => (
                <div key={sub.id} className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
                  <div className="flex items-center gap-3">
                    <ServiceIcon
                      icon={getCatalogIconStyle(main.slug, index).icon}
                      color={getCatalogIconStyle(main.slug, index).iconColor}
                      bg={getCatalogIconStyle(main.slug, index).iconBg}
                      size="sm"
                    />
                    <div>
                      <p className="font-semibold text-[#0A1629]">{sub.displayName}</p>
                      <p className="text-xs text-[#94A3B8]">Last used {formatDate(new Date().toISOString())}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      requireAuthNavigate(buildServiceDetailPath(main.slug, sub.slug, sub), {
                        requireProfile: true,
                      })
                    }
                  >
                    Resume
                  </Button>
                </div>
              ))}
            </PortalCard>
          </section>

          <section>
            <SectionHeading title="Newly Added Services" />
            <div className="grid gap-4 sm:grid-cols-3">
              {newlyAdded.map(({ main, sub }, i) => (
                <Link
                  key={sub.id}
                  to={buildServiceDetailPath(main.slug, sub.slug, sub)}
                  className="rounded-2xl border border-[#E8EDF5] bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      i === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {i === 0 ? 'New Service' : 'Updated Service'}
                  </span>
                  <h3 className="mt-3 font-semibold text-[#0A1629]">{sub.displayName}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-[#64748B]">
                    {sub.shortDescription ?? sub.description}
                  </p>
                  <span className="mt-3 inline-flex text-sm font-semibold text-[#2563EB]">
                    Apply Now →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </>
      ) : null}

      {/* Help CTAs */}
      <section className="grid gap-4 lg:grid-cols-2">
        <PortalCard className="border-emerald-100 bg-gradient-to-br from-[#ECFDF5] to-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Sparkles className="h-6 w-6 text-emerald-600" />
              <h3 className="mt-3 font-display text-lg font-bold text-[#0A1629]">
                Intelligent Service Guide
              </h3>
              <p className="mt-2 text-sm text-[#64748B]">
                Not sure which service you need? Our step-by-step guide helps you find the right
                application.
              </p>
              <Link to="/help" className="mt-4 inline-block">
                <Button>Start the Guide</Button>
              </Link>
            </div>
            <BrandWatermark className="hidden sm:block" size={80} />
          </div>
        </PortalCard>

        <PortalCard className="border-[#DBEAFE] bg-gradient-to-br from-[#EFF6FF] to-white">
          <Headphones className="h-6 w-6 text-[#2563EB]" />
          <h3 className="mt-3 font-display text-lg font-bold text-[#0A1629]">
            Can&apos;t find what you&apos;re looking for?
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/help">
              <Button size="sm">Get Chat Support</Button>
            </Link>
            <Link to="/help">
              <Button size="sm" variant="outline">
                Visit nearest CSC Center
              </Button>
            </Link>
            <a href="tel:1800111255">
              <Button size="sm" variant="outline">
                1800-111-255
              </Button>
            </a>
          </div>
        </PortalCard>
      </section>
    </div>
  );
}
