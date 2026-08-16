import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  guestbookQueryKeys,
  useCreateGuestbookEntry,
  useGuestbookEntries,
} from './guestbook'

const fetchMock = vi.fn()
const entry = {
  id: 1,
  name: 'Leonardo',
  message: 'Great portfolio!',
  created_at: '2026-08-16T12:00:00.000Z',
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function createWrapper(queryClient: QueryClient) {
  return function QueryWrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  })
}

describe('Guestbook TanStack Query hooks', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    fetchMock.mockReset()
    vi.unstubAllGlobals()
  })

  it('returns validated entries through the shared query key', async () => {
    const queryClient = createTestQueryClient()
    fetchMock.mockResolvedValueOnce(jsonResponse({
      entries: [entry],
      page: { limit: 20, next_cursor: null },
    }))

    const { result } = renderHook(() => useGuestbookEntries(), { wrapper: createWrapper(queryClient) })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.entries).toEqual([entry])
    expect(queryClient.getQueryData(guestbookQueryKeys.page())).toEqual(result.current.data)
  })

  it('passes TanStack Query cancellation to fetch through the AbortSignal', async () => {
    const queryClient = createTestQueryClient()
    let signal: AbortSignal | undefined

    fetchMock.mockImplementationOnce((_url: string, init?: RequestInit) => {
      signal = init?.signal as AbortSignal | undefined
      return new Promise<Response>((_resolve, reject) => {
        signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
      })
    })

    renderHook(() => useGuestbookEntries(), { wrapper: createWrapper(queryClient) })
    await waitFor(() => expect(signal).toBeDefined())

    await act(async () => {
      await queryClient.cancelQueries({ queryKey: guestbookQueryKeys.page() })
    })

    expect(signal?.aborted).toBe(true)
  })

  it('exposes a failed mutation without retrying a client error', async () => {
    const queryClient = createTestQueryClient()
    fetchMock.mockResolvedValueOnce(jsonResponse({
      error: 'Please complete the verification and try again.',
      code: 'turnstile_verification_failed',
    }, 400))

    const { result } = renderHook(() => useCreateGuestbookEntry(), { wrapper: createWrapper(queryClient) })

    await expect(result.current.mutateAsync({
      name: 'Leonardo',
      message: 'Great portfolio!',
      turnstileToken: 'expired-token',
    })).rejects.toMatchObject({ code: 'turnstile_verification_failed', status: 400 })

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('invalidates guestbook pages after a successful mutation so the visible list refreshes from the server', async () => {
    const queryClient = createTestQueryClient()
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
    fetchMock.mockResolvedValueOnce(jsonResponse(entry, 201))

    const { result } = renderHook(() => useCreateGuestbookEntry(), { wrapper: createWrapper(queryClient) })

    await act(async () => {
      await result.current.mutateAsync({
        name: 'Leonardo',
        message: 'Great portfolio!',
        turnstileToken: 'verified-token',
      })
    })

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: guestbookQueryKeys.all })
  })
})
