const DEFAULT_GUESTBOOK_API_ORIGIN = 'https://00sbackedn.cavazzanileonardo.workers.dev'

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '')
}

/**
 * This is intentionally public browser configuration. It must never contain a
 * credential: Vite exposes VITE_* values in the compiled frontend bundle.
 */
const configuredOrigin = import.meta.env.VITE_GUESTBOOK_API_ORIGIN?.trim()

export const guestbookApiOrigin = trimTrailingSlash(configuredOrigin || DEFAULT_GUESTBOOK_API_ORIGIN)
export const guestbookApiUrl = `${guestbookApiOrigin}/api/guestbook`
