import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/** Retrying a rejection the server already decided on only adds latency. */
function isClientError(error: unknown): boolean {
  const status = (error as { response?: { status?: number } })?.response?.status;
  return typeof status === 'number' && status >= 400 && status < 500;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Render cold starts — retry with backoff but show cached data immediately.
      retry: (failureCount, error) => failureCount < 1 && !isClientError(error),
      retryDelay: attempt => Math.min(400 * 2 ** attempt, 2000),
      staleTime: 1000 * 60 * 15,
      gcTime: 1000 * 60 * 60,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      networkMode: 'offlineFirst',
      placeholderData: (previous: unknown) => previous,
    },
  },
});

export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);
