import { Hono } from 'hono'
import { cors } from 'hono/cors'

type GuestbookEntry = {
  id: number
  name: string
  message: string
  created_at: string
}

type GuestbookCursor = {
  createdAt: string
  id: number
}

type GuestbookInput = {
  name: string
  message: string
}

const ALLOWED_ORIGINS = ['https://2000sme.cavazzanileonardo.workers.dev']
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_SECONDS = 60
const DEFAULT_PAGE_LIMIT = 20
const MAX_PAGE_LIMIT = 50
const MAX_GUESTBOOK_BODY_BYTES = 1024

const app = new Hono<{ Bindings: CloudflareBindings }>()

app.use(
  '*',
  cors({
    origin: (origin) => {
      if (ALLOWED_ORIGINS.includes(origin)) return origin
      if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return origin
      return null
    },
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
  }),
)

function apiError(
  status: number,
  code: string,
  error: string,
  options: { details?: Record<string, string | number>; retryAfterSeconds?: number } = {},
) {
  return {
    body: {
      error,
      code,
      ...(options.details ? { details: options.details } : {}),
      ...(options.retryAfterSeconds ? { retry_after_seconds: options.retryAfterSeconds } : {}),
    },
    init: {
      status: status as 400 | 413 | 429 | 500,
      headers: options.retryAfterSeconds ? { 'Retry-After': String(options.retryAfterSeconds) } : undefined,
    },
  }
}

function encodeCursor(cursor: GuestbookCursor): string {
  return btoa(JSON.stringify(cursor))
}

function decodeCursor(value: string): GuestbookCursor | null {
  try {
    const parsed: unknown = JSON.parse(atob(value))
    if (!parsed || typeof parsed !== 'object') return null

    const cursor = parsed as Partial<GuestbookCursor>
    const id = cursor.id
    if (
      typeof cursor.createdAt !== 'string' ||
      Number.isNaN(Date.parse(cursor.createdAt)) ||
      typeof id !== 'number' ||
      !Number.isSafeInteger(id) ||
      id < 1
    ) {
      return null
    }

    return { createdAt: cursor.createdAt, id }
  } catch {
    return null
  }
}

function parsePageLimit(value: string | undefined): number | null {
  if (value === undefined) return DEFAULT_PAGE_LIMIT
  if (!/^[1-9]\d*$/.test(value)) return null

  const limit = Number(value)
  return limit <= MAX_PAGE_LIMIT ? limit : null
}

async function isRateLimited(kv: KVNamespace, ip: string): Promise<boolean> {
  const key = `rl:${ip}`
  const raw = await kv.get(key)
  const count = raw ? Number.parseInt(raw, 10) : 0
  if (count >= RATE_LIMIT_MAX) return true

  await kv.put(key, String(count + 1), { expirationTtl: RATE_LIMIT_WINDOW_SECONDS })
  return false
}

async function parseGuestbookInput(request: Request): Promise<GuestbookInput | ReturnType<typeof apiError>> {
  const declaredLength = request.headers.get('Content-Length')
  if (declaredLength && (!/^\d+$/.test(declaredLength) || Number(declaredLength) > MAX_GUESTBOOK_BODY_BYTES)) {
    return apiError(413, 'payload_too_large', 'Guestbook submissions must be 1 KB or smaller.', {
      details: { max_bytes: MAX_GUESTBOOK_BODY_BYTES },
    })
  }

  const rawBody = await request.text()
  if (new TextEncoder().encode(rawBody).byteLength > MAX_GUESTBOOK_BODY_BYTES) {
    return apiError(413, 'payload_too_large', 'Guestbook submissions must be 1 KB or smaller.', {
      details: { max_bytes: MAX_GUESTBOOK_BODY_BYTES },
    })
  }

  let body: unknown
  try {
    body = JSON.parse(rawBody)
  } catch {
    return apiError(400, 'invalid_json', 'Request body must be valid JSON.')
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return apiError(400, 'validation_error', 'Request body must be an object with name and message fields.')
  }

  const fields = Object.keys(body)
  if (fields.some((field) => field !== 'name' && field !== 'message')) {
    return apiError(400, 'validation_error', 'Guestbook submissions accept plain-text name and message fields only.')
  }

  const { name, message } = body as { name?: unknown; message?: unknown }
  if (typeof name !== 'string' || name.trim() === '') {
    return apiError(400, 'validation_error', 'name is required.', { details: { field: 'name' } })
  }
  if (typeof message !== 'string' || message.trim() === '') {
    return apiError(400, 'validation_error', 'message is required.', { details: { field: 'message' } })
  }
  if (name.trim().length > 50) {
    return apiError(400, 'validation_error', 'name must be 50 characters or fewer.', { details: { field: 'name', max_length: 50 } })
  }
  if (message.trim().length > 280) {
    return apiError(400, 'validation_error', 'message must be 280 characters or fewer.', { details: { field: 'message', max_length: 280 } })
  }

  return { name: name.trim(), message: message.trim() }
}

app.get('/', (c) => c.text('Hello Hono!'))

app.get('/api/health', (c) => c.text('ok'))

app.get('/api/guestbook', async (c) => {
  const limit = parsePageLimit(c.req.query('limit'))
  if (!limit) {
    const error = apiError(400, 'invalid_limit', `limit must be an integer from 1 to ${MAX_PAGE_LIMIT}.`, {
      details: { min: 1, max: MAX_PAGE_LIMIT },
    })
    return c.json(error.body, error.init)
  }

  const rawCursor = c.req.query('cursor')
  const cursor = rawCursor ? decodeCursor(rawCursor) : undefined
  if (rawCursor && !cursor) {
    const error = apiError(400, 'invalid_cursor', 'cursor is malformed or no longer valid.')
    return c.json(error.body, error.init)
  }

  try {
    const statement = cursor
      ? c.env.portfolio_db
          .prepare(
            `SELECT id, name, message, created_at
             FROM guestbook
             WHERE created_at < ? OR (created_at = ? AND id < ?)
             ORDER BY created_at DESC, id DESC
             LIMIT ?`,
          )
          .bind(cursor.createdAt, cursor.createdAt, cursor.id, limit + 1)
      : c.env.portfolio_db
          .prepare(
            `SELECT id, name, message, created_at
             FROM guestbook
             ORDER BY created_at DESC, id DESC
             LIMIT ?`,
          )
          .bind(limit + 1)

    const { results } = await statement.all<GuestbookEntry>()
    const rows = results ?? []
    const entries = rows.slice(0, limit)
    const continuation = rows.length > limit ? entries.at(-1) : undefined

    return c.json({
      entries,
      page: {
        limit,
        next_cursor: continuation
          ? encodeCursor({ createdAt: continuation.created_at, id: continuation.id })
          : null,
      },
    })
  } catch {
    const error = apiError(500, 'service_unavailable', 'The guestbook service is unavailable. Please try again later.')
    return c.json(error.body, error.init)
  }
})

app.post('/api/guestbook', async (c) => {
  const ip = c.req.header('CF-Connecting-IP') ?? 'unknown'

  if (await isRateLimited(c.env.RATE_LIMIT, ip)) {
    const error = apiError(429, 'rate_limited', 'Too many guestbook submissions. Try again later.', {
      retryAfterSeconds: RATE_LIMIT_WINDOW_SECONDS,
    })
    return c.json(error.body, error.init)
  }

  const parsedInput = await parseGuestbookInput(c.req.raw)
  if ('body' in parsedInput) return c.json(parsedInput.body, parsedInput.init)

  try {
    const createdAt = new Date().toISOString()
    const entry = await c.env.portfolio_db
      .prepare('INSERT INTO guestbook (name, message, created_at) VALUES (?, ?, ?) RETURNING id, name, message, created_at')
      .bind(parsedInput.name, parsedInput.message, createdAt)
      .first<GuestbookEntry>()

    return c.json(entry, 201)
  } catch {
    const error = apiError(500, 'service_unavailable', 'The guestbook service is unavailable. Please try again later.')
    return c.json(error.body, error.init)
  }
})

export default app
