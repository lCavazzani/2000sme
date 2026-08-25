import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'
import { appQueryClient } from '../api/queryClient'

/**
 * The project catalog is a network resource. Every suite gets a stub so no test
 * reaches the Worker; suites that assert catalog behaviour override `fetch`
 * themselves. See `test/projectCatalog.ts` for the shared fixtures.
 */
export const EMPTY_CATALOG = { projects: [] }

export function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async () => jsonResponse(EMPTY_CATALOG)))
  // Production retries once with backoff, which would push an expected failure
  // past the default assertion timeout. Fail fast under test instead.
  appQueryClient.setDefaultOptions({ queries: { retry: false } })
})

afterEach(() => {
  cleanup()
  // The query client is a module singleton; without this, a cached catalog
  // leaks into the next test and masks fetch behaviour.
  appQueryClient.clear()
  vi.unstubAllGlobals()
  window.sessionStorage.clear()
})
