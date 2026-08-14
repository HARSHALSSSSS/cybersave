import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuthModalStore } from '@/features/auth/store/auth-modal.store';

export function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    useAuthModalStore.getState().openLogin({ requireProfile: true });
    navigate('/', { replace: true });
  }, [navigate]);

  return null;
}
