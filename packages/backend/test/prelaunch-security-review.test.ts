import { describe, expect, it } from 'vitest'
import { createApp } from '../src/app'

describe('SEC-9 pre-launch public security contract', () => {
  it('allows only approved browser origins and keeps the preflight method/header surface narrow', async () => {
    const app = createApp()

    const allowed = await app.request('https://api.example.test/api/health', {
      headers: { Origin: 'https://2000sme.cavazzanileonardo.workers.dev' },
    })
    expect(allowed.headers.get('Access-Control-Allow-Origin')).toBe('https://2000sme.cavazzanileonardo.workers.dev')

    const denied = await app.request('https://api.example.test/api/health', {
      headers: { Origin: 'https://untrusted.example' },
    })
    expect(denied.headers.get('Access-Control-Allow-Origin')).toBeNull()

    const preflight = await app.request('https://api.example.test/api/health', {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://2000sme.cavazzanileonardo.workers.dev',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    })
    expect(preflight.headers.get('Access-Control-Allow-Methods')).toBe('GET,POST,OPTIONS')
    expect(preflight.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type')
  })

  it('returns retired or unavailable public API responses without raw storage diagnostics', async () => {
    const app = createApp()

    const guestbook = await app.request('https://api.example.test/api/guestbook')
    expect(guestbook.status).toBe(410)
    expect(await guestbook.json()).toEqual({
      error: 'The public guestbook has been retired as part of the PixelOS transition.',
      code: 'guestbook_retired',
    })

    const catalogFailure = await app.request('https://api.example.test/api/projects/not-a-public-project')
    expect(catalogFailure.status).toBe(500)
    const catalogBody = await catalogFailure.text()
    expect(catalogBody).toBe('{"error":"The project catalog service is unavailable. Please try again later.","code":"service_unavailable"}')
    expect(catalogBody).not.toMatch(/d1|sqlite|database|stack|bindings|portfolio_db/i)
  })
})
