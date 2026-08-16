import { QueryClient } from '@tanstack/react-query'
import { shouldRetryGuestbookQuery } from './guestbook'

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: shouldRetryGuestbookQuery,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

export const appQueryClient = createAppQueryClient()
