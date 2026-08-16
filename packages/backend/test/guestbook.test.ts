import { env } from 'cloudflare:workers'
import { createExecutionContext, waitOnExecutionContext } from 'cloudflare:test'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app'

type ApiError = {
  code: string
  error: string
  retry_after_seconds?: number
}

type GuestbookEntry = {
  id: number
  name: string
  message: string
  created_at: string
}

type GuestbookPage = {
  entries: GuestbookEntry[]
  page: {
    limit: number
    next_cursor: string | null
  }
}

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>
const worker = createApp(async () => ({ status: 'valid' }))

async function request(path: string, init?: RequestInit, app = worker): Promise<Response> {
  const context = createExecutionContext()
  const response = await app.fetch(new IncomingRequest(`https://example.test${path}`, init), env, context)
  await waitOnExecutionContext(context)
  return response
}

async function postGuestbook(payload: unknown, ip = '198.51.100.10') {
  return request('/api/guestbook', {
    method: 'POST',
    headers: {
      'CF-Connecting-IP': ip,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...payload, turnstileToken: 'test-token' }),
  })
}

async function guestbookCount() {
  const result = await env.portfolio_db.prepare('SELECT COUNT(*) as count FROM guestbook').first<{ count: number }>()
  return result?.count ?? 0
}

beforeEach(async () => {
  await env.portfolio_db.prepare('DELETE FROM guestbook').run()

  for (const [name, message, createdAt] of [
    ['Ada', 'Oldest entry', '2026-01-01T00:00:00.000Z'],
    ['Grace', 'Second entry', '2026-01-02T00:00:00.000Z'],
    ['Linus', 'Third entry', '2026-01-03T00:00:00.000Z'],
    ['Margaret', 'Newest entry', '2026-01-04T00:00:00.000Z'],
  ]) {
    await env.portfolio_db
      .prepare('INSERT INTO guestbook (name, message, created_at) VALUES (?, ?, ?)')
      .bind(name, message, createdAt)
      .run()
  }
})

describe('guestbook public-content contract', () => {
  it('returns deterministic newest-first pages with an opaque continuation cursor', async () => {
    const initial = await request('/api/guestbook?limit=2')
    expect(initial.status).toBe(200)

    const firstPage = (await initial.json()) as GuestbookPage
    expect(firstPage.entries.map((entry) => entry.name)).toEqual(['Margaret', 'Linus'])
    expect(firstPage.page.limit).toBe(2)
    expect(firstPage.page.next_cursor).toEqual(expect.any(String))

    const continuation = await request(`/api/guestbook?limit=2&cursor=${encodeURIComponent(firstPage.page.next_cursor!)}`)
    expect(continuation.status).toBe(200)

    const secondPage = (await continuation.json()) as GuestbookPage
    expect(secondPage.entries.map((entry) => entry.name)).toEqual(['Grace', 'Ada'])
    expect(secondPage.page.next_cursor).toBeNull()
  })

  it('returns structured validation errors for invalid limits and malformed cursors', async () => {
    const invalidLimit = await request('/api/guestbook?limit=0')
    expect(invalidLimit.status).toBe(400)
    expect((await invalidLimit.json()) as ApiError).toMatchObject({ code: 'invalid_limit' })

    const invalidCursor = await request('/api/guestbook?cursor=not-a-cursor')
    expect(invalidCursor.status).toBe(400)
    expect((await invalidCursor.json()) as ApiError).toMatchObject({ code: 'invalid_cursor' })
  })

  it('persists trimmed submissions and returns the serialized record first in a following newest-first page', async () => {
    const response = await postGuestbook(
      { name: '  New visitor  ', message: '  A persisted, trimmed message.  ' },
      '198.51.100.61',
    )

    expect(response.status).toBe(201)
    expect((await response.json()) as GuestbookEntry).toMatchObject({
      name: 'New visitor',
      message: 'A persisted, trimmed message.',
    })
    expect(await guestbookCount()).toBe(5)

    const page = await request('/api/guestbook?limit=5')
    expect(page.status).toBe(200)
    expect(((await page.json()) as GuestbookPage).entries[0]).toMatchObject({
      name: 'New visitor',
      message: 'A persisted, trimmed message.',
    })
  })

  it('accepts exact maximum-length plain-text fields', async () => {
    const response = await postGuestbook(
      { name: 'n'.repeat(50), message: 'm'.repeat(280) },
      '198.51.100.62',
    )

    expect(response.status).toBe(201)
    expect((await response.json()) as GuestbookEntry).toMatchObject({
      name: 'n'.repeat(50),
      message: 'm'.repeat(280),
    })
  })

  it('rejects malformed, missing, and boundary-length submissions without writing to D1', async () => {
    const initialCount = await guestbookCount()
    const invalidJson = await request('/api/guestbook', {
      method: 'POST',
      headers: { 'CF-Connecting-IP': '198.51.100.62', 'Content-Type': 'application/json' },
      body: '{not-json',
    })
    expect(invalidJson.status).toBe(400)
    expect((await invalidJson.json()) as ApiError).toMatchObject({ code: 'invalid_json' })

    const missingMessage = await postGuestbook({ name: 'Ada' }, '198.51.100.63')
    expect(missingMessage.status).toBe(400)
    expect((await missingMessage.json()) as ApiError).toMatchObject({
      code: 'validation_error',
      details: { field: 'message' },
    })

    const longName = await postGuestbook({ name: 'a'.repeat(51), message: 'Hello' }, '198.51.100.64')
    expect(longName.status).toBe(400)
    expect((await longName.json()) as ApiError).toMatchObject({
      code: 'validation_error',
      details: { field: 'name', max_length: 50 },
    })

    const longMessage = await postGuestbook({ name: 'Ada', message: 'a'.repeat(281) }, '198.51.100.65')
    expect(longMessage.status).toBe(400)
    expect((await longMessage.json()) as ApiError).toMatchObject({
      code: 'validation_error',
      details: { field: 'message', max_length: 280 },
    })

    expect(await guestbookCount()).toBe(initialCount)
  })

  it('returns CORS headers only for approved origins', async () => {
    const allowedOrigin = 'https://2000sme.cavazzanileonardo.workers.dev'
    const allowed = await request('/api/guestbook', { headers: { Origin: allowedOrigin } })
    expect(allowed.headers.get('Access-Control-Allow-Origin')).toBe(allowedOrigin)

    const preflight = await request('/api/guestbook', {
      method: 'OPTIONS',
      headers: {
        Origin: allowedOrigin,
        'Access-Control-Request-Method': 'POST',
      },
    })
    expect(preflight.headers.get('Access-Control-Allow-Origin')).toBe(allowedOrigin)
    expect(preflight.headers.get('Access-Control-Allow-Methods')).toContain('POST')

    const unapproved = await request('/api/guestbook', { headers: { Origin: 'https://unapproved.example' } })
    expect(unapproved.headers.get('Access-Control-Allow-Origin')).toBeNull()
  })

  it('accepts plain text only and rejects presentational guestbook fields', async () => {
    const decorated = await postGuestbook({
      name: 'Ada',
      message: 'Hello',
      imageUrl: 'https://example.test/avatar.png',
      cardStyle: 'color: hotpink',
    })
    expect(decorated.status).toBe(400)
    expect((await decorated.json()) as ApiError).toMatchObject({ code: 'validation_error' })

    const plainText = await postGuestbook({
      name: '<b>Ada</b>',
      message: '<img src=x onerror=alert(1)> This remains text.',
    })
    expect(plainText.status).toBe(201)
    expect((await plainText.json()) as GuestbookEntry).toMatchObject({
      name: '<b>Ada</b>',
      message: '<img src=x onerror=alert(1)> This remains text.',
    })
  })

  it('returns a distinguishable rate-limit error with retry guidance', async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      expect((await postGuestbook({ name: `Visitor ${attempt}`, message: 'Hello' })).status).toBe(201)
    }

    const limited = await postGuestbook({ name: 'Visitor 6', message: 'Hello' })
    expect(limited.status).toBe(429)
    expect(limited.headers.get('Retry-After')).toBe('60')
    expect((await limited.json()) as ApiError).toMatchObject({
      code: 'rate_limited',
      retry_after_seconds: 60,
    })
  })

  it('bounds oversized request bodies before parsing JSON', async () => {
    const oversized = await request('/api/guestbook', {
      method: 'POST',
      headers: {
        'CF-Connecting-IP': '198.51.100.99',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: 'Ada', message: 'x'.repeat(5_000), turnstileToken: 'test-token' }),
    })

    expect(oversized.status).toBe(413)
    expect((await oversized.json()) as ApiError).toMatchObject({ code: 'payload_too_large' })
  })

  it('returns a structured service error when the guestbook query cannot run', async () => {
    await env.portfolio_db.prepare('DROP TABLE guestbook').run()

    const response = await request('/api/guestbook')
    expect(response.status).toBe(500)
    expect((await response.json()) as ApiError).toMatchObject({ code: 'service_unavailable' })
  })
})
