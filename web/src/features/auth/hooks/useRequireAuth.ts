import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useAuthModalStore } from '@/features/auth/store/auth-modal.store';
import { isProfileComplete } from '@/lib/profile';

export function useRequireAuth() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const citizen = useAuthStore(s => s.citizen);
  const openLogin = useAuthModalStore(s => s.openLogin);
  const openProfile = useAuthModalStore(s => s.openProfile);

  return useCallback(
    (
      action: () => void,
      options?: {
        redirectTo?: string;
        requireProfile?: boolean;
        profileMandatory?: boolean;
      },
    ) => {
      const requireProfile = options?.requireProfile ?? true;

      if (!isAuthenticated) {
        openLogin({
          redirectTo: options?.redirectTo,
          onSuccess: action,
          requireProfile,
          profileMandatory: options?.profileMandatory,
        });
        return false;
      }

      if (requireProfile && !isProfileComplete(citizen)) {
        openProfile({
          onSuccess: action,
          mandatory: options?.profileMandatory ?? true,
        });
        return false;
      }

      action();
      return true;
    },
    [isAuthenticated, citizen, openLogin, openProfile],
  );
}

export function useRequireAuthNavigate() {
  const navigate = useNavigate();
  const requireAuth = useRequireAuth();

  return useCallback(
    (path: string, options?: { requireProfile?: boolean }) => {
      requireAuth(() => navigate(path), { redirectTo: path, ...options });
    },
    [requireAuth, navigate],
  );
}
