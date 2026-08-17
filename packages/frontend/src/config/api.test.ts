import { describe, expect, it } from 'vitest'
import { resolveGuestbookApiOrigin } from './api'

describe('Guestbook API origin configuration', () => {
  it('uses the same-origin API path when no public origin is configured', () => {
    expect(resolveGuestbookApiOrigin(undefined, false)).toBe('')
    expect(resolveGuestbookApiOrigin(undefined, true)).toBe('')
  })

  it('allows an explicit local override only outside production builds', () => {
    expect(resolveGuestbookApiOrigin('http://localhost:8787', false)).toBe('http://localhost:8787')
  })

  it('allows a configured HTTPS public API origin in production', () => {
    expect(resolveGuestbookApiOrigin('https://api.example.com/', true)).toBe('https://api.example.com')
  })

  it.each([
    'http://localhost:8787',
    'https://127.0.0.1:8787',
    'https://10.0.0.12',
    'https://172.16.0.12',
    'https://192.168.1.12',
    'http://api.example.com',
  ])('rejects private or non-HTTPS production origin %s', (origin) => {
    expect(() => resolveGuestbookApiOrigin(origin, true)).toThrow('public HTTPS origin')
  })
})
