function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '')
}

function isLocalOrPrivateHost(hostname: string) {
  const normalizedHost = hostname.toLowerCase()
  if (normalizedHost === 'localhost' || normalizedHost === '::1' || normalizedHost === '0.0.0.0') return true
  if (normalizedHost.startsWith('127.') || normalizedHost.startsWith('10.') || normalizedHost.startsWith('192.168.')) return true

  const private172Range = normalizedHost.match(/^172\.(\d+)\./)
  return private172Range !== null && Number(private172Range[1]) >= 16 && Number(private172Range[1]) <= 31
}

/**
 * This is intentionally public browser configuration. It must never contain a
 * credential: Vite exposes VITE_* values in the compiled frontend bundle.
 *
 * With no configured public origin, requests use same-origin `/api/*` paths.
 * Vite routes those paths to the local Worker only in development server mode.
 */
export function resolveGuestbookApiOrigin(configuredOrigin: string | undefined, isProduction: boolean) {
  const normalizedOrigin = configuredOrigin?.trim()
  if (!normalizedOrigin) return ''

  const origin = trimTrailingSlash(normalizedOrigin)
  if (!isProduction) return origin

  const url = new URL(origin)
  if (url.protocol !== 'https:' || isLocalOrPrivateHost(url.hostname)) {
    throw new Error('VITE_GUESTBOOK_API_ORIGIN must be a public HTTPS origin in production builds.')
  }

  return origin
}

const configuredOrigin = import.meta.env.VITE_GUESTBOOK_API_ORIGIN
export const guestbookApiOrigin = resolveGuestbookApiOrigin(configuredOrigin, import.meta.env.PROD)
export const guestbookApiUrl = guestbookApiOrigin ? `${guestbookApiOrigin}/api/guestbook` : '/api/guestbook'
