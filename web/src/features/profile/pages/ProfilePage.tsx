import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  Circle,
  HelpCircle,
  Search,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Button } from '@/components/ui/button';
import {
  PortalCard,
  ProgressBar,
  SectionHeading,
  StatusPill,
} from '@/components/ui/portal-primitives';
import { LoadingBlock } from '@/components/ui/primitives';
import { ProfileDetailsForm } from '@/features/profile/components/ProfileDetailsForm';
import { useAuthStore } from '@/features/auth/store/auth.store';
import {
  applicationsApi,
  applicationsQueryKeys,
  profileApi,
  profileQueryKeys,
} from '@/services/api';
import {
  getProfileCompletion,
  getProfileDisplayName,
  getProfileInitials,
} from '@/lib/profile';
import { cn, formatDate } from '@/lib/utils';

function appStatusTone(status: string): 'green' | 'amber' | 'blue' | 'slate' {
  if (['APPROVED', 'COMPLETED'].includes(status)) return 'green';
  if (['UNDER_REVIEW', 'PROCESSING', 'SUBMITTED'].includes(status)) return 'amber';
  if (['DRAFT', 'FORM_IN_PROGRESS', 'DOCUMENTS_PENDING'].includes(status)) return 'blue';
  return 'slate';
}

const QUICK_ACTIONS = [
  { label: 'Applications', subtitle: 'Track status', icon: Search, to: '/applications' },
  { label: 'Support', subtitle: 'Get help', icon: HelpCircle, to: '/help/tickets' },
  { label: 'Alerts', subtitle: 'Preferences', icon: Bell, to: '/notifications' },
] as const;

export function ProfilePage() {
  const citizen = useAuthStore(s => s.citizen);

  const { data: applicationsData, isLoading: appsLoading } = useQuery({
    queryKey: applicationsQueryKeys.list(1),
    queryFn: () => applicationsApi.listApplications({ page: 1, limit: 5 }),
  });

  const { data: addresses = [] } = useQuery({
    queryKey: profileQueryKeys.addresses(),
    queryFn: () => profileApi.listAddresses(),
  });

  if (!citizen) {
    return (
      <div className="py-20">
        <LoadingBlock className="mx-auto h-12 max-w-md" />
      </div>
    );
  }

  const fullName = getProfileDisplayName(citizen);
  const initials = getProfileInitials(citizen);
  const phone = citizen?.phone ?? '—';
  const defaultAddress = addresses.find(a => a.isDefault) ?? addresses[0];
  const recentApps = applicationsData?.data ?? [];
  const completion = getProfileCompletion(citizen, {
    addressCount: addresses.length,
  });

  return (
    <div className="space-y-6 pb-10">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'My Account' }]} />

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A3B8B] via-[#2563EB] to-[#3B82F6] shadow-[0_20px_50px_rgba(37,99,235,0.25)]">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-[#60A5FA]/20 blur-2xl" />
        <div className="relative px-6 py-8 sm:px-10 sm:py-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-white/30 bg-white/15 text-2xl font-bold text-white shadow-lg backdrop-blur-sm">
                {initials}
              </div>
              <div className="min-w-0 text-white">
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-100/90">
                  Citizen Account
                </p>
                <h1 className="font-display mt-1 truncate text-2xl font-bold sm:text-3xl">{fullName}</h1>
                <p className="mt-1 text-sm text-blue-100">{phone}</p>
                {citizen?.createdAt ? (
                  <p className="mt-1 text-xs text-blue-100/80">
                    Member since {formatDate(citizen.createdAt, 'long')}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                onClick={() =>
                  document.getElementById('profile-form')?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                Edit Details
              </Button>
              <Link to="/notifications">
                <Button type="button" className="bg-white text-[#1A3B8B] hover:bg-blue-50">
                  Account Settings
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:max-w-md">
            {[
              { label: 'Applications', value: recentApps.length || '0' },
              { label: 'Profile', value: `${completion.percent}%` },
            ].map(stat => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-center backdrop-blur-sm"
              >
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-[11px] font-medium uppercase tracking-wide text-blue-100">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {QUICK_ACTIONS.map(item => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.to}
              className="group flex items-center gap-4 rounded-2xl border border-[#E8EDF5] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#2563EB]/30 hover:shadow-md"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] text-[#2563EB] transition group-hover:from-[#2563EB] group-hover:to-[#1A3B8B] group-hover:text-white">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#0A1629]">{item.label}</p>
                <p className="text-xs text-[#94A3B8]">{item.subtitle}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-[#CBD5E1] transition group-hover:text-[#2563EB]" />
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* Profile completion */}
          {completion.percent < 100 ? (
            <PortalCard padding="lg">
              <SectionHeading
                title="Complete your profile"
                subtitle="A complete profile helps us pre-fill applications and deliver updates faster."
              />
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-3xl font-bold text-[#0A1629]">{completion.percent}%</p>
                  <p className="text-sm text-[#64748B]">
                    {completion.completedCount} of {completion.totalCount} steps done
                  </p>
                </div>
                <StatusPill tone="amber">In progress</StatusPill>
              </div>
              <ProgressBar value={completion.percent} className="mb-5 h-2.5" />
              <ul className="grid gap-2 sm:grid-cols-2">
                {completion.steps.map(step => (
                  <li
                    key={step.id}
                    className={cn(
                      'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm',
                      step.done ? 'bg-emerald-50 text-emerald-800' : 'bg-[#F8FAFC] text-[#64748B]',
                    )}
                  >
                    {step.done ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0 text-[#CBD5E1]" />
                    )}
                    {step.label}
                  </li>
                ))}
              </ul>
            </PortalCard>
          ) : null}

          {/* Personal details form */}
          <PortalCard padding="lg" className="scroll-mt-24">
            <SectionHeading
              title="Personal Details"
              subtitle="Keep your legal name, contact, and address up to date for government records."
              action={<StatusPill tone="green">Verified</StatusPill>}
            />
            <ProfileDetailsForm
              variant="page"
              citizen={citizen}
              defaultAddress={defaultAddress}
              submitLabel="Save changes"
              onSaved={() => toast.success('Profile saved')}
            />
          </PortalCard>
        </div>

        <aside className="space-y-6">
          <PortalCard padding="md">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-[#0A1629]">Recent Applications</h2>
              <Link to="/applications" className="text-sm font-semibold text-[#2563EB] hover:underline">
                View all
              </Link>
            </div>
            {appsLoading ? (
              <LoadingBlock className="h-24" />
            ) : recentApps.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#E2E8F0] px-4 py-8 text-center">
                <User className="mx-auto h-8 w-8 text-[#CBD5E1]" />
                <p className="mt-2 text-sm text-[#64748B]">No applications yet.</p>
                <Link
                  to="/services"
                  className="mt-3 inline-block text-sm font-semibold text-[#2563EB] hover:underline"
                >
                  Browse services
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {recentApps.map(app => {
                  const name =
                    app.serviceVersion.overview?.displayName ??
                    app.serviceVersion.subService.name;
                  const ref = app.publicRef ?? app.id.slice(0, 8).toUpperCase();
                  return (
                    <li key={app.id}>
                      <Link
                        to={`/applications/${app.id}`}
                        className="block rounded-xl border border-[#F1F5F9] p-3 transition hover:border-[#2563EB]/30 hover:bg-[#F8FAFC]"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#0A1629]">{name}</p>
                            <p className="text-xs text-[#94A3B8]">
                              {app.submittedAt
                                ? `Submitted ${formatDate(app.submittedAt)}`
                                : 'Draft'}{' '}
                              · #{ref}
                            </p>
                          </div>
                          <StatusPill tone={appStatusTone(app.status)}>
                            {app.status.replace(/_/g, ' ')}
                          </StatusPill>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </PortalCard>
        </aside>
      </div>
    </div>
  );
}
