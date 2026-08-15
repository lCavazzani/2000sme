import { encodeGuestbookCursor } from '../../shared/pagination'
import { insertGuestbookEntry, listGuestbookEntries } from './guestbook.repository'
import type { GuestbookInput, GuestbookPage } from './guestbook.types'

export const RATE_LIMIT_MAX = 5
export const RATE_LIMIT_WINDOW_SECONDS = 60

export async function getGuestbookPage(
  database: D1Database,
  options: { limit: number; cursor?: { createdAt: string; id: number } },
): Promise<GuestbookPage> {
  const rows = await listGuestbookEntries(database, options)
  const entries = rows.slice(0, options.limit)
  const continuation = rows.length > options.limit ? entries.at(-1) : undefined

  return {
    entries,
    page: {
      limit: options.limit,
      next_cursor: continuation
        ? encodeGuestbookCursor({ createdAt: continuation.created_at, id: continuation.id })
        : null,
    },
  }
}

export async function submitGuestbookEntry(
  database: D1Database,
  input: GuestbookInput,
): Promise<Awaited<ReturnType<typeof insertGuestbookEntry>>> {
  return insertGuestbookEntry(database, input, new Date().toISOString())
}

export async function isGuestbookRateLimited(rateLimit: KVNamespace, ip: string): Promise<boolean> {
  const key = `rl:${ip}`
  const raw = await rateLimit.get(key)
  const count = raw ? Number.parseInt(raw, 10) : 0
  if (count >= RATE_LIMIT_MAX) return true

  await rateLimit.put(key, String(count + 1), { expirationTtl: RATE_LIMIT_WINDOW_SECONDS })
  return false
}
