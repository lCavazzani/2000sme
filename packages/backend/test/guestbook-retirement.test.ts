import { env } from 'cloudflare:workers'
import { createExecutionContext, waitOnExecutionContext } from 'cloudflare:test'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app'

type RetiredGuestbookError = {
  code: string
  error: string
}

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>
const worker = createApp()

async function request(path: string, init?: RequestInit): Promise<Response> {
  const context = createExecutionContext()
  const response = await worker.fetch(new IncomingRequest(`https://example.test${path}`, init), env, context)
  await waitOnExecutionContext(context)
  return response
}

async function guestbookCount() {
  const result = await env.portfolio_db.prepare('SELECT COUNT(*) as count FROM guestbook').first<{ count: number }>()
  return result?.count ?? 0
}

beforeEach(async () => {
  await env.portfolio_db.prepare('DELETE FROM guestbook').run()
  await env.portfolio_db
    .prepare('INSERT INTO guestbook (name, message, created_at) VALUES (?, ?, ?)')
    .bind('Archived visitor', 'This record must remain retained.', '2026-08-19T00:00:00.000Z')
    .run()
})

describe('guestbook retirement contract', () => {
  it('returns the documented no-store 410 response for retired public reads and preserves stored records', async () => {
    const before = await guestbookCount()

    const response = await request('/api/guestbook?limit=50')

    expect(response.status).toBe(410)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect((await response.json()) as RetiredGuestbookError).toMatchObject({
      code: 'guestbook_retired',
      error: 'The public guestbook has been retired as part of the PixelOS transition.',
    })
    expect(await guestbookCount()).toBe(before)
  })

  it('rejects public submission attempts before validation, Turnstile, KV, or D1 writes', async () => {
    const before = await guestbookCount()

    const response = await request('/api/guestbook', {
      method: 'POST',
      headers: {
        'CF-Connecting-IP': '198.51.100.10',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'New visitor',
        message: 'This must not be stored.',
        turnstileToken: 'retired-contract-token',
      }),
    })

    expect(response.status).toBe(410)
    expect((await response.json()) as RetiredGuestbookError).toMatchObject({ code: 'guestbook_retired' })
    expect(await guestbookCount()).toBe(before)
  })

  it('does not expose an alternate destructive method and retains global CORS policy', async () => {
    const before = await guestbookCount()
    const origin = 'https://2000sme.cavazzanileonardo.workers.dev'

    const response = await request('/api/guestbook/legacy-entry', {
      method: 'DELETE',
      headers: { Origin: origin },
    })

    expect(response.status).toBe(410)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(origin)
    expect((await response.json()) as RetiredGuestbookError).toMatchObject({ code: 'guestbook_retired' })
    expect(await guestbookCount()).toBe(before)
  })
})
