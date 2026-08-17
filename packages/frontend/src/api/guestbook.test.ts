import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from './client'
import {
  createGuestbookEntry,
  getGuestbookEntries,
  shouldRetryGuestbookQuery,
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

describe('guestbook API client', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    fetchMock.mockReset()
    vi.unstubAllGlobals()
  })

  it('fetches and validates a paginated guestbook response while forwarding cancellation', async () => {
    const controller = new AbortController()
    fetchMock.mockResolvedValueOnce(jsonResponse({
      entries: [entry],
      page: { limit: 10, next_cursor: 'next-page' },
    }))

    const page = await getGuestbookEntries({ limit: 10, cursor: 'first-page' }, controller.signal)

    expect(page).toEqual({
      entries: [entry],
      page: { limit: 10, next_cursor: 'next-page' },
    })
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/guestbook?limit=10&cursor=first-page',
      { signal: controller.signal },
    )
  })

  it('rejects malformed successful responses at the typed boundary', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ entries: 'not-an-array' }))

    await expect(getGuestbookEntries()).rejects.toMatchObject({
      name: 'ApiError',
      code: 'invalid_response',
    })
  })

  it('normalizes a rate-limit response and does not retry it', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({
      error: 'Too many guestbook submissions. Try again later.',
      code: 'rate_limited',
      retry_after_seconds: 60,
    }, 429))

    await expect(createGuestbookEntry({
      name: 'Leonardo',
      message: 'Great portfolio!',
      turnstileToken: 'token',
    })).rejects.toMatchObject({
      name: 'ApiError',
      status: 429,
      code: 'rate_limited',
      retryAfterSeconds: 60,
    })

    expect(shouldRetryGuestbookQuery(0, new ApiError({
      status: 429,
      code: 'rate_limited',
      message: 'Too many guestbook submissions. Try again later.',
    }))).toBe(false)
  })

  it('retries one unavailable request but never retries a client validation failure', () => {
    expect(shouldRetryGuestbookQuery(0, new ApiError({
      status: 500,
      code: 'service_unavailable',
      message: 'The guestbook service is unavailable. Please try again later.',
    }))).toBe(true)
    expect(shouldRetryGuestbookQuery(1, new ApiError({
      status: 500,
      code: 'service_unavailable',
      message: 'The guestbook service is unavailable. Please try again later.',
    }))).toBe(false)
    expect(shouldRetryGuestbookQuery(0, new ApiError({
      status: 400,
      code: 'validation_error',
      message: 'name is required.',
    }))).toBe(false)
  })
})
