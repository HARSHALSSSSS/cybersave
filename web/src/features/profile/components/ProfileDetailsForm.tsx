import { useEffect, useId, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Calendar, Mail, MapPin, Phone, User } from 'lucide-react';
import { Button, Input, Label } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { GENDER_OPTIONS, INDIAN_STATE_NAMES } from '@/lib/indian-states';
import {
  getProfileExtras,
  normalizeGender,
  saveProfileExtras,
} from '@/lib/profile-extras';
import { cn } from '@/lib/utils';
import {
  profileApi,
  profileQueryKeys,
  type CitizenAddress,
} from '@/services/api/profile.api';
import type { CitizenProfile } from '@/services/api/auth.api';

type ProfileDetailsFormProps = {
  variant?: 'modal' | 'page';
  citizen: CitizenProfile;
  defaultAddress?: CitizenAddress | null;
  showAddress?: boolean;
  submitLabel?: string;
  onSaved?: () => void;
  footer?: React.ReactNode;
};

function FormSection({
  icon: Icon,
  title,
  subtitle,
  children,
  className,
}: {
  icon: typeof User;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-[#E8EDF5] bg-gradient-to-br from-[#FAFBFD] to-white p-5 shadow-sm',
        className,
      )}
    >
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-sm font-bold text-[#0A1629]">{title}</h3>
          {subtitle ? <p className="mt-0.5 text-xs text-[#64748B]">{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-[11px] text-[#94A3B8]">{children}</p>;
}

export function ProfileDetailsForm({
  variant = 'page',
  citizen,
  defaultAddress,
  showAddress = true,
  submitLabel = 'Save profile',
  onSaved,
  footer,
}: ProfileDetailsFormProps) {
  const queryClient = useQueryClient();
  const updateProfile = useAuthStore(s => s.updateProfile);
  const genderId = useId();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [gender, setGender] = useState<string>(GENDER_OPTIONS[0]);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [email, setEmail] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const extras = getProfileExtras(citizen.id);
    setFirstName(citizen.firstName ?? '');
    setLastName(citizen.lastName ?? '');
    setEmail(citizen.email ?? '');
    setFatherName(extras.fatherOrGuardianName ?? '');
    setGender(normalizeGender(extras.gender));
    setDateOfBirth(extras.dateOfBirth ?? '');
    setLine1(defaultAddress?.line1 ?? '');
    setLine2(defaultAddress?.line2 ?? '');
    setCity(defaultAddress?.city ?? '');
    setState(defaultAddress?.state ?? '');
    setPincode(defaultAddress?.pincode ?? '');
  }, [citizen, defaultAddress]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedFirst = firstName.trim();
    if (trimmedFirst.length < 2) {
      setError('Enter your legal first name (at least 2 characters).');
      return;
    }

    const hasAddress = line1.trim().length > 0;
    if (hasAddress) {
      if (!city.trim() || !state.trim()) {
        setError('City and state are required when address is provided.');
        return;
      }
      if (!/^\d{6}$/.test(pincode.trim())) {
        setError('Enter a valid 6-digit PIN code.');
        return;
      }
    }

    setLoading(true);
    try {
      await updateProfile({
        firstName: trimmedFirst,
        lastName: lastName.trim() || undefined,
        email: email.trim() || undefined,
      });

      saveProfileExtras(citizen.id, {
        gender,
        dateOfBirth,
        fatherOrGuardianName: fatherName,
      });

      if (hasAddress) {
        const payload = {
          label: defaultAddress?.label || 'Home',
          line1: line1.trim(),
          line2: line2.trim() || undefined,
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          isDefault: true,
        };
        if (defaultAddress?.id) {
          await profileApi.updateAddress(defaultAddress.id, payload);
        } else {
          await profileApi.createAddress(payload);
        }
        await queryClient.invalidateQueries({ queryKey: profileQueryKeys.addresses() });
      }

      onSaved?.();
    } catch {
      setError('Could not save your profile. Check your details and try again.');
    } finally {
      setLoading(false);
    }
  }

  const phoneDisplay = citizen.phone?.startsWith('+')
    ? citizen.phone
    : citizen.phone
      ? `+91 ${citizen.phone.replace(/\D/g, '').slice(-10)}`
      : '—';

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', variant === 'page' && 'space-y-5')}>
      <FormSection
        icon={User}
        title="Personal information"
        subtitle="Use the name exactly as it appears on your Aadhaar or government ID."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="profile-first">First name *</Label>
            <Input
              id="profile-first"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="e.g. Rahul"
              required
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="profile-last">Last name</Label>
            <Input
              id="profile-last"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder="e.g. Sharma"
              className="mt-1.5"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="profile-father">Father / guardian name</Label>
            <Input
              id="profile-father"
              value={fatherName}
              onChange={e => setFatherName(e.target.value)}
              placeholder="As on official records"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor={genderId}>Gender</Label>
            <select
              id={genderId}
              value={gender}
              onChange={e => setGender(e.target.value)}
              className="mt-1.5 h-11 w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 text-sm text-[#0A1629] shadow-sm outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/12"
            >
              {GENDER_OPTIONS.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="profile-dob">Date of birth</Label>
            <div className="relative mt-1.5">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
              <Input
                id="profile-dob"
                type="date"
                value={dateOfBirth}
                onChange={e => setDateOfBirth(e.target.value)}
                className="pl-10"
                max={new Date().toISOString().slice(0, 10)}
              />
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection
        icon={Phone}
        title="Contact details"
        subtitle="Your mobile is verified via OTP. Email is used for receipts and updates."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="profile-phone">Mobile number</Label>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                Verified
              </span>
            </div>
            <Input id="profile-phone" value={phoneDisplay} readOnly className="mt-1.5 bg-[#F8FAFC] text-[#64748B]" />
          </div>
          <div>
            <Label htmlFor="profile-email">Email address</Label>
            <div className="relative mt-1.5">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
              <Input
                id="profile-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="pl-10"
              />
            </div>
            <FieldHint>Recommended for payment receipts and application alerts.</FieldHint>
          </div>
        </div>
      </FormSection>

      {showAddress ? (
        <FormSection
          icon={MapPin}
          title="Residential address"
          subtitle="Used to pre-fill service applications and correspondence."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="profile-line1">House / flat / street *</Label>
              <Input
                id="profile-line1"
                value={line1}
                onChange={e => setLine1(e.target.value)}
                placeholder="Flat 402, Green Valley Apartments, MG Road"
                className="mt-1.5"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="profile-line2">Landmark / area (optional)</Label>
              <Input
                id="profile-line2"
                value={line2}
                onChange={e => setLine2(e.target.value)}
                placeholder="Near City Mall"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="profile-city">City / town</Label>
              <Input
                id="profile-city"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="Pune"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="profile-state">State</Label>
              <select
                id="profile-state"
                value={state}
                onChange={e => setState(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 text-sm text-[#0A1629] shadow-sm outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/12"
              >
                <option value="">Select state</option>
                {INDIAN_STATE_NAMES.map(name => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
                {state && !INDIAN_STATE_NAMES.includes(state as (typeof INDIAN_STATE_NAMES)[number]) ? (
                  <option value={state}>{state}</option>
                ) : null}
              </select>
            </div>
            <div>
              <Label htmlFor="profile-pin">PIN code</Label>
              <Input
                id="profile-pin"
                inputMode="numeric"
                maxLength={6}
                value={pincode}
                onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="411001"
                className="mt-1.5"
              />
            </div>
          </div>
        </FormSection>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <div className={cn('flex flex-col gap-3', variant === 'page' && 'border-t border-[#F1F5F9] pt-6 sm:flex-row sm:justify-end')}>
        <Button type="submit" size="lg" disabled={loading} className={variant === 'modal' ? 'w-full' : ''}>
          {loading ? 'Saving…' : submitLabel}
        </Button>
        {footer}
      </div>
    </form>
  );
}
