import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileText,
  FolderLock,
  Headphones,
  Phone,
  Plus,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  FilterPills,
  PortalCard,
  ProgressBar,
  SectionHeading,
  StatusPill,
} from '@/components/ui/portal-primitives';
import { Button } from '@/components/ui/button';
import { LoadingBlock, EmptyState } from '@/components/ui/primitives';
import {
  buildApplyUrl,
  defaultApplyStepForStatus,
  isDraftStatus,
} from '@/features/apply/utils/apply-flow';
import {
  findFeaturedApplication,
  getApplicationProgress,
} from '@/features/home/utils/home-utils';
import {
  applicationsApi,
  applicationsQueryKeys,
  type ApplicationListItem,
  type BackendApplicationStatus,
} from '@/services/api';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

type FilterTab = 'all' | 'in_progress' | 'action_required' | 'completed' | 'drafts';

const IN_PROGRESS: BackendApplicationStatus[] = [
  'DRAFT', 'FORM_IN_PROGRESS', 'DOCUMENTS_PENDING', 'PAYMENT_PENDING',
  'SUBMITTED', 'UNDER_REVIEW', 'PROCESSING',
];
const COMPLETED: BackendApplicationStatus[] = ['APPROVED', 'COMPLETED'];

function statusTone(status: BackendApplicationStatus) {
  if (COMPLETED.includes(status)) return 'green' as const;
  if (status === 'ACTION_REQUIRED') return 'amber' as const;
  if (status === 'REJECTED' || status === 'CANCELLED') return 'red' as const;
  if (status === 'PAYMENT_PENDING') return 'amber' as const;
  return 'blue' as const;
}

function statusLabel(status: BackendApplicationStatus) {
  if (status === 'ACTION_REQUIRED') return 'Action Required';
  if (status === 'PAYMENT_PENDING') return 'Payment Needed';
  if (COMPLETED.includes(status)) return 'Approved';
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function filterApps(apps: ApplicationListItem[], tab: FilterTab, search: string) {
  let result = apps;
  if (tab === 'in_progress') result = result.filter(a => IN_PROGRESS.includes(a.status) && a.status !== 'DRAFT');
  if (tab === 'action_required') result = result.filter(a => a.status === 'ACTION_REQUIRED' || a.status === 'PAYMENT_PENDING');
  if (tab === 'completed') result = result.filter(a => COMPLETED.includes(a.status));
  if (tab === 'drafts') result = result.filter(a => isDraftStatus(a.status));
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    result = result.filter(a => {
      const title = a.serviceVersion.overview?.displayName ?? a.serviceVersion.subService.name;
      const ref = a.publicRef ?? a.id;
      return title.toLowerCase().includes(q) || ref.toLowerCase().includes(q);
    });
  }
  return result;
}

export function ApplicationsPage() {
  const [tab, setTab] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: applicationsQueryKeys.list(1),
    queryFn: () => applicationsApi.listApplications({ page: 1, limit: 50 }),
  });

  const apps = data?.data ?? [];

  const counts = useMemo(() => ({
    all: apps.length,
    in_progress: apps.filter(a => IN_PROGRESS.includes(a.status) && a.status !== 'DRAFT').length,
    action_required: apps.filter(a => a.status === 'ACTION_REQUIRED' || a.status === 'PAYMENT_PENDING').length,
    completed: apps.filter(a => COMPLETED.includes(a.status)).length,
    drafts: apps.filter(a => isDraftStatus(a.status)).length,
  }), [apps]);

  const featured = findFeaturedApplication(apps);
  const filtered = filterApps(apps, tab, search);
  const activeApps = filtered.filter(a => !COMPLETED.includes(a.status) && !isDraftStatus(a.status));
  const completedApps = filtered.filter(a => COMPLETED.includes(a.status));
  const actionAlert = apps.find(a => a.status === 'ACTION_REQUIRED');

  return (
    <div className="space-y-8 pb-4">
      {/* Hero */}
      <section className="rounded-2xl border border-[#E8EDF5] bg-gradient-to-br from-[#F8FAFC] to-white p-6 sm:p-8">
        <p className="text-xs font-bold tracking-wider text-[#2563EB] uppercase">
          My Dashboard › Your Service Applications
        </p>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-xl">
            <h1 className="font-display text-3xl font-bold text-[#0A1629] sm:text-4xl">
              Your Applications
            </h1>
            <p className="mt-3 text-sm leading-7 text-[#64748B]">
              Track, manage, and resume all your government service applications in one secure
              dashboard.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/services">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Start New Application
                </Button>
              </Link>
              <Link to="/services">
                <Button variant="outline">Explore Services</Button>
              </Link>
            </div>
          </div>
          <div className="hidden rounded-2xl border border-[#DBEAFE] bg-[#EFF6FF] p-6 sm:block">
            <FolderLock className="h-12 w-12 text-[#2563EB]" />
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Applications', value: counts.all, color: 'text-[#2563EB] bg-[#EFF6FF]' },
            { label: 'In-Progress', value: counts.in_progress, color: 'text-[#0EA5E9] bg-[#E0F2FE]' },
            { label: 'Completed', value: counts.completed, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Action Required', value: counts.action_required, color: 'text-amber-600 bg-amber-50' },
          ].map(stat => (
            <div key={stat.label} className="rounded-xl border border-[#E8EDF5] bg-white p-4">
              <p className={cn('inline-flex rounded-lg px-2 py-1 text-2xl font-bold', stat.color.split(' ')[0])}>
                {String(stat.value).padStart(2, '0')}
              </p>
              <p className="mt-1 text-sm text-[#64748B]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {actionAlert ? (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
            <p className="text-sm text-[#0A1629]">
              <strong>1 application needs your attention.</strong>{' '}
              Action required for{' '}
              {actionAlert.serviceVersion.overview?.displayName ??
                actionAlert.serviceVersion.subService.name}
              .
            </p>
          </div>
          <Link to={`/applications/${actionAlert.id}`}>
            <Button size="sm" variant="outline">
              Correct Now
            </Button>
          </Link>
        </div>
      ) : null}

      {/* Search & filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search application by service or application ID…"
            className="h-12 w-full rounded-xl border border-[#E2E8F0] bg-white pl-11 pr-4 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
          />
        </div>
        <FilterPills
          options={[
            { id: 'all' as const, label: 'All', count: counts.all },
            { id: 'in_progress' as const, label: 'In Progress', count: counts.in_progress },
            { id: 'action_required' as const, label: 'Action Required', count: counts.action_required },
            { id: 'completed' as const, label: 'Completed', count: counts.completed },
            { id: 'drafts' as const, label: 'Drafts', count: counts.drafts },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      {isLoading ? (
        <LoadingBlock className="h-64" />
      ) : isError ? (
        <EmptyState title="Could not load applications" description="Ensure backend is running." />
      ) : apps.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description="Browse services and start your first application."
        />
      ) : (
        <>
          {/* Featured card */}
          {featured && tab === 'all' && !search.trim() ? (
            <PortalCard className="border-[#BFDBFE] bg-gradient-to-br from-[#EFF6FF]/80 to-white">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <StatusPill tone="blue">In Progress</StatusPill>
                  <h2 className="mt-3 text-xl font-bold text-[#0A1629]">
                    {featured.serviceVersion.overview?.displayName ??
                      featured.serviceVersion.subService.name}
                  </h2>
                  <p className="mt-1 text-sm text-[#64748B]">
                    Application ID: {featured.publicRef ?? featured.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <span className="text-sm font-bold text-[#2563EB]">
                  {getApplicationProgress(featured.status)}%
                </span>
              </div>
              <ProgressBar value={getApplicationProgress(featured.status)} className="mt-4" />
              <p className="mt-2 text-xs text-[#64748B]">
                {statusLabel(featured.status)} · Updated {formatDate(featured.updatedAt)}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
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
                >
                  <Button>Track Application</Button>
                </Link>
                <Link to={`/applications/${featured.id}`}>
                  <Button variant="outline">View Details</Button>
                </Link>
              </div>
            </PortalCard>
          ) : null}

          {/* Active table */}
          {activeApps.length > 0 ? (
            <section>
              <SectionHeading title="Active Applications" />
              <PortalCard padding="none" className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC] text-xs font-semibold tracking-wide text-[#64748B] uppercase">
                      <th className="px-5 py-3">Service Name</th>
                      <th className="px-5 py-3">Application ID</th>
                      <th className="px-5 py-3">Sub-Date</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Progress</th>
                      <th className="px-5 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {activeApps.map(app => {
                      const title =
                        app.serviceVersion.overview?.displayName ??
                        app.serviceVersion.subService.name;
                      const ref = app.publicRef ?? `CS-${app.id.slice(0, 8).toUpperCase()}`;
                      const progress = getApplicationProgress(app.status);
                      return (
                        <tr key={app.id} className="hover:bg-[#F8FAFC]/50">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
                                <FileText className="h-4 w-4" />
                              </span>
                              <span className="font-medium text-[#0A1629]">{title}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-[#64748B]">{ref}</td>
                          <td className="px-5 py-4 text-[#64748B]">
                            {formatDate(app.submittedAt ?? app.createdAt)}
                          </td>
                          <td className="px-5 py-4">
                            <StatusPill tone={statusTone(app.status)}>
                              {statusLabel(app.status)}
                            </StatusPill>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <ProgressBar value={progress} className="w-20" />
                              <span className="text-xs font-medium text-[#64748B]">{progress}%</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <Link
                              to={`/applications/${app.id}`}
                              className="font-semibold text-[#2563EB] hover:underline"
                            >
                              View Details →
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </PortalCard>
            </section>
          ) : null}

          {/* Completed */}
          {completedApps.length > 0 ? (
            <section>
              <SectionHeading title="Completed Applications" />
              <div className="space-y-3">
                {completedApps.map(app => {
                  const title =
                    app.serviceVersion.overview?.displayName ??
                    app.serviceVersion.subService.name;
                  return (
                    <PortalCard key={app.id} padding="sm" className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        <div>
                          <p className="font-semibold text-[#0A1629]">{title}</p>
                          <p className="text-xs text-[#94A3B8]">
                            Completed {formatDate(app.updatedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            try {
                              const cert = await applicationsApi.getApplicationCertificate(app.id);
                              if (cert.downloadUrl) window.open(cert.downloadUrl, '_blank');
                              else toast.message('Certificate not ready yet.');
                            } catch {
                              toast.message('Certificate not available yet.');
                            }
                          }}
                        >
                          <Download className="mr-1.5 h-4 w-4" />
                          Download Certificate
                        </Button>
                        <Link to={`/applications/${app.id}`}>
                          <Button size="sm" variant="ghost">
                            Receipt
                          </Button>
                        </Link>
                      </div>
                    </PortalCard>
                  );
                })}
              </div>
            </section>
          ) : null}

          {filtered.length === 0 ? (
            <EmptyState title="No matching applications" description="Try a different filter or search." />
          ) : null}
        </>
      )}

      {/* Support banner */}
      <PortalCard className="border-[#DBEAFE] bg-gradient-to-r from-[#EFF6FF] to-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Headphones className="h-6 w-6 text-[#2563EB]" />
            <h3 className="mt-2 font-display text-lg font-bold text-[#0A1629]">
              Need help with an application?
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/help">
              <Button size="sm">Start Chat Support</Button>
            </Link>
            <Link to="/help">
              <Button size="sm" variant="outline">
                View Support Tickets
              </Button>
            </Link>
            <a href="tel:1800111255">
              <Button size="sm" variant="outline">
                <Phone className="mr-1.5 h-4 w-4" />
                1800-111-255
              </Button>
            </a>
          </div>
        </div>
      </PortalCard>
    </div>
  );
}
