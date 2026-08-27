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
 * The frontend Worker serves static assets only — it has no `main` script and
 * no `/api/*` route — so the deployed browser bundle must call the backend
 * Worker on its own origin. Locally, an empty origin keeps same-origin `/api`
 * paths so the Vite dev proxy can forward to `wrangler dev`.
 *
 * This is intentionally public browser configuration and must never hold a
 * credential: Vite inlines every `VITE_*` value into the shipped bundle.
 */
export function resolveApiOrigin(configuredOrigin: string | undefined, isProduction: boolean) {
  const normalizedOrigin = configuredOrigin?.trim()
  if (!normalizedOrigin) return ''

  const origin = trimTrailingSlash(normalizedOrigin)
  if (!isProduction) return origin

  const url = new URL(origin)
  if (url.protocol !== 'https:' || isLocalOrPrivateHost(url.hostname)) {
    throw new Error('VITE_API_ORIGIN must be a public HTTPS origin in production builds.')
  }

  return origin
}

export const apiOrigin = resolveApiOrigin(import.meta.env.VITE_API_ORIGIN, import.meta.env.PROD)

/** Same-origin (dev proxy) when no origin is configured; absolute otherwise. */
export function apiUrl(path: `/${string}`) {
  return apiOrigin ? `${apiOrigin}${path}` : path
}
