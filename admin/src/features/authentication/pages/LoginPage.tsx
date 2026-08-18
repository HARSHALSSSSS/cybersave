import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input, Label } from '@/components/ui';
import { useAuthStore } from '../store/auth.store';

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const year = useMemo(() => new Date().getFullYear(), []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email.trim(), password);
      toast.success('Signed in successfully');
      navigate('dashboard', { replace: true });
    } catch {
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 w-full overflow-y-auto bg-[#EEF2F8]">
      <div className="relative flex w-full flex-1 items-center justify-center px-5 py-10 sm:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_420px_at_50%_0%,rgba(37,99,235,0.08),transparent_60%)]"
        />

        <div className="relative z-10 w-full max-w-[480px] shrink-0">
          <div className="overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_64px_rgba(15,23,42,0.08)]">
            {/* Brand */}
            <div className="flex flex-col items-center border-b border-[#EEF2F7] bg-[linear-gradient(180deg,#F8FAFF_0%,#FFFFFF_100%)] px-8 pb-8 pt-10 sm:px-10 sm:pt-11">
              <img
                src={`${import.meta.env.BASE_URL}admin-login-logo.png`}
                alt="Cybersave — Digital Services, Trusted Always"
                className="h-[88px] w-auto max-w-[240px] object-contain"
                draggable={false}
              />
              <h1
                className="mt-5 text-2xl font-bold tracking-tight text-[#0A1629]"
                style={{ fontFamily: 'var(--font-login-display)' }}
              >
                Admin Console
              </h1>
              <p className="mt-2 text-center text-sm leading-6 text-[#64748B]">
                Sign in with your administrator credentials
              </p>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-6 px-8 py-8 sm:px-10 sm:py-9">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-[#0A1629]">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="name@organization.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-xl border-[#D7DEE8] bg-[#FAFBFD] px-4 text-[15px] shadow-none focus-visible:border-[#2563EB] focus-visible:bg-white focus-visible:ring-[#2563EB]/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-[#0A1629]">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 rounded-xl border-[#D7DEE8] bg-[#FAFBFD] px-4 pr-12 text-[15px] shadow-none focus-visible:border-[#2563EB] focus-visible:bg-white focus-visible:ring-[#2563EB]/20"
                  />
                  <button
                    type="button"
                    className="absolute top-1/2 right-4 -translate-y-1/2 rounded-md p-0.5 text-[#94A3B8] transition-colors hover:text-[#0A1629]"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="h-12 w-full rounded-xl bg-[#2563EB] text-[15px] font-semibold text-white shadow-[0_8px_24px_rgba(37,99,235,0.28)] hover:bg-[#1D4ED8]"
                disabled={loading}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>

            <div className="flex items-center justify-center gap-2 border-t border-[#EEF2F7] bg-[#F8FAFC] px-8 py-4 text-xs text-[#64748B] sm:px-10">
              <Lock className="h-3.5 w-3.5 shrink-0 text-[#2563EB]" />
              Authorized personnel only
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-[#94A3B8]">
            © {year} Cybersave. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
