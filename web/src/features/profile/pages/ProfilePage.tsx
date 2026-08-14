import { useEffect, useState } from 'react';
import { CheckCircle2, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Button, Input, Label } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { formatDate } from '@/lib/utils';

export function ProfilePage() {
  const citizen = useAuthStore(s => s.citizen);
  const updateProfile = useAuthStore(s => s.updateProfile);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

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

  const initials = `${firstName.charAt(0) || 'C'}${lastName.charAt(0) || 'S'}`.toUpperCase();
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Citizen';
  const phone = citizen?.phone ?? '—';

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Portal', to: '/' }, { label: 'Profile Settings' }]} />

      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-[#0A1629]">Profile Settings</h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          Manage your official personal registry and digital identity linkages.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8"
      >
        <div className="flex flex-wrap items-center gap-5 border-b border-[#F3F4F6] pb-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#2563EB] text-2xl font-bold text-white">
            {initials}
          </div>
          <div>
            <button type="button" className="text-sm font-semibold text-[#2563EB] hover:underline">
              Change Photo
            </button>
            <p className="mt-1 text-xs text-[#9CA3AF]">JPG, PNG or GIF. Max size 2MB.</p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Full Name</Label>
            <div className="mt-1.5 grid gap-3 sm:grid-cols-2">
              <Input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" required />
              <Input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="phone">Phone Number</Label>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                <CheckCircle2 className="h-3 w-3" /> Verified
              </span>
            </div>
            <Input id="phone" value={phone} readOnly className="mt-1.5 bg-[#F9FAFB] text-[#6B7280]" />
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1.5" />
          </div>
        </div>

        <div className="mt-10 border-t border-[#F3F4F6] pt-8">
          <h2 className="text-lg font-semibold text-[#0A1629]">Linked Verification IDs</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Aadhaar and PAN linking will be available when verification APIs are enabled.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {['Aadhaar Number', 'PAN Number'].map(label => (
              <div key={label}>
                <div className="mb-1.5 flex items-center justify-between">
                  <Label>{label}</Label>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#2563EB]">
                    <Link2 className="h-3 w-3" /> Not linked
                  </span>
                </div>
                <Input value="—" readOnly className="bg-[#F9FAFB] text-[#9CA3AF]" />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#F3F4F6] pt-6">
          <p className="text-xs text-[#9CA3AF]">
            Signed in as {fullName}
            {citizen?.createdAt ? ` · Member since ${formatDate(citizen.createdAt, 'long')}` : ''}
          </p>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
