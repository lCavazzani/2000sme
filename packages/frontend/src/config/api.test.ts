import { describe, expect, it } from 'vitest'
import { resolveApiOrigin } from './api'

/**
 * The deployed frontend Worker serves assets only, so a wrong origin here is
 * what put My Machine into a permanent failure state in development.
 */
describe('resolveApiOrigin', () => {
  it('falls back to same-origin paths when nothing is configured', () => {
    expect(resolveApiOrigin(undefined, false)).toBe('')
    expect(resolveApiOrigin('   ', true)).toBe('')
  })

  it('trims trailing slashes so joined paths stay well formed', () => {
    expect(resolveApiOrigin('https://api.example.test//', true)).toBe('https://api.example.test')
  })

  it('accepts a public HTTPS origin in production', () => {
    expect(resolveApiOrigin('https://00sbackedn.cavazzanileonardo.workers.dev', true))
      .toBe('https://00sbackedn.cavazzanileonardo.workers.dev')
  })

  it('allows loopback origins outside production builds', () => {
    expect(resolveApiOrigin('http://localhost:8787', false)).toBe('http://localhost:8787')
  })

  it.each([
    'http://api.example.test',
    'https://localhost:8787',
    'https://127.0.0.1',
    'https://192.168.1.10',
    'https://172.16.4.4',
  ])('rejects %s in a production build', (origin) => {
    expect(() => resolveApiOrigin(origin, true)).toThrow(/public HTTPS origin/)
  })
})
