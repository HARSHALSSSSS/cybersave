import { useMemo } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronRight,
  FileText,
  FolderOpen,
  Grid3X3,
  Wallet,
  Zap,
} from 'lucide-react';
import {
  applicationsApi,
  applicationsQueryKeys,
  billPaymentsApi,
  billPaymentsQueryKeys,
  paymentsApi,
  paymentsQueryKeys,
  profileApi,
  profileQueryKeys,
  servicesApi,
  servicesQueryKeys,
  type ApplicationListItem,
  type BackendApplicationStatus,
} from '@/services/api';
import { Button } from '@/components/ui/button';
import { HERO_SHIELD_SRC } from '@/components/brand/brand-assets';
import { GOVERNMENT_SCHEMES, getSchemeHref, isSchemeExternal } from '@/lib/government-schemes';
import { ServiceIcon, LoadingBlock } from '@/components/ui/primitives';
import {
  buildApplyUrl,
  defaultApplyStepForStatus,
  isDraftStatus,
} from '@/features/apply/utils/apply-flow';
import { useRequireAuthNavigate } from '@/features/auth/hooks/useRequireAuth';
import { useAuthModalStore } from '@/features/auth/store/auth-modal.store';
import { useAuthStore } from '@/features/auth/store/auth.store';
import {
  countApplicationsByStatus,
  findFeaturedApplication,
  getApplicationProgress,
  getStatusChipTone,
} from '@/features/home/utils/home-utils';
import { findSubServiceBySlugHints, getCatalogIconStyle } from '@/lib/catalog';
import { buildServiceDetailPath } from '@/features/services/utils/service-navigation';
import { getProfileGreetingName } from '@/lib/profile';
import { formatCurrency, formatDate, cn } from '@/lib/utils';

const QUICK_SERVICE_CARDS = [
  {
    id: 'aadhaar',
    title: 'Aadhaar Services',
    description: 'Update, download & verify your Aadhaar details online.',
    hints: ['aadhaar-update', 'aadhaar'],
    icon: 'shield' as const,
    color: '#2563EB',
    bg: '#DBEAFE',
    popular: true,
  },
  {
    id: 'pan',
    title: 'PAN Card',
    description: 'Apply for new PAN or update existing details.',
    hints: ['pan-card', 'pan'],
    icon: 'card' as const,
    color: '#10B981',
    bg: '#D1FAE5',
  },
  {
    id: 'certificates',
    title: 'Certificates',
    description: 'Income, caste, domicile & official certificates.',
    categorySlug: 'certificates',
    icon: 'badge' as const,
    color: '#8B5CF6',
    bg: '#EDE9FE',
  },
  {
    id: 'bills',
    title: 'Bill Payments',
    description: 'Pay electricity, mobile, DTH & utility bills.',
    to: '/pay-bills',
    icon: 'bill' as const,
    color: '#F59E0B',
    bg: '#FEF3C7',
    protected: true,
  },
  {
    id: 'banking',
    title: 'Banking / CSC',
    description: 'Wallet, settlements & citizen service centre.',
    to: '/wallet',
    icon: 'bank' as const,
    color: '#EF4444',
    bg: '#FEE2E2',
    protected: true,
  },
  {
    id: 'insurance',
    title: 'Insurance',
    description: 'PM insurance plans & government schemes.',
    to: '/schemes',
    icon: 'umbrella' as const,
    color: '#0EA5E9',
    bg: '#E0F2FE',
  },
] as const;

const PIPELINE_STEPS = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'documents', label: 'Documents Verified' },
  { key: 'review', label: 'Under Review' },
  { key: 'approved', label: 'Approved' },
  { key: 'completed', label: 'Completed' },
] as const;

function pipelineStepIndex(status: BackendApplicationStatus): number {
  if (['DRAFT', 'FORM_IN_PROGRESS'].includes(status)) return 0;
  if (status === 'DOCUMENTS_PENDING') return 1;
  if (['SUBMITTED', 'UNDER_REVIEW', 'PROCESSING', 'ACTION_REQUIRED', 'PAYMENT_PENDING'].includes(status))
    return 2;
  if (status === 'APPROVED') return 3;
  if (status === 'COMPLETED') return 4;
  return 0;
}

function SectionShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8', className)}>
      {children}
    </section>
  );
}

function VerificationPipeline({ app }: { app: ApplicationListItem }) {
  const active = pipelineStepIndex(app.status);

  return (
    <div className="mt-8 rounded-2xl border border-[#E8EDF5] bg-white p-6 shadow-sm">
      <p className="text-[11px] font-bold tracking-[0.12em] text-[#94A3B8] uppercase">
        Live Verification Pipeline
      </p>
      <ol className="mt-6 grid gap-6 sm:grid-cols-5">
        {PIPELINE_STEPS.map((step, index) => {
          const done = index < active;
          const current = index === active;
          return (
            <li key={step.key} className="relative flex flex-col items-center text-center">
              {index < PIPELINE_STEPS.length - 1 ? (
                <span
                  className={cn(
                    'absolute top-5 left-[calc(50%+20px)] hidden h-0.5 w-[calc(100%-40px)] sm:block',
                    done ? 'bg-[#2563EB]' : 'bg-[#E8EDF5]',
                  )}
                />
              ) : null}
              <span
                className={cn(
                  'relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold',
                  done
                    ? 'bg-[#2563EB] text-white'
                    : current
                      ? 'bg-[#2563EB] text-white ring-4 ring-[#DBEAFE]'
                      : 'bg-[#F1F5F9] text-[#94A3B8]',
                )}
              >
                {done ? <Check className="h-5 w-5" /> : index + 1}
              </span>
              <p
                className={cn(
                  'mt-3 text-sm font-semibold',
                  current ? 'text-[#2563EB]' : 'text-[#0A1629]',
                )}
              >
                {step.label}
              </p>
              {current && app.status === 'UNDER_REVIEW' ? (
                <p className="mt-1 text-xs text-[#64748B]">Processing at Tehsil / Sub-Division</p>
              ) : null}
              {done ? (
                <p className="mt-1 text-xs text-[#94A3B8]">{formatDate(app.updatedAt)}</p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function HomePage() {
  const citizen = useAuthStore(s => s.citizen);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const openLogin = useAuthModalStore(s => s.openLogin);
  const requireAuthNavigate = useRequireAuthNavigate();
  const greetingName = getProfileGreetingName(citizen);

  const { data: catalog = [], isLoading: catalogLoading } = useQuery({
    queryKey: servicesQueryKeys.catalog(),
    queryFn: () => servicesApi.getServicesCatalog(),
  });

  const { data: appsData, isLoading: appsLoading } = useQuery({
    queryKey: applicationsQueryKeys.list(1),
    queryFn: () => applicationsApi.listApplications({ page: 1, limit: 20 }),
    enabled: isAuthenticated,
  });

  const { data: documents = [] } = useQuery({
    queryKey: profileQueryKeys.documents(),
    queryFn: () => profileApi.listSavedDocuments(),
    enabled: isAuthenticated,
  });

  const { data: billHistory } = useQuery({
    queryKey: billPaymentsQueryKeys.history('all', 1),
    queryFn: () => billPaymentsApi.getBillPaymentHistory({ page: 1, limit: 10 }),
    enabled: isAuthenticated,
    staleTime: 0,
  });

  const { data: servicePayments = [] } = useQuery({
    queryKey: paymentsQueryKeys.list(),
    queryFn: () => paymentsApi.listCitizenPayments(),
    enabled: isAuthenticated,
    staleTime: 0,
  });

  const apps = appsData?.data ?? [];
  const stats = useMemo(() => countApplicationsByStatus(apps), [apps]);
  const featured = findFeaturedApplication(apps);
  const otherApps = apps.filter(a => a.id !== featured?.id).slice(0, 3);

  const dashboardTransactions = useMemo(() => {
    const bills = (billHistory?.data ?? []).map(tx => ({
      id: `bill-${tx.id}`,
      title: tx.biller.name,
      amount: tx.totalAmount,
      createdAt: tx.paidAt ?? tx.createdAt,
      status: tx.status,
    }));
    const services = servicePayments.map(tx => ({
      id: `svc-${tx.id}`,
      title: tx.serviceName,
      amount: tx.amount,
      createdAt: tx.createdAt,
      status: tx.status === 'CAPTURED' ? 'success' : tx.status.toLowerCase(),
    }));
    return [...bills, ...services].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [billHistory, servicePayments]);

  const paymentsThisMonth = useMemo(() => {
    const now = new Date();
    return dashboardTransactions
      .filter(tx => {
        const d = new Date(tx.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [dashboardTransactions]);

  const totalSpent = useMemo(
    () => dashboardTransactions.reduce((sum, tx) => sum + tx.amount, 0),
    [dashboardTransactions],
  );

  const weekBars = useMemo(() => {
    const now = new Date();
    const totals = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - i));
      return dashboardTransactions
        .filter(tx => {
          const d = new Date(tx.createdAt);
          return (
            d.getFullYear() === day.getFullYear() &&
            d.getMonth() === day.getMonth() &&
            d.getDate() === day.getDate()
          );
        })
        .reduce((sum, tx) => sum + tx.amount, 0);
    });
    const max = Math.max(...totals, 0);
    if (max <= 0) return [20, 20, 20, 20, 20, 20, 20];
    return totals.map(value => Math.max(12, Math.round((value / max) * 100)));
  }, [dashboardTransactions]);

  function resolveQuickCardHref(card: (typeof QUICK_SERVICE_CARDS)[number]) {
    if ('to' in card && card.to) return card.to;
    if ('categorySlug' in card && card.categorySlug) {
      return `/services/category/${card.categorySlug}`;
    }
    if ('hints' in card && card.hints) {
      const match = findSubServiceBySlugHints(catalog, [...card.hints]);
      if (match) return buildServiceDetailPath(match.main.slug, match.sub.slug, match.sub);
    }
    return '/services';
  }

  return (
    <div className="overflow-x-hidden pb-12">
      {/* Hero */}
      <section className="border-b border-[#E8EDF5] bg-gradient-to-b from-[#F8FAFC] to-white">
        <SectionShell className="grid items-center gap-10 py-10 lg:grid-cols-[1fr_480px] lg:gap-12 lg:py-14">
          <div className="min-w-0">
            {isAuthenticated && greetingName ? (
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wide text-[#2563EB] uppercase">
                <span>Welcome back, {greetingName}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 normal-case">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Aadhaar Verified
                </span>
              </div>
            ) : (
              <p className="text-xs font-semibold tracking-wide text-[#2563EB] uppercase">
                Government & Personal Services
              </p>
            )}

            <h1 className="font-display mt-4 text-[2rem] leading-[1.15] font-bold text-[#0A1629] sm:text-[2.75rem] lg:text-[3rem]">
              Everything Government.
              <br />
              <span className="text-[#2563EB]">One Secure Place.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-[#64748B]">
              Access all your digital Indian services, certificates, and government locker documents
              in one secure portal. Apply, track, and pay — all from one dashboard.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/services">
                <Button
                  size="lg"
                  className="h-12 rounded-xl px-6 shadow-[0_4px_14px_rgba(37,99,235,0.28)]"
                >
                  Explore Services
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-xl border-[#E2E8F0] bg-white px-6"
                onClick={() =>
                  isAuthenticated
                    ? requireAuthNavigate('/applications', { requireProfile: true })
                    : openLogin({ redirectTo: '/applications', requireProfile: true })
                }
              >
                Track Application
              </Button>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <img
              src={HERO_SHIELD_SRC}
              alt=""
              width={480}
              height={380}
              draggable={false}
              className="h-auto w-full max-w-[480px] object-contain object-center drop-shadow-[0_20px_50px_rgba(37,99,235,0.15)]"
            />
          </div>
        </SectionShell>
      </section>

      {/* Stats */}
      <SectionShell className="-mt-1 pt-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: 'Active Applications',
              value: isAuthenticated ? String(stats.inProgress).padStart(2, '0') : '—',
              icon: FileText,
              tone: 'bg-[#EFF6FF] text-[#2563EB]',
              to: '/applications',
            },
            {
              label: 'Stored Documents',
              value: isAuthenticated ? String(documents.length).padStart(2, '0') : '—',
              icon: FolderOpen,
              tone: 'bg-[#E0F2FE] text-[#0EA5E9]',
              to: '/documents',
            },
            {
              label: 'Payments This Month',
              value: isAuthenticated ? formatCurrency(paymentsThisMonth) : '—',
              icon: Wallet,
              tone: 'bg-[#FEF3C7] text-[#D97706]',
              to: '/wallet',
            },
            {
              label: 'Services Completed',
              value: isAuthenticated ? String(stats.completed).padStart(2, '0') : '—',
              icon: Grid3X3,
              tone: 'bg-[#ECFDF5] text-[#059669]',
              to: '/services',
            },
          ].map(stat => {
            const Icon = stat.icon;
            const isPublic = stat.to === '/services';
            const inner = (
              <>
                <span className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', stat.tone)}>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-2xl font-bold text-[#0A1629]">{stat.value}</p>
                  <p className="text-sm text-[#64748B]">{stat.label}</p>
                </div>
              </>
            );
            return isPublic ? (
              <Link
                key={stat.label}
                to={stat.to}
                className="flex min-h-[96px] items-center gap-4 rounded-2xl border border-[#E8EDF5] bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                {inner}
              </Link>
            ) : (
              <button
                key={stat.label}
                type="button"
                onClick={() => requireAuthNavigate(stat.to, { requireProfile: true })}
                className="flex min-h-[96px] w-full items-center gap-4 rounded-2xl border border-[#E8EDF5] bg-white p-5 text-left shadow-sm transition hover:shadow-md"
              >
                {inner}
              </button>
            );
          })}
        </div>
      </SectionShell>

      {/* Quick services — horizontal scroll, full cards */}
      <SectionShell className="mt-14">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-bold text-[#0A1629]">
            How can we help you today?
          </h2>
          <Link
            to="/services"
            className="shrink-0 text-sm font-semibold text-[#2563EB] hover:underline"
          >
            View All Services
          </Link>
        </div>

        {catalogLoading ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <LoadingBlock key={i} className="h-[200px] min-w-[240px] shrink-0 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {QUICK_SERVICE_CARDS.map(card => {
              const href = resolveQuickCardHref(card);
              const isProtected = 'protected' in card && card.protected;
              const isPopular = 'popular' in card && card.popular;
              const body = (
                <article
                  className={cn(
                    'relative flex h-full min-h-[200px] min-w-[240px] max-w-[260px] shrink-0 flex-col rounded-2xl p-5 transition',
                    isPopular
                      ? 'bg-[#2563EB] text-white shadow-[0_8px_30px_rgba(37,99,235,0.35)]'
                      : 'border border-[#E8EDF5] bg-white shadow-sm hover:shadow-md',
                  )}
                >
                  {isPopular ? (
                    <span className="absolute top-4 right-4 rounded-full bg-[#F59E0B] px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                      Popular
                    </span>
                  ) : null}
                  <ServiceIcon
                    icon={card.icon}
                    color={isPopular ? '#2563EB' : card.color}
                    bg={isPopular ? '#FFFFFF' : card.bg}
                    size="lg"
                  />
                  <h3
                    className={cn(
                      'mt-4 text-lg font-bold',
                      isPopular ? 'text-white' : 'text-[#0A1629]',
                    )}
                  >
                    {card.title}
                  </h3>
                  <p
                    className={cn(
                      'mt-2 flex-1 text-sm leading-6',
                      isPopular ? 'text-blue-100' : 'text-[#64748B]',
                    )}
                  >
                    {card.description}
                  </p>
                  <span
                    className={cn(
                      'mt-4 inline-flex items-center gap-1 text-sm font-semibold',
                      isPopular ? 'text-white' : 'text-[#2563EB]',
                    )}
                  >
                    {isPopular ? 'Get Started' : 'Open Service'}
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </article>
              );

              if (isProtected) {
                return (
                  <button
                    key={card.id}
                    type="button"
                    className="shrink-0 text-left"
                    onClick={() => requireAuthNavigate(href, { requireProfile: true })}
                  >
                    {body}
                  </button>
                );
              }

              return (
                <Link key={card.id} to={href} className="shrink-0">
                  {body}
                </Link>
              );
            })}
          </div>
        )}
      </SectionShell>

      {/* Applications */}
      <SectionShell className="mt-14">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="font-display text-2xl font-bold text-[#0A1629]">Your Applications</h2>
          {isAuthenticated ? (
            <Link to="/applications" className="text-sm font-semibold text-[#2563EB]">
              View all
            </Link>
          ) : (
            <button
              type="button"
              className="text-sm font-semibold text-[#2563EB]"
              onClick={() => openLogin({ redirectTo: '/applications', requireProfile: true })}
            >
              Sign in to view
            </button>
          )}
        </div>

        {!isAuthenticated ? (
          <article className="rounded-2xl border border-dashed border-[#E8EDF5] bg-white p-10 text-center">
            <FileText className="mx-auto h-10 w-10 text-[#CBD5E1]" />
            <p className="mt-4 font-semibold text-[#0A1629]">Sign in to track your applications</p>
            <Button className="mt-4" onClick={() => openLogin({ requireProfile: true })}>
              Login with OTP
            </Button>
          </article>
        ) : appsLoading ? (
          <LoadingBlock className="h-72 rounded-2xl" />
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
              {featured ? (
                <article className="rounded-2xl border border-[#E8EDF5] bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-[#94A3B8]">
                        Updated {formatDate(featured.updatedAt)}
                      </p>
                      <h3 className="mt-2 text-xl font-bold text-[#0A1629]">
                        {featured.serviceVersion.overview?.displayName ??
                          featured.serviceVersion.subService.name}
                      </h3>
                    </div>
                    <span
                      className={cn(
                        'rounded-full px-3 py-1 text-[11px] font-bold tracking-wide uppercase',
                        getStatusChipTone(featured.status),
                      )}
                    >
                      {featured.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="mt-6">
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="font-medium text-[#64748B]">Verification Progress</span>
                      <span className="font-bold text-[#2563EB]">
                        {getApplicationProgress(featured.status)}%
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-[#E8EDF5]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#60A5FA]"
                        style={{ width: `${getApplicationProgress(featured.status)}%` }}
                      />
                    </div>
                    <p className="mt-3 text-xs text-[#64748B]">
                      Expected completion: processing timeline varies by department
                    </p>
                  </div>

                  <Link
                    to={
                      isDraftStatus(featured.status)
                        ? buildApplyUrl(
                            featured.serviceVersion.subService.mainService.slug,
                            featured.serviceVersion.subService.slug,
                            featured.id,
                            defaultApplyStepForStatus(featured.status),
                          )
                        : `/applications/${featured.id}`
                    }
                    className="mt-6 inline-block"
                  >
                    <Button size="lg" className="h-12 w-full rounded-xl sm:w-auto">
                      Track Detailed Application
                    </Button>
                  </Link>
                </article>
              ) : (
                <article className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E8EDF5] bg-white p-10 text-center">
                  <p className="font-semibold text-[#0A1629]">No active applications</p>
                  <Link to="/services" className="mt-4">
                    <Button>Browse Services</Button>
                  </Link>
                </article>
              )}

              <aside className="rounded-2xl border border-[#E8EDF5] bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-[#64748B]">Other Applications</h3>
                <ul className="mt-4 space-y-0 divide-y divide-[#F1F5F9]">
                  {otherApps.length === 0 ? (
                    <li className="py-6 text-sm text-[#94A3B8]">No other applications yet</li>
                  ) : (
                    otherApps.map(app => (
                      <li key={app.id}>
                        <Link
                          to={`/applications/${app.id}`}
                          className="flex items-start justify-between gap-3 py-4 transition hover:opacity-80"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#0A1629]">
                              {app.serviceVersion.overview?.displayName ??
                                app.serviceVersion.subService.name}
                            </p>
                            <p className="mt-0.5 text-xs text-[#94A3B8]">
                              {formatDate(app.updatedAt)}
                            </p>
                          </div>
                          <span
                            className={cn(
                              'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
                              getStatusChipTone(app.status),
                            )}
                          >
                            {app.status.replace(/_/g, ' ')}
                          </span>
                        </Link>
                      </li>
                    ))
                  )}
                </ul>
              </aside>
            </div>

            {featured ? <VerificationPipeline app={featured} /> : null}
          </>
        )}
      </SectionShell>

      {/* Explore services banner row */}
      <SectionShell className="mt-14">
        <h2 className="font-display mb-5 text-2xl font-bold text-[#0A1629]">
          Explore Cybersave Services
        </h2>
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr]">
          <Link
            to="/services/category/certificates"
            className="flex min-h-[220px] flex-col justify-between rounded-2xl bg-gradient-to-br from-[#0A1629] to-[#1A3B8B] p-6 text-white lg:row-span-1"
          >
            <div>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 uppercase">
                Government Certificates
              </span>
              <h3 className="mt-4 text-2xl font-bold">Get Certified Instantly</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-[#94A3B8]">
                Income, caste, domicile and official certificates through verified state portals.
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-semibold">
              Apply Now <ArrowRight className="h-4 w-4" />
            </span>
          </Link>

          {catalog.slice(0, 2).map((main, index) => {
            const style = getCatalogIconStyle(main.slug, index);
            const sub = main.subServices[0];
            const href = sub
              ? buildServiceDetailPath(main.slug, sub.slug, sub)
              : `/services/category/${main.slug}`;
            return (
              <Link
                key={main.id}
                to={href}
                className="flex min-h-[220px] flex-col rounded-2xl border border-[#E8EDF5] bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <ServiceIcon icon={style.icon} color={style.iconColor} bg={style.iconBg} size="lg" />
                <h3 className="mt-4 text-lg font-bold text-[#0A1629]">{main.name}</h3>
                <p className="mt-2 flex-1 text-sm text-[#64748B]">
                  {main.description ?? `${main.subServices.length} services available`}
                </p>
                <span className="mt-4 text-sm font-semibold text-[#2563EB]">Open Service →</span>
              </Link>
            );
          })}
        </div>
      </SectionShell>

      {/* Government schemes */}
      <SectionShell className="mt-14">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="font-display text-2xl font-bold text-[#0A1629]">
            Benefits You May Be Eligible For
          </h2>
          <Link to="/schemes" className="text-sm font-semibold text-[#2563EB]">
            Check My Eligibility
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {GOVERNMENT_SCHEMES.slice(0, 3).map(scheme => {
            const href = getSchemeHref(scheme);
            const external = isSchemeExternal(scheme);
            const card = (
              <>
                <div className="border-b border-[#E8EDF5] bg-gradient-to-br from-[#EFF6FF] to-white px-5 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold tracking-wide text-[#64748B] uppercase">
                      {scheme.ministry}
                    </span>
                    {scheme.matchLabel ? (
                      <span className="rounded-full bg-[#2563EB] px-2 py-0.5 text-[10px] font-bold text-white">
                        {scheme.matchLabel}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-[#0A1629]">{scheme.name}</h3>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="rounded-xl bg-[#F1F5F9] px-3 py-2 text-sm leading-6 text-[#334155]">
                    {scheme.benefit}
                  </p>
                  <span className="mt-4 inline-flex text-sm font-semibold text-[#2563EB]">
                    View Scheme Guidelines →
                  </span>
                </div>
              </>
            );

            return external ? (
              <a
                key={scheme.id}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col overflow-hidden rounded-2xl border border-[#E8EDF5] bg-white shadow-sm transition hover:shadow-md"
              >
                {card}
              </a>
            ) : (
              <Link
                key={scheme.id}
                to={href}
                className="flex flex-col overflow-hidden rounded-2xl border border-[#E8EDF5] bg-white shadow-sm transition hover:shadow-md"
              >
                {card}
              </Link>
            );
          })}
        </div>
      </SectionShell>

      {/* Payments summary */}
      <SectionShell className="mt-14">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="font-display text-2xl font-bold text-[#0A1629]">Your Payments</h2>
          <button
            type="button"
            className="text-sm font-semibold text-[#2563EB]"
            onClick={() => requireAuthNavigate('/wallet', { requireProfile: true })}
          >
            View All Transactions
          </button>
        </div>

        {!isAuthenticated ? (
          <article className="rounded-2xl border border-dashed border-[#E8EDF5] bg-white p-10 text-center">
            <Wallet className="mx-auto h-10 w-10 text-[#CBD5E1]" />
            <p className="mt-4 font-semibold text-[#0A1629]">Sign in to view payment history</p>
            <Button
              className="mt-4"
              onClick={() => requireAuthNavigate('/pay-bills', { requireProfile: true })}
            >
              <Zap className="mr-2 h-4 w-4" />
              Pay Bills
            </Button>
          </article>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <article className="rounded-2xl border border-[#E8EDF5] bg-white p-6 shadow-sm">
              <p className="text-sm text-[#64748B]">Total Amount Spent</p>
              <p className="mt-1 text-3xl font-bold text-[#0A1629]">
                {formatCurrency(totalSpent)}
              </p>
              <div className="mt-6 flex h-28 items-end gap-2">
                {weekBars.map((h, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex-1 rounded-t-md',
                      i === 6 ? 'bg-[#2563EB]' : 'bg-[#DBEAFE]',
                    )}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-[#E8EDF5] bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-[#0A1629]">Recent Transactions</h3>
              <ul className="mt-4 divide-y divide-[#F1F5F9]">
                {dashboardTransactions.length === 0 ? (
                  <li className="py-6 text-sm text-[#94A3B8]">No transactions yet</li>
                ) : (
                  dashboardTransactions.slice(0, 4).map(tx => (
                    <li key={tx.id} className="flex items-center justify-between gap-3 py-3.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[#0A1629]">
                          {tx.title}
                        </p>
                        <p className="text-xs text-[#94A3B8]">{formatDate(tx.createdAt)}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold">{formatCurrency(tx.amount)}</p>
                        <span
                          className={cn(
                            'text-[10px] font-bold uppercase',
                            tx.status === 'success' ? 'text-emerald-600' : 'text-amber-600',
                          )}
                        >
                          {tx.status}
                        </span>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </article>
          </div>
        )}
      </SectionShell>

      {/* Security strip */}
      <SectionShell className="mt-14">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-100 bg-[#ECFDF5] px-6 py-5">
          <div className="flex items-center gap-3">
            <BadgeCheck className="h-6 w-6 shrink-0 text-emerald-600" />
            <p className="text-sm font-medium text-[#0A1629] sm:text-base">
              Your documents are encrypted and protected using government locker standards.
            </p>
          </div>
          <Link to="/help">
            <Button variant="outline" size="sm" className="border-emerald-200 bg-white">
              Learn More
            </Button>
          </Link>
        </div>
      </SectionShell>
    </div>
  );
}
