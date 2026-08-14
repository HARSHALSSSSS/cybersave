import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Fingerprint, X } from 'lucide-react';
import { Button, Input, Label } from '@/components/ui/button';
import { BrandLockup } from '@/components/brand/BrandLockup';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useAuthModalStore } from '@/features/auth/store/auth-modal.store';
import { isProfileComplete } from '@/lib/profile';
import { normalizePhone } from '@/lib/utils';

function IndiaFlag() {
  return (
    <svg width="20" height="14" viewBox="0 0 22 16" aria-hidden className="shrink-0">
      <rect width="22" height="5.33" fill="#FF9933" />
      <rect y="5.33" width="22" height="5.34" fill="#FFFFFF" />
      <rect y="10.67" width="22" height="5.33" fill="#138808" />
    </svg>
  );
}

export function AuthModal() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    open,
    step,
    phone,
    redirectTo,
    onSuccess,
    requireProfile,
    profileMandatory,
    setStep,
    setPhone,
    close,
    reset,
  } = useAuthModalStore();

  const requestOtp = useAuthStore(s => s.requestOtp);
  const verifyOtp = useAuthStore(s => s.verifyOtp);
  const updateProfile = useAuthStore(s => s.updateProfile);
  const citizen = useAuthStore(s => s.citizen);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);

  const [loginPhone, setLoginPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const state = location.state as { authRequired?: boolean; from?: string } | null;
    if (state?.authRequired) {
      useAuthModalStore.getState().openLogin({
        redirectTo: state.from ?? undefined,
        requireProfile: true,
        profileMandatory: false,
      });
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (!open) return;
    if (step === 'profile' && citizen) {
      setFirstName(citizen.firstName ?? '');
      setLastName(citizen.lastName ?? '');
      setEmail(citizen.email ?? '');
    }
  }, [open, step, citizen]);

  if (!open) return null;

  async function finishAuthFlow() {
    reset();
    if (onSuccess) {
      onSuccess();
      return;
    }
    if (redirectTo) {
      navigate(redirectTo);
    }
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const normalized = normalizePhone(loginPhone);
      const result = await requestOtp(normalized);
      setPhone(normalized);
      if (result.devCode) toast.message(`Dev OTP: ${result.devCode}`);
      setStep('otp');
      setOtp('');
    } catch {
      toast.error('Could not send OTP. Check backend is running.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyOtp(phone, otp);
      toast.success('Signed in successfully');
      const profile = useAuthStore.getState().citizen;
      if (requireProfile && !isProfileComplete(profile)) {
        setStep('profile');
      } else {
        await finishAuthFlow();
      }
    } catch {
      toast.error('Invalid OTP. Try 123456 in local dev.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        email: email.trim() || undefined,
      });
      toast.success('Profile saved');
      await finishAuthFlow();
    } catch {
      toast.error('Could not save profile');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    if (profileMandatory && step === 'profile') return;
    close();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        {!profileMandatory || step !== 'profile' ? (
          <button
            type="button"
            className="absolute top-4 right-4 z-10 rounded-full p-2 text-[#64748B] hover:bg-[#F1F5F9]"
            onClick={handleClose}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}

        <div
          className="px-8 pt-10 pb-8"
          style={{
            background:
              step === 'login' || step === 'otp'
                ? 'linear-gradient(145deg, #1A3B8B 0%, #2563EB 55%, #3B82F6 100%)'
                : undefined,
          }}
        >
          {step === 'login' ? (
            <>
              <div className="mb-6 flex justify-center">
                <BrandLockup size={120} />
              </div>
              <h2 className="font-display text-center text-2xl font-bold text-white">
                Welcome to Cybersave
              </h2>
              <p className="mt-2 text-center text-sm text-blue-100">
                Sign in with your mobile number to access services
              </p>
              <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-white/90">Mobile Number</label>
                  <div className="mt-2 flex h-12 items-center overflow-hidden rounded-xl border border-white/20 bg-[#0F2E7A]/50">
                    <span className="flex h-full items-center gap-2 border-r border-white/15 px-3 text-sm text-white">
                      <IndiaFlag /> +91
                    </span>
                    <input
                      inputMode="numeric"
                      placeholder="98765 43210"
                      value={loginPhone}
                      onChange={e => setLoginPhone(e.target.value)}
                      className="h-full w-full bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/40"
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  variant="secondary"
                  size="lg"
                  className="w-full bg-white text-[#2563EB] hover:bg-blue-50"
                  disabled={loading}
                >
                  {loading ? 'Sending OTP…' : 'Send OTP'}
                </Button>
              </form>
              <button
                type="button"
                className="mt-4 flex w-full flex-col items-center gap-2 text-sm text-white/80"
                onClick={() => toast.info('Biometric login coming soon on web')}
              >
                <Fingerprint className="h-8 w-8" />
                Login with Fingerprint / Face ID
              </button>
            </>
          ) : null}

          {step === 'otp' ? (
            <>
              <h2 className="font-display text-2xl font-bold text-white">Enter OTP</h2>
              <p className="mt-2 text-sm text-blue-100">Sent to {phone}</p>
              <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
                <Input
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="border-white/25 bg-[#0F2E7A]/40 text-center text-lg tracking-[0.4em] text-white"
                  required
                />
                <Button
                  type="submit"
                  variant="secondary"
                  size="lg"
                  className="w-full bg-white text-[#2563EB]"
                  disabled={loading}
                >
                  {loading ? 'Verifying…' : 'Verify & Continue'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-blue-100"
                  onClick={() => setStep('login')}
                >
                  Change number
                </Button>
              </form>
            </>
          ) : null}
        </div>

        {step === 'profile' ? (
          <div className="px-8 py-8">
            <h2 className="font-display text-center text-2xl font-bold text-[#0A1629]">
              Complete Your Profile
            </h2>
            <p className="mt-2 text-center text-sm text-[#64748B]">
              {profileMandatory
                ? 'Please add your name to continue with this action.'
                : 'Help us personalise your portal experience.'}
            </p>
            <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="auth-first">First name *</Label>
                <Input
                  id="auth-first"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  required
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="auth-last">Last name</Label>
                <Input
                  id="auth-last"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="auth-email">Email (optional)</Label>
                <Input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Saving…' : 'Continue'}
              </Button>
              {!profileMandatory ? (
                <Button type="button" variant="ghost" className="w-full" onClick={finishAuthFlow}>
                  Skip for now
                </Button>
              ) : null}
            </form>
          </div>
        ) : null}

        {isAuthenticated && step !== 'profile' ? null : null}
      </div>
    </div>
  );
}
