import { QueryClient } from '@tanstack/react-query'

function shouldRetryApplicationQuery(failureCount: number, error: unknown) {
  const status = typeof error === 'object' && error !== null && 'status' in error
    ? Number(error.status)
    : undefined

  return failureCount < 1 && status !== 400 && status !== 401 && status !== 403 && status !== 404
}

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: shouldRetryApplicationQuery,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

export const appQueryClient = createAppQueryClient()
