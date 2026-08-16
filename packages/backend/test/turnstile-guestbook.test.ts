import { env } from 'cloudflare:workers'
import { createExecutionContext, waitOnExecutionContext } from 'cloudflare:test'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app'

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>

async function submit(
  verification: 'invalid' | 'unavailable',
  token = 'test-token',
): Promise<Response> {
  const worker = createApp(async () => ({ status: verification }))
  const context = createExecutionContext()
  const response = await worker.fetch(
    new IncomingRequest('https://example.test/api/guestbook', {
      method: 'POST',
      headers: {
        'CF-Connecting-IP': '198.51.100.24',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: 'Ada', message: 'Hello', turnstileToken: token }),
    }),
    env,
    context,
  )
  await waitOnExecutionContext(context)
  return response
}

beforeEach(async () => {
  await env.portfolio_db.prepare('DELETE FROM guestbook').run()
})

describe('Turnstile-protected guestbook submissions', () => {
  it('rejects a missing Turnstile token before a guestbook entry is created', async () => {
    const worker = createApp(async () => ({ status: 'valid' }))
    const context = createExecutionContext()
    const response = await worker.fetch(
      new IncomingRequest('https://example.test/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Ada', message: 'Hello' }),
      }),
      env,
      context,
    )
    await waitOnExecutionContext(context)

    expect(response.status).toBe(400)
    expect(await response.json()).toMatchObject({ code: 'validation_error' })
    expect((await env.portfolio_db.prepare('SELECT COUNT(*) AS count FROM guestbook').first<{ count: number }>())?.count).toBe(0)
  })

  it('rejects an invalid or reused Turnstile token before a guestbook entry is created', async () => {
    const response = await submit('invalid')

    expect(response.status).toBe(400)
    expect(await response.json()).toMatchObject({ code: 'turnstile_verification_failed' })
    expect((await env.portfolio_db.prepare('SELECT COUNT(*) AS count FROM guestbook').first<{ count: number }>())?.count).toBe(0)
  })

  it('fails safely when Turnstile verification is unavailable', async () => {
    const response = await submit('unavailable')

    expect(response.status).toBe(500)
    expect(await response.json()).toMatchObject({ code: 'service_unavailable' })
    expect((await env.portfolio_db.prepare('SELECT COUNT(*) AS count FROM guestbook').first<{ count: number }>())?.count).toBe(0)
  })
})
