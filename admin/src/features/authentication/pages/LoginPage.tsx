import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input, Label } from '@/components/ui';
import { useAuthStore } from '../store/auth.store';
import { env } from '@/app/config/env';

const isDev = import.meta.env.VITE_APP_ENV === 'development' || import.meta.env.DEV;
const showDemoCredentials =
  isDev || env.apiBaseUrl.includes('onrender.com') || env.apiBaseUrl.includes('localhost');

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
    <div className="flex min-h-dvh bg-white">
      {/* Brand panel — matches mobile header gradient + logo */}
      <aside
        className="relative hidden w-[46%] shrink-0 overflow-hidden lg:flex lg:flex-col lg:items-center lg:justify-center lg:px-12 xl:px-16"
        style={{
          background: 'linear-gradient(165deg, #1A3B8B 0%, #2563EB 52%, #357AF6 100%)',
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35), transparent 45%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.2), transparent 40%)',
          }}
        />

        <div className="relative z-10 flex max-w-md flex-col items-center text-center">
          <img
            src="/brand-logo.png"
            alt="Cybersave — Digital Services, Trusted Always"
            className="h-auto w-full max-w-[280px] drop-shadow-[0_12px_32px_rgba(0,0,0,0.18)]"
            width={280}
            height={280}
          />
          <p className="mt-8 text-lg font-medium tracking-wide text-white/95">
            Admin Console
          </p>
          <p className="mt-3 max-w-xs text-sm leading-6 text-white/75">
            Manage citizen services, applications, and operations from one secure workspace.
          </p>
        </div>

        <p className="absolute bottom-8 text-xs text-white/50">
          © {year} Cybersave. Authorized personnel only.
        </p>
      </aside>

      {/* Sign-in panel */}
      <main className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-10 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-[400px]">
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <img
              src="/brand-logo.png"
              alt="Cybersave"
              className="h-auto w-[200px]"
              width={200}
              height={200}
            />
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-[#0A1629]">
              Sign in
            </h1>
            <p className="mt-2 text-sm text-[#7C8691]">
              Enter your admin credentials to access the dashboard.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
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
            <div className="mt-6 rounded-lg border border-[#E5E7EB] bg-[#F2F4F7] px-4 py-3 text-xs leading-5 text-[#7C8691]">
              <p className="font-semibold text-[#0A1629]">Demo credentials (Render / local)</p>
              <p className="mt-1 font-mono text-[#1A3066]">
                admin@cybersave.local
              </p>
              <p className="font-mono text-[#1A3066]">Admin@123456</p>
            </div>
          ) : null}

          <p className="mt-8 text-center text-xs text-[#9CA3AF] lg:hidden">
            © {year} Cybersave. Authorized personnel only.
          </p>
        </div>
      </main>
    </div>
  );
}
