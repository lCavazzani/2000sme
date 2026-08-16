import { Hono, type Context } from 'hono'
import { apiError, type ApiError } from '../../shared/http-errors'
import { parseGuestbookInput, parseGuestbookPageInput } from './guestbook.schemas'
import {
  getGuestbookPage,
  isGuestbookRateLimited,
  RATE_LIMIT_WINDOW_SECONDS,
  submitGuestbookEntry,
} from './guestbook.service'
import { validateTurnstileToken, type TurnstileVerifier } from './turnstile.service'

export function createGuestbookRoutes(verifyTurnstileToken: TurnstileVerifier = validateTurnstileToken) {
  const guestbookRoutes = new Hono<{ Bindings: CloudflareBindings }>()

  guestbookRoutes.get('/', async (c) => {
    const input = parseGuestbookPageInput(new URL(c.req.url))
    if (isApiError(input)) return c.json(input.body, input.init)

    try {
      return c.json(await getGuestbookPage(c.env.portfolio_db, input))
    } catch {
      return unavailable(c)
    }
  })

  guestbookRoutes.post('/', async (c) => {
    const ip = c.req.header('CF-Connecting-IP')
    const input = await parseGuestbookInput(c.req.raw)
    if (isApiError(input)) return c.json(input.body, input.init)

    const turnstile = await verifyTurnstileToken(input.turnstileToken, c.env.TURNSTILE_SECRET_KEY, ip)
    if (turnstile.status === 'unavailable') return unavailable(c)
    if (turnstile.status === 'invalid') {
      const error = apiError(400, 'turnstile_verification_failed', 'Please complete the verification and try again.')
      return c.json(error.body, error.init)
    }

    if (await isGuestbookRateLimited(c.env.RATE_LIMIT, ip ?? 'unknown')) {
      const error = apiError(429, 'rate_limited', 'Too many guestbook submissions. Try again later.', {
        retryAfterSeconds: RATE_LIMIT_WINDOW_SECONDS,
      })
      return c.json(error.body, error.init)
    }

    try {
      const entry = await submitGuestbookEntry(c.env.portfolio_db, input)
      if (!entry) return unavailable(c)
      return c.json(entry, 201)
    } catch {
      return unavailable(c)
    }
  })

  return guestbookRoutes
}

function unavailable(c: Context<{ Bindings: CloudflareBindings }>) {
  const error = apiError(500, 'service_unavailable', 'The guestbook service is unavailable. Please try again later.')
  return c.json(error.body, error.init)
}

function isApiError(value: unknown): value is ApiError {
  return Boolean(value && typeof value === 'object' && 'body' in value && 'init' in value)
}
