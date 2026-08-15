import { apiError, type ApiError } from '../../shared/http-errors'
import { decodeGuestbookCursor } from '../../shared/pagination'
import type { GuestbookCursor, GuestbookInput } from './guestbook.types'

export const DEFAULT_PAGE_LIMIT = 20
export const MAX_PAGE_LIMIT = 50
export const MAX_GUESTBOOK_BODY_BYTES = 1024

export type GuestbookPageInput = {
  limit: number
  cursor?: GuestbookCursor
}

export function parseGuestbookPageInput(url: URL): GuestbookPageInput | ApiError {
  const rawLimit = url.searchParams.get('limit') ?? undefined
  const limit = parsePageLimit(rawLimit)
  if (!limit) {
    return apiError(400, 'invalid_limit', `limit must be an integer from 1 to ${MAX_PAGE_LIMIT}.`, {
      details: { min: 1, max: MAX_PAGE_LIMIT },
    })
  }

  const rawCursor = url.searchParams.get('cursor')
  let cursor: GuestbookCursor | undefined
  if (rawCursor) {
    cursor = decodeGuestbookCursor(rawCursor) ?? undefined
    if (!cursor) {
      return apiError(400, 'invalid_cursor', 'cursor is malformed or no longer valid.')
    }
  }

  return { limit, cursor }
}

export async function parseGuestbookInput(request: Request): Promise<GuestbookInput | ApiError> {
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

function parsePageLimit(value: string | undefined): number | null {
  if (value === undefined) return DEFAULT_PAGE_LIMIT
  if (!/^[1-9]\d*$/.test(value)) return null

  const limit = Number(value)
  return limit <= MAX_PAGE_LIMIT ? limit : null
}
