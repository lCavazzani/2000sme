import { describe, expect, it } from 'vitest'
import { validateTurnstileToken } from '../src/domains/guestbook/turnstile.service'

describe('Turnstile Siteverify client', () => {
  it('accepts a successful guestbook verification and sends the token with the visitor IP', async () => {
    const result = await validateTurnstileToken(
      'valid-token',
      'test-secret',
      '198.51.100.20',
      async (input, init) => {
        expect(input).toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify')
        expect(init?.method).toBe('POST')

        const request = new Request(input, init)
        const body = await request.formData()
        expect(body.get('secret')).toBe('test-secret')
        expect(body.get('response')).toBe('valid-token')
        expect(body.get('remoteip')).toBe('198.51.100.20')

        return Response.json({ success: true, action: 'guestbook' })
      },
    )

    expect(result).toEqual({ status: 'valid' })
  })

  it('rejects an invalid, expired, reused, or wrong-action verification result', async () => {
    const result = await validateTurnstileToken('reused-token', 'test-secret', undefined, async () =>
      Response.json({ success: false, 'error-codes': ['timeout-or-duplicate'] }),
    )

    expect(result).toEqual({ status: 'invalid' })
  })

  it('fails closed when the secret is absent or Siteverify is unavailable', async () => {
    expect(await validateTurnstileToken('token', undefined, undefined)).toEqual({ status: 'unavailable' })
    expect(
      await validateTurnstileToken('token', 'test-secret', undefined, async () => new Response(null, { status: 503 })),
    ).toEqual({ status: 'unavailable' })
  })
})
