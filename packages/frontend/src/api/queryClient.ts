import { QueryClient } from '@tanstack/react-query'

/**
 * The catalog is served with `max-age=300`, so a matching client staleness
 * window avoids refetching every time a window opens. D1 content can change
 * independently of a frontend deploy (an approved seed or maintenance run), so
 * this is a cache-freshness choice, not a guarantee that the data is static.
 *
 * `gcTime` is deliberately much longer than `staleTime`: a cached catalog is
 * what My Machine falls back to when the Worker becomes unreachable.
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
