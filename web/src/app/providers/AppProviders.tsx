import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { RazorpayCheckoutHost } from '@/components/payments/RazorpayCheckoutHost';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 15,
      gcTime: 1000 * 60 * 60,
      refetchOnWindowFocus: false,
      placeholderData: (previous: unknown) => previous,
    },
  },
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <RazorpayCheckoutHost />
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  );
}
