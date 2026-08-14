import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { PortalNavbar } from '@/components/layout/PortalNavbar';
import { PortalFooter } from '@/components/layout/PortalFooter';
import { AuthModal } from '@/features/auth/components/AuthModal';
import { SessionGuard } from '@/features/auth/components/SessionGuard';
import { useAuthStore } from '@/features/auth/store/auth.store';

export function PortalLayout() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const hydrate = useAuthStore(s => s.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <div className="flex min-h-dvh flex-col bg-[#F8FAFC]">
      <SessionGuard />
      <PortalNavbar />
      <main className="flex-1">
        {isHome ? (
          <Outlet />
        ) : (
          <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        )}
      </main>
      <PortalFooter />
      <AuthModal />
    </div>
  );
}
