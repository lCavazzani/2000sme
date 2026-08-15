import type { GuestbookCursor } from '../domains/guestbook/guestbook.types'

export function encodeGuestbookCursor(cursor: GuestbookCursor): string {
  return btoa(JSON.stringify(cursor))
}

export function decodeGuestbookCursor(value: string): GuestbookCursor | null {
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
