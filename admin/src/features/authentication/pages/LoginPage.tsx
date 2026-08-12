import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react';
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
    <div className="relative min-h-dvh overflow-hidden bg-[#07111f] text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 15% 20%, rgba(14,116,144,0.45), transparent 55%), radial-gradient(ellipse 70% 50% at 85% 80%, rgba(37,99,235,0.28), transparent 50%), linear-gradient(160deg, #07111f 0%, #0b1f3a 48%, #0a1628 100%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.55) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 75%)',
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-6xl flex-col lg:flex-row">
        <section className="flex flex-1 flex-col justify-between px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
          <div>
            <p className="font-[family-name:var(--font-login-display)] text-3xl tracking-tight text-white sm:text-4xl">
              Cybersave
            </p>
            <p className="mt-2 max-w-sm text-sm leading-6 text-white/65">
              Secure operations console for digital citizen services.
            </p>
          </div>

          <div className="mt-12 max-w-lg lg:mt-0">
            <h1 className="font-[family-name:var(--font-login-display)] text-4xl leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
              Govern services with clarity and control.
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-white/70">
              Publish service versions, review applications, and keep every operator action
              auditable — from one trusted workspace.
            </p>

            <ul className="mt-10 space-y-4">
              {[
                'Role-based access for admins and operators',
                'Versioned services with publish validation',
                'Full application workflow and audit trail',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-white/80">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-400/15 text-cyan-300">
                    <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.25} />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-12 hidden text-xs text-white/40 lg:block">
            © {year} Cybersave. Authorized personnel only.
          </p>
        </section>

        <section className="flex flex-1 items-center justify-center px-6 pb-12 sm:px-10 lg:px-14 lg:py-14">
          <div className="w-full max-w-[420px] rounded-2xl border border-white/10 bg-white/[0.06] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
            <div className="mb-8">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-300">
                <LockKeyhole className="h-5 w-5" strokeWidth={2} />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">Sign in</h2>
              <p className="mt-1.5 text-sm text-white/55">
                Use your Cybersave admin credentials to continue.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="you@organization.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 border-white/15 bg-white/95 text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80">
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
                    className="h-11 border-white/15 bg-white/95 pr-10 text-foreground placeholder:text-muted-foreground"
                  />
                  <button
                    type="button"
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="h-11 w-full bg-cyan-500 text-base font-semibold text-[#042f2e] hover:bg-cyan-400"
                disabled={loading}
              >
                {loading ? 'Signing in…' : 'Sign in to Admin'}
              </Button>
            </form>

            {showDemoCredentials ? (
              <div className="mt-6 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-xs leading-5 text-white/55">
                <p className="font-medium text-white/75">Demo credentials</p>
                <p className="mt-1">
                  `admin@cybersave.local` / `Admin@123456`
                </p>
              </div>
            ) : null}

            <p className="mt-6 text-center text-xs text-white/40 lg:hidden">
              © {year} Cybersave. Authorized personnel only.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
