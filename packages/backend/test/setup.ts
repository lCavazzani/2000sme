import { env } from 'cloudflare:workers'
import { applyD1Migrations, reset } from 'cloudflare:test'
import { afterEach, beforeEach } from 'vitest'

declare module 'cloudflare:workers' {
  interface ProvidedEnv extends CloudflareBindings {
    TEST_MIGRATIONS: D1Migration[]
  }
}

beforeEach(async () => {
  await applyD1Migrations(env.portfolio_db, env.TEST_MIGRATIONS)
})

afterEach(async () => {
  await reset()
})
