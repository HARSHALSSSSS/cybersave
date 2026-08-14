import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { BrandMark } from '@/components/brand/BrandMark';
import { Button } from '@/components/ui/button';
import { useAuthModalStore } from '@/features/auth/store/auth-modal.store';
import { useAuthStore } from '@/features/auth/store/auth.store';

export function ProtectedRoute() {
  const location = useLocation();
  const hydrate = useAuthStore(s => s.hydrate);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const isLoading = useAuthStore(s => s.isLoading);
  const openLogin = useAuthModalStore(s => s.openLogin);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      openLogin({
        redirectTo: location.pathname + location.search,
        requireProfile: true,
        profileMandatory: false,
      });
    }
  }, [isAuthenticated, isLoading, location.pathname, location.search, openLogin]);

  if (isLoading && !isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <BrandMark linked={false} />
        <p className="text-sm text-[#64748B]">Loading your session…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <BrandMark linked={false} />
        <h2 className="font-display text-xl font-bold text-[#0A1629]">Sign in to continue</h2>
        <p className="text-sm leading-6 text-[#64748B]">
          Login with your mobile number to start or resume this application. Your progress is saved
          securely.
        </p>
        <Button
          size="lg"
          className="w-full max-w-xs"
          onClick={() =>
            openLogin({
              redirectTo: location.pathname + location.search,
              requireProfile: true,
              profileMandatory: false,
            })
          }
        >
          Sign in with OTP
        </Button>
      </div>
    );
  }

  return <Outlet />;
}
