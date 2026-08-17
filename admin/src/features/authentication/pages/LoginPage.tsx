import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input, Label } from '@/components/ui';
import { useAuthStore } from '../store/auth.store';
import { env } from '@/app/config/env';

const isDev = import.meta.env.VITE_APP_ENV === 'development' || import.meta.env.DEV;
const showDemoCredentials =
  isDev ||
  env.apiBaseUrl.includes('onrender.com') ||
  env.apiBaseUrl.includes('cybersaveonline.com') ||
  env.apiBaseUrl.includes('localhost');

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
      navigate('/dashboard');
    } catch {
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-y-auto bg-[#F4F7FB] px-4 py-16 sm:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-52"
        style={{
          background: 'linear-gradient(180deg, #E8F0FE 0%, rgba(244,247,251,0) 100%)',
        }}
      />

      <div className="relative z-10 my-auto w-full max-w-[420px]">
        <div className="rounded-[28px] border border-[#EEF1F6] bg-white px-7 py-8 shadow-[0_8px_16px_rgba(15,23,42,0.04),0_24px_48px_rgba(37,99,235,0.10)] sm:px-9 sm:py-9">
          <div className="mb-6 flex flex-col items-center text-center">
            <img
              src={`${import.meta.env.BASE_URL}admin-login-logo.png`}
              alt="Cybersave — Digital Services, Trusted Always"
              className="h-auto w-[180px] max-w-full sm:w-[200px]"
              draggable={false}
            />
            <h1 className="mt-4 text-xl font-semibold tracking-tight text-[#0A1629]">
              Admin Console
            </h1>
            <p className="mt-1 text-sm text-[#7C8691]">
              Sign in with your admin credentials
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#0A1629]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="admin@cybersave.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 border-[#E5E7EB] bg-white"
              />
            </div>

            <div className="space-y-2">
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
                  className="h-11 border-[#E5E7EB] bg-white pr-10"
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
              className="h-11 w-full bg-[#2563EB] text-base font-semibold text-white hover:bg-[#1E4BB5]"
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          {showDemoCredentials ? (
            <div className="mt-5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3 text-xs leading-5 text-[#7C8691]">
              <p className="font-semibold text-[#0A1629]">Demo credentials (Render / local)</p>
              <p className="mt-1 font-mono text-[#1A3066]">admin@cybersave.local</p>
              <p className="font-mono text-[#1A3066]">Admin@123456</p>
            </div>
          ) : null}
        </div>

        <p className="mt-5 pb-2 text-center text-xs text-[#9CA3AF]">
          © {year} Cybersave. Authorized personnel only.
        </p>
      </div>
    </div>
  );
}
