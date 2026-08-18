import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input, Label } from '@/components/ui';
import { useAuthStore } from '../store/auth.store';
import { env } from '@/app/config/env';

const DEMO_EMAIL = 'admin@cybersave.local';
const DEMO_PASSWORD = 'Admin@123456';

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const year = useMemo(() => new Date().getFullYear(), []);

  const fillDemoCredentials = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
  };

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
    <div className="flex h-full min-h-0 w-full overflow-y-auto bg-[#F4F7FB]">
      <div className="relative flex w-full flex-1 items-center justify-center px-4 py-8 sm:py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#E8F0FE] to-transparent"
        />

        <div className="relative z-10 w-full max-w-[400px] shrink-0">
          <div className="rounded-2xl border border-[#EEF1F6] bg-white px-6 py-7 shadow-[0_8px_24px_rgba(37,99,235,0.08)] sm:px-8 sm:py-8">
            <div className="mb-5 flex flex-col items-center text-center">
              <img
                src={`${import.meta.env.BASE_URL}admin-login-logo.png`}
                alt="Cybersave — Digital Services, Trusted Always"
                className="mx-auto h-16 w-auto max-w-[168px] object-contain"
                width={168}
                height={64}
                draggable={false}
              />
              <h1 className="mt-3 text-lg font-semibold tracking-tight text-[#0A1629] sm:text-xl">
                Admin Console
              </h1>
              <p className="mt-1 text-sm text-[#7C8691]">
                Sign in with your admin credentials
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[#0A1629]">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder={DEMO_EMAIL}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-10 border-[#E5E7EB] bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[#0A1629]">
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
                    className="h-10 border-[#E5E7EB] bg-white pr-10"
                  />
                  <button
                    type="button"
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-[#7C8691] transition-colors hover:text-[#0A1629]"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="h-10 w-full bg-[#2563EB] text-sm font-semibold text-white hover:bg-[#1E4BB5]"
                disabled={loading}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>

            {env.showDemoCredentials ? (
              <div className="mt-4 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3 text-xs leading-5 text-[#7C8691]">
                <p className="font-semibold text-[#0A1629]">Demo credentials</p>
                <p className="mt-1.5 font-mono text-[#1A3066]">{DEMO_EMAIL}</p>
                <p className="font-mono text-[#1A3066]">{DEMO_PASSWORD}</p>
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  className="mt-2 text-xs font-semibold text-[#2563EB] hover:text-[#1E4BB5]"
                >
                  Use demo login
                </button>
              </div>
            ) : null}
          </div>

          <p className="mt-4 text-center text-xs text-[#9CA3AF]">
            © {year} Cybersave. Authorized personnel only.
          </p>
        </div>
      </div>
    </div>
  );
}
