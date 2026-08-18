import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { PortalNavbar } from '@/components/layout/PortalNavbar';
import { PortalFooter } from '@/components/layout/PortalFooter';
import { AuthModal } from '@/features/auth/components/AuthModal';
import { CompleteProfileModal } from '@/features/profile/components/CompleteProfileModal';
import { SessionGuard } from '@/features/auth/components/SessionGuard';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { servicesApi, servicesQueryKeys } from '@/services/api';

export function PortalLayout() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const hydrate = useAuthStore(s => s.hydrate);
  const queryClient = useQueryClient();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    void queryClient.prefetchQuery({
      queryKey: servicesQueryKeys.catalog(),
      queryFn: () => servicesApi.getServicesCatalog(),
    });
  }, [queryClient]);

  return (
    <div className="flex min-h-dvh flex-col bg-[#F4F7FB]">
      <SessionGuard />
      <PortalNavbar />
      <main className="flex-1">
        {isHome ? (
          <Outlet />
        ) : (
          <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
            <Outlet />
          </div>
        )}
      </main>
      <PortalFooter />
      <AuthModal />
      <CompleteProfileModal />
    </div>
  );
}
