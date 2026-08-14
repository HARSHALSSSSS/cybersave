import { useEffect } from 'react';
import { toast } from 'sonner';
import { useAuthModalStore } from '@/features/auth/store/auth-modal.store';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { setSessionExpiredHandler } from '@/services/api/client';

export function SessionGuard() {
  const forceLogout = useAuthStore(s => s.forceLogout);
  const openLogin = useAuthModalStore(s => s.openLogin);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      forceLogout();
      toast.error('Session expired. Please sign in again.');
      openLogin({ requireProfile: true });
    });
    return () => setSessionExpiredHandler(() => undefined);
  }, [forceLogout, openLogin]);

  return null;
}
