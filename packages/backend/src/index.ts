import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})
app.get('/api/health', (c) => {
  return c.text('ok')
})
export default app
