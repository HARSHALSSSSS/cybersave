import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAuthModalStore } from '@/features/auth/store/auth-modal.store';

export function OtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const phone = (location.state as { phone?: string } | null)?.phone ?? '';

  useEffect(() => {
    const store = useAuthModalStore.getState();
    if (phone) {
      store.openLogin({ requireProfile: true });
      store.setPhone(phone);
      store.setStep('otp');
    } else {
      store.openLogin({ requireProfile: true });
    }
    navigate('/', { replace: true });
  }, [navigate, phone]);

  return null;
}
