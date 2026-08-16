import { describe, expect, it } from 'vitest'
import { createApp } from '../src/app'

describe('backend Worker smoke test', () => {
  it('serves the health endpoint', async () => {
    const response = await createApp().request('https://example.test/api/health')

    expect(response.status).toBe(200)
    expect(await response.text()).toBe('ok')
  })
})
