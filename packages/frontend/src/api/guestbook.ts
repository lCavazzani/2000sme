import { type InfiniteData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { guestbookApiUrl } from '../config/api'
import { ApiError, isApiError, requestJson } from './client'

export const DEFAULT_GUESTBOOK_PAGE_LIMIT = 20

export type GuestbookEntry = {
  id: number | string
  name: string
  message: string
  created_at: string
}

export type GuestbookPage = {
  entries: GuestbookEntry[]
  page: {
    limit: number
    next_cursor: string | null
  }
}

export type GuestbookPageRequest = {
  limit?: number
  cursor?: string
}

export type CreateGuestbookEntryInput = {
  name: string
  message: string
  turnstileToken: string
}

type GuestbookFeedData = InfiniteData<GuestbookPage, string | null>

let optimisticSequence = 0

export const guestbookQueryKeys = {
  all: ['guestbook'] as const,
  page: (request: GuestbookPageRequest = {}) => [
    'guestbook',
    'page',
    request.limit ?? DEFAULT_GUESTBOOK_PAGE_LIMIT,
    request.cursor ?? null,
  ] as const,
  feedRoot: ['guestbook', 'feed'] as const,
  feed: (limit = DEFAULT_GUESTBOOK_PAGE_LIMIT) => ['guestbook', 'feed', limit] as const,
}

export async function getGuestbookEntries(
  request: GuestbookPageRequest = {},
  signal?: AbortSignal,
): Promise<GuestbookPage> {
  const parameters = new URLSearchParams({ limit: String(request.limit ?? DEFAULT_GUESTBOOK_PAGE_LIMIT) })
  if (request.cursor) parameters.set('cursor', request.cursor)

  return requestJson({
    url: `${guestbookApiUrl}?${parameters.toString()}`,
    init: { signal },
    parse: parseGuestbookPage,
  })
}

export async function createGuestbookEntry(input: CreateGuestbookEntryInput): Promise<GuestbookEntry> {
  return requestJson({
    url: guestbookApiUrl,
    init: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
    parse: parseGuestbookEntry,
  })
}

export function useGuestbookEntries(request: GuestbookPageRequest = {}) {
  const queryKey = guestbookQueryKeys.page(request)

  return useQuery({
    queryKey,
    queryFn: ({ signal }) => getGuestbookEntries(request, signal),
    staleTime: 30_000,
    retry: (failureCount, error) => shouldRetryGuestbookQuery(failureCount, error),
  })
}

export function useInfiniteGuestbookEntries(limit = DEFAULT_GUESTBOOK_PAGE_LIMIT) {
  return useInfiniteQuery({
    queryKey: guestbookQueryKeys.feed(limit),
    initialPageParam: null as string | null,
    queryFn: ({ pageParam, signal }) => getGuestbookEntries({ limit, cursor: pageParam ?? undefined }, signal),
    getNextPageParam: (lastPage) => lastPage.page.next_cursor,
    staleTime: 30_000,
    retry: (failureCount, error) => shouldRetryGuestbookQuery(failureCount, error),
  })
}

export function useCreateGuestbookEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createGuestbookEntry,
    retry: false,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: guestbookQueryKeys.feedRoot })
      const previousFeeds = queryClient.getQueriesData<GuestbookFeedData>({ queryKey: guestbookQueryKeys.feedRoot })
      const optimisticId = `optimistic-${Date.now()}-${++optimisticSequence}`
      const optimisticEntry: GuestbookEntry = {
        id: optimisticId,
        name: input.name,
        message: input.message,
        created_at: new Date().toISOString(),
      }

      queryClient.setQueriesData<GuestbookFeedData>({ queryKey: guestbookQueryKeys.feedRoot }, (current) => {
        if (!current || current.pages.length === 0) return current
        const [firstPage, ...remainingPages] = current.pages
        return {
          ...current,
          pages: [
            {
              ...firstPage,
              entries: [optimisticEntry, ...firstPage.entries].slice(0, firstPage.page.limit),
            },
            ...remainingPages,
          ],
        }
      })

      return { optimisticId, previousFeeds }
    },
    onError: (_error, _input, context) => {
      context?.previousFeeds.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data))
    },
    onSuccess: (entry, _input, context) => {
      queryClient.setQueriesData<GuestbookFeedData>({ queryKey: guestbookQueryKeys.feedRoot }, (current) => {
        if (!current) return current
        return {
          ...current,
          pages: current.pages.map((page) => ({
            ...page,
            entries: page.entries.map((candidate) => candidate.id === context?.optimisticId ? entry : candidate),
          })),
        }
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: guestbookQueryKeys.all })
    },
  })
}

export function shouldRetryGuestbookQuery(failureCount: number, error: unknown): boolean {
  if (isApiError(error)) return error.status >= 500 && failureCount < 1
  return error instanceof TypeError && failureCount < 1
}

export function guestbookErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.code === 'rate_limited' && error.retryAfterSeconds) {
      return `Too many guestbook submissions. Try again in ${error.retryAfterSeconds} seconds.`
    }
    return error.message
  }

  return 'The guestbook request could not be completed. Please try again later.'
}

function parseGuestbookPage(value: unknown): GuestbookPage {
  if (!isRecord(value) || !Array.isArray(value.entries) || !isRecord(value.page)) {
    throw invalidResponse()
  }

  const entries = value.entries.map(parseGuestbookEntry)
  const { limit, next_cursor: nextCursor } = value.page

  if (typeof limit !== 'number' || !Number.isInteger(limit) || limit < 1 || (nextCursor !== null && typeof nextCursor !== 'string')) {
    throw invalidResponse()
  }

  return { entries, page: { limit, next_cursor: nextCursor } }
}

function parseGuestbookEntry(value: unknown): GuestbookEntry {
  if (
    !isRecord(value)
    || typeof value.id !== 'number'
    || !Number.isInteger(value.id)
    || typeof value.name !== 'string'
    || typeof value.message !== 'string'
    || typeof value.created_at !== 'string'
  ) {
    throw invalidResponse()
  }

  return {
    id: value.id,
    name: value.name,
    message: value.message,
    created_at: value.created_at,
  }
}

function invalidResponse(): ApiError {
  return new ApiError({
    status: 200,
    code: 'invalid_response',
    message: 'The guestbook service returned an invalid response. Please try again later.',
  })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}
