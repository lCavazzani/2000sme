import { QueryClient } from '@tanstack/react-query'

/**
 * The project catalog is served with `max-age=300` and changes only on deploy,
 * so a matching client-side staleness window avoids refetching on every window
 * open. Retries stay low: a PixelOS application window should surface a failure
 * quickly rather than hold a spinner.
 */
export const appQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
