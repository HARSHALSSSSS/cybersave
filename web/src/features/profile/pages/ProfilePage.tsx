import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
  FolderOpen,
  HelpCircle,
  Link2,
  Search,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Button, Input, Label } from '@/components/ui/button';
import { StatusPill } from '@/components/ui/portal-primitives';
import { LoadingBlock } from '@/components/ui/primitives';
import { useAuthStore } from '@/features/auth/store/auth.store';
import {
  applicationsApi,
  applicationsQueryKeys,
  profileApi,
  profileQueryKeys,
} from '@/services/api';
import { getProfileDisplayName } from '@/lib/profile';
import { openStorageDownloadUrl } from '@/lib/upload';
import { formatDate } from '@/lib/utils';

function appStatusTone(status: string): 'green' | 'amber' | 'blue' | 'slate' {
  if (['APPROVED', 'COMPLETED'].includes(status)) return 'green';
  if (['UNDER_REVIEW', 'PROCESSING', 'SUBMITTED'].includes(status)) return 'amber';
  if (['DRAFT', 'FORM_IN_PROGRESS', 'DOCUMENTS_PENDING'].includes(status)) return 'blue';
  return 'slate';
}

export function ProfilePage() {
  const citizen = useAuthStore(s => s.citizen);
  const updateProfile = useAuthStore(s => s.updateProfile);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: applicationsData, isLoading: appsLoading } = useQuery({
    queryKey: applicationsQueryKeys.list(1),
    queryFn: () => applicationsApi.listApplications({ page: 1, limit: 5 }),
  });

  const { data: addresses = [], isLoading: addressesLoading } = useQuery({
    queryKey: profileQueryKeys.addresses(),
    queryFn: () => profileApi.listAddresses(),
  });

  const { data: savedDocs = [], isLoading: docsLoading } = useQuery({
    queryKey: profileQueryKeys.documents(),
    queryFn: () => profileApi.listSavedDocuments(),
  });

  useEffect(() => {
    if (!citizen) return;
    setFirstName(citizen.firstName ?? '');
    setLastName(citizen.lastName ?? '');
    setEmail(citizen.email ?? '');
  }, [citizen]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        email: email.trim() || undefined,
      });
      toast.success('Profile saved');
    } catch {
      toast.error('Could not save profile');
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadDoc(docId: string) {
    try {
      const { downloadUrl } = await profileApi.getSavedDocumentDownload(docId);
      openStorageDownloadUrl(downloadUrl);
    } catch {
      toast.error('Could not download document');
    }
  }

  const fullName = getProfileDisplayName(citizen);
  const initials = `${firstName.charAt(0) || 'C'}${lastName.charAt(0) || 'S'}`.toUpperCase();
  const phone = citizen?.phone ?? '—';
  const defaultAddress = addresses.find(a => a.isDefault) ?? addresses[0];
  const recentApps = applicationsData?.data ?? [];

  return (
    <div className="space-y-6 pb-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'My Account' }]} />

      <PortalProfileHeader
        fullName={fullName}
        initials={initials}
        memberSince={citizen?.createdAt}
        onEdit={() => document.getElementById('profile-form')?.scrollIntoView({ behavior: 'smooth' })}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <form
            id="profile-form"
            onSubmit={handleSave}
            className="rounded-2xl border border-[#E8EDF5] bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-lg font-bold text-[#0A1629]">Personal Details</h2>
              <StatusPill tone="green">Govt Record Synced</StatusPill>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Full Legal Name</Label>
                <div className="mt-1.5 grid gap-3 sm:grid-cols-2">
                  <Input
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="First name"
                    required
                  />
                  <Input
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="Last name"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="phone">Phone Number</Label>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" /> Verified
                  </span>
                </div>
                <Input id="phone" value={phone} readOnly className="mt-1.5 bg-[#F9FAFB] text-[#64748B]" />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Permanent Address</Label>
                {addressesLoading ? (
                  <LoadingBlock className="mt-2 h-12" />
                ) : defaultAddress ? (
                  <p className="mt-1.5 rounded-xl border border-[#F1F5F9] bg-[#F8FAFC] px-3 py-2.5 text-sm text-[#0A1629]">
                    {[defaultAddress.line1, defaultAddress.line2, defaultAddress.city, defaultAddress.state, defaultAddress.pincode]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                ) : (
                  <p className="mt-1.5 text-sm text-[#94A3B8]">
                    No address saved.{' '}
                    <Link to="/documents" className="font-semibold text-[#2563EB] hover:underline">
                      Add in Documents
                    </Link>
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </form>

          <section className="rounded-2xl border border-[#E8EDF5] bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold text-[#0A1629]">Linked Identities</h2>
            <ul className="mt-4 divide-y divide-[#F1F5F9]">
              {[
                { name: 'Aadhaar Card', linked: false, action: 'View' },
                { name: 'PAN Card', linked: false, action: 'View' },
                { name: 'Voter ID Card', linked: false, action: 'Link Now' },
              ].map(item => (
                <li key={item.name} className="flex items-center justify-between gap-4 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                      <FileText className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#0A1629]">{item.name}</p>
                      <p className="text-xs text-[#94A3B8]">
                        {item.linked ? 'Verified' : 'Not linked'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-[#2563EB]"
                    onClick={() => toast.info('Identity linking will be available soon')}
                  >
                    <Link2 className="h-3.5 w-3.5" />
                    {item.action}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-[#E8EDF5] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-[#0A1629]">Recent Application Activity</h2>
              <Link to="/applications" className="text-sm font-semibold text-[#2563EB] hover:underline">
                View All
              </Link>
            </div>
            {appsLoading ? (
              <LoadingBlock className="h-24" />
            ) : recentApps.length === 0 ? (
              <p className="text-sm text-[#94A3B8]">No applications yet.</p>
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
                        className="block rounded-xl border border-[#F1F5F9] p-3 transition hover:border-[#2563EB]/30"
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
          </section>

          <section className="rounded-2xl border border-[#E8EDF5] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-[#0A1629]">Secure Document Vault</h2>
              <Link to="/documents" className="text-sm font-semibold text-[#2563EB] hover:underline">
                Upload Now
              </Link>
            </div>
            {docsLoading ? (
              <LoadingBlock className="h-24" />
            ) : savedDocs.length === 0 ? (
              <p className="text-sm text-[#94A3B8]">
                No saved documents.{' '}
                <Link to="/documents" className="font-semibold text-[#2563EB]">
                  Open vault
                </Link>
              </p>
            ) : (
              <ul className="space-y-3">
                {savedDocs.slice(0, 4).map(doc => (
                  <li
                    key={doc.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#F1F5F9] px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#0A1629]">{doc.name}</p>
                      <p className="text-xs text-[#94A3B8]">
                        {formatDate(doc.createdAt)}
                        {doc.storedFile?.sizeBytes
                          ? ` · ${Math.round(doc.storedFile.sizeBytes / 1024)} KB`
                          : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 text-[#2563EB]"
                      onClick={() => void handleDownloadDoc(doc.id)}
                      aria-label="Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Track Applications', icon: Search, to: '/applications' },
          { label: 'Download Certificates', icon: FolderOpen, to: '/documents' },
          { label: 'Open Support Tickets', icon: HelpCircle, to: '/help/tickets' },
          { label: 'Notification Settings', icon: Bell, to: '/notifications' },
        ].map(item => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.to}
              className="flex items-center gap-3 rounded-2xl border border-[#E8EDF5] bg-white p-4 shadow-sm transition hover:border-[#2563EB]/30"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-semibold text-[#0A1629]">{item.label}</span>
              <ChevronRight className="ml-auto h-4 w-4 text-[#94A3B8]" />
            </Link>
          );
        })}
      </section>
    </div>
  );
}

function PortalProfileHeader({
  fullName,
  initials,
  memberSince,
  onEdit,
}: {
  fullName: string;
  initials: string;
  memberSince?: string;
  onEdit: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#E8EDF5] bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#1A3B8B] text-xl font-bold text-white">
          {initials}
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0A1629]">{fullName}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <StatusPill tone="green">Verified Profile</StatusPill>
            {memberSince ? (
              <span className="text-xs text-[#64748B]">
                Citizen member since {formatDate(memberSince, 'long')}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={onEdit}>
          Edit Profile
        </Button>
        <Link to="/notifications">
          <Button type="button">
            <Settings className="mr-2 h-4 w-4" />
            Account Settings
          </Button>
        </Link>
      </div>
    </div>
  );
}
