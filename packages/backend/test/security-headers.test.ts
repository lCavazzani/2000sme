import { describe, expect, it } from 'vitest'
import { createApp } from '../src/app'

describe('security headers', () => {
  it('returns the baseline hardening headers with a report-only CSP', async () => {
    const response = await createApp().request('https://example.test/api/health')

    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(response.headers.get('X-Frame-Options')).toBe('DENY')
    expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin')
    expect(response.headers.get('Permissions-Policy')).toContain('camera=()')
    expect(response.headers.get('Permissions-Policy')).toContain('microphone=()')

    const csp = response.headers.get('Content-Security-Policy-Report-Only')
    expect(csp).toContain("default-src 'self'")
    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).toContain("object-src 'none'")
    expect(csp).toContain('connect-src')
    expect(csp).toContain('script-src')
    expect(csp).toContain('https://challenges.cloudflare.com')
    expect(csp).toContain('frame-src')
    expect(csp).not.toContain('localhost')
    expect(csp).not.toContain('127.0.0.1')
    expect(response.headers.get('Content-Security-Policy')).toBeNull()
    expect(response.headers.get('Strict-Transport-Security')).toBeNull()
  })
})
