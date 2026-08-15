import type { GuestbookCursor, GuestbookEntry, GuestbookInput } from './guestbook.types'

export async function listGuestbookEntries(
  database: D1Database,
  options: { limit: number; cursor?: GuestbookCursor },
): Promise<GuestbookEntry[]> {
  const statement = options.cursor
    ? database
        .prepare(
          `SELECT id, name, message, created_at
           FROM guestbook
           WHERE created_at < ? OR (created_at = ? AND id < ?)
           ORDER BY created_at DESC, id DESC
           LIMIT ?`,
        )
        .bind(options.cursor.createdAt, options.cursor.createdAt, options.cursor.id, options.limit + 1)
    : database
        .prepare(
          `SELECT id, name, message, created_at
           FROM guestbook
           ORDER BY created_at DESC, id DESC
           LIMIT ?`,
        )
        .bind(options.limit + 1)

  const { results } = await statement.all<GuestbookEntry>()
  return results ?? []
}

export async function insertGuestbookEntry(
  database: D1Database,
  input: GuestbookInput,
  createdAt: string,
): Promise<GuestbookEntry | null> {
  return database
    .prepare('INSERT INTO guestbook (name, message, created_at) VALUES (?, ?, ?) RETURNING id, name, message, created_at')
    .bind(input.name, input.message, createdAt)
    .first<GuestbookEntry>()
}
