import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { guestbookRoutes } from './domains/guestbook/guestbook.routes'

const ALLOWED_ORIGINS = ['https://2000sme.cavazzanileonardo.workers.dev']

export function createApp() {
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

  app.get('/', (c) => c.text('Hello Hono!'))
  app.get('/api/health', (c) => c.text('ok'))
  app.route('/api/guestbook', guestbookRoutes)

  return app
}
