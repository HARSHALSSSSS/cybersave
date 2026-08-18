import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { RazorpayCheckoutHost } from '@/components/payments/RazorpayCheckoutHost';

/** Retrying a rejection the server already decided on only adds latency. */
function isClientError(error: unknown): boolean {
  const status = (error as { response?: { status?: number } })?.response?.status;
  return typeof status === 'number' && status >= 400 && status < 500;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => failureCount < 1 && !isClientError(error),
      retryDelay: attempt => Math.min(500 * 2 ** attempt, 2000),
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
