import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ProfileDetailsForm } from '@/features/profile/components/ProfileDetailsForm';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { getProfileCompletion, isProfileComplete } from '@/lib/profile';
import { profileApi, profileQueryKeys } from '@/services/api';

const DISMISS_KEY = 'cybersave_profile_prompt_dismissed';

export function CompleteProfileModal() {
  const navigate = useNavigate();
  const citizen = useAuthStore(s => s.citizen);
  const [open, setOpen] = useState(false);

  const { data: addresses = [] } = useQuery({
    queryKey: profileQueryKeys.addresses(),
    queryFn: () => profileApi.listAddresses(),
    enabled: Boolean(citizen && open),
  });

  useEffect(() => {
    if (!citizen) return;
    if (isProfileComplete(citizen)) {
      setOpen(false);
      return;
    }
    const dismissed = sessionStorage.getItem(DISMISS_KEY) === '1';
    if (!dismissed) setOpen(true);
  }, [citizen]);

  if (!open || !citizen) return null;

  const defaultAddress = addresses.find(a => a.isDefault) ?? addresses[0];
  const completion = getProfileCompletion(citizen, {
    addressCount: addresses.length,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:rounded-[28px]">
        <div className="shrink-0 border-b border-[#F1F5F9] bg-gradient-to-r from-[#1A3B8B] to-[#2563EB] px-6 py-6 text-white sm:px-8">
          <button
            type="button"
            className="absolute top-4 right-4 rounded-full p-2 text-white/80 hover:bg-white/10"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-4 pr-10">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-100">Account setup</p>
              <h2 className="font-display text-xl font-bold">Complete your citizen profile</h2>
              <p className="mt-1 text-sm text-blue-100">
                {completion.percent}% complete — required before you can submit applications.
              </p>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-all duration-500"
              style={{ width: `${completion.percent}%` }}
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          <ProfileDetailsForm
            variant="modal"
            citizen={citizen}
            defaultAddress={defaultAddress}
            submitLabel="Save & continue"
            onSaved={() => {
              toast.success('Profile saved successfully');
              setOpen(false);
            }}
            footer={
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  sessionStorage.setItem(DISMISS_KEY, '1');
                  setOpen(false);
                }}
              >
                Remind me later
              </Button>
            }
          />
        </div>

        <button type="button" className="sr-only" onClick={() => navigate('/profile')}>
          profile
        </button>
      </div>
    </div>
  );
}
