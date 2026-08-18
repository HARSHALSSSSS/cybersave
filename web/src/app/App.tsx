import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { AppProviders } from '@/app/providers/AppProviders';
import { prefetchCommonRoutes, router } from '@/app/router';

export default function App() {
  useEffect(() => {
    prefetchCommonRoutes();
  }, []);

  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
