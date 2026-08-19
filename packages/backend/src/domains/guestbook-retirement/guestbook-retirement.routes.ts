import { Hono } from 'hono'
import { apiError } from '../../shared/http-errors'

const RETIRED_GUESTBOOK_ERROR = apiError(
  410,
  'guestbook_retired',
  'The public guestbook has been retired as part of the PixelOS transition.',
)

export function createGuestbookRetirementRoutes() {
  const guestbookRetirementRoutes = new Hono<{ Bindings: CloudflareBindings }>()

  guestbookRetirementRoutes.all('*', (c) =>
    c.json(RETIRED_GUESTBOOK_ERROR.body, RETIRED_GUESTBOOK_ERROR.init.status, {
      ...RETIRED_GUESTBOOK_ERROR.init.headers,
      'Cache-Control': 'no-store',
    }),
  )

  return guestbookRetirementRoutes
}
