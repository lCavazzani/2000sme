import { Hono, type Context } from 'hono'
import { apiError, type ApiError } from '../../shared/http-errors'
import { parseGuestbookInput, parseGuestbookPageInput } from './guestbook.schemas'
import {
  getGuestbookPage,
  isGuestbookRateLimited,
  RATE_LIMIT_WINDOW_SECONDS,
  submitGuestbookEntry,
} from './guestbook.service'

export const guestbookRoutes = new Hono<{ Bindings: CloudflareBindings }>()

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
  const ip = c.req.header('CF-Connecting-IP') ?? 'unknown'
  if (await isGuestbookRateLimited(c.env.RATE_LIMIT, ip)) {
    const error = apiError(429, 'rate_limited', 'Too many guestbook submissions. Try again later.', {
      retryAfterSeconds: RATE_LIMIT_WINDOW_SECONDS,
    })
    return c.json(error.body, error.init)
  }

  const input = await parseGuestbookInput(c.req.raw)
  if (isApiError(input)) return c.json(input.body, input.init)

  try {
    const entry = await submitGuestbookEntry(c.env.portfolio_db, input)
    if (!entry) return unavailable(c)
    return c.json(entry, 201)
  } catch {
    return unavailable(c)
  }
})

function unavailable(c: Context<{ Bindings: CloudflareBindings }>) {
  const error = apiError(500, 'service_unavailable', 'The guestbook service is unavailable. Please try again later.')
  return c.json(error.body, error.init)
}

function isApiError(value: unknown): value is ApiError {
  return Boolean(value && typeof value === 'object' && 'body' in value && 'init' in value)
}
