import { env } from 'cloudflare:workers'
import { createExecutionContext, waitOnExecutionContext } from 'cloudflare:test'
import { beforeEach, describe, expect, it } from 'vitest'
import expectedContract from './fixtures/project-catalog.json'
import { createApp } from '../src/app'

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>
const worker = createApp(async () => ({ status: 'valid' }))

async function request(path: string, init?: RequestInit) {
  const context = createExecutionContext()
  const response = await worker.fetch(new IncomingRequest(`https://example.test${path}`, init), env, context)
  await waitOnExecutionContext(context)
  return response
}

beforeEach(async () => {
  await env.portfolio_db.batch([
    env.portfolio_db.prepare('DELETE FROM project_links'),
    env.portfolio_db.prepare('DELETE FROM project_technologies'),
    env.portfolio_db.prepare('DELETE FROM projects'),
  ])

  await env.portfolio_db.batch([
    insertProject('atlas', 'Atlas', 'A published project card.', 'The complete published Atlas project detail.', 2026, 'published', 0),
    insertProject('beacon', 'Beacon', 'A second published project card.', 'The complete published Beacon project detail.', 2025, 'published', 1),
    insertProject('draft', 'Internal draft', 'Private summary.', 'Private detail that must not be disclosed.', 2030, 'draft', 2),
    env.portfolio_db
      .prepare('INSERT INTO project_technologies (project_id, technology, sort_order) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?)')
      .bind('atlas', 'React', 0, 'atlas', 'TypeScript', 1, 'beacon', 'Hono', 0),
    env.portfolio_db
      .prepare('INSERT INTO project_links (project_id, label, url, sort_order) VALUES (?, ?, ?, ?), (?, ?, ?, ?)')
      .bind('atlas', 'Live', 'https://example.test/atlas', 0, 'atlas', 'GitHub', 'https://github.com/example/atlas', 1),
  ])
})

function insertProject(
  id: string,
  name: string,
  summary: string,
  description: string,
  year: number,
  publicationState: 'draft' | 'published',
  sortOrder: number,
) {
  return env.portfolio_db
    .prepare(
      'INSERT INTO projects (id, slug, name, summary, description, project_year, publication_state, sort_order, thumbnail_ref, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    )
    .bind(
      id,
      id,
      name,
      summary,
      description,
      year,
      publicationState,
      sortOrder,
      '/desktop-icons/my-computer.svg',
      '2026-01-01T00:00:00.000Z',
      '2026-01-01T00:00:00.000Z',
    )
}

describe('project catalog public contract', () => {
  it('matches the frontend-consumable list fixture exactly, blocking card contract field changes', async () => {
    const response = await request('/api/projects')

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toContain('application/json')
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=300, stale-while-revalidate=86400')
    expect(await response.json()).toEqual(expectedContract.list)
  })

  it('matches the frontend-consumable full detail fixture including ordered technologies and links', async () => {
    const response = await request('/api/projects/atlas')

    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=300, stale-while-revalidate=86400')
    expect(await response.json()).toEqual(expectedContract.detail)
  })

  it('keeps drafts hidden and uses the same safe 404 contract for unknown slugs', async () => {
    const draft = await request('/api/projects/draft')
    const unknown = await request('/api/projects/does-not-exist')

    expect(draft.status).toBe(404)
    expect(unknown.status).toBe(404)
    expect(await draft.json()).toEqual(await unknown.json())
    expect(await request('/api/projects').then((response) => response.text())).not.toContain('Private')
  })

  it('allows the canonical root origin for catalog requests and preflight without broadening methods or headers', async () => {
    const canonicalOrigin = 'https://lcavazzani.com'
    const allowed = await request('/api/projects', { headers: { Origin: canonicalOrigin } })
    expect(allowed.headers.get('Access-Control-Allow-Origin')).toBe(canonicalOrigin)

    const preflight = await request('/api/projects', {
      method: 'OPTIONS',
      headers: { Origin: canonicalOrigin, 'Access-Control-Request-Method': 'GET' },
    })
    expect(preflight.headers.get('Access-Control-Allow-Origin')).toBe(canonicalOrigin)
    expect(preflight.headers.get('Access-Control-Allow-Methods')).toContain('GET')
    expect(preflight.headers.get('Access-Control-Allow-Headers')).toContain('Content-Type')
  })

  it('retains legacy Worker and local development CORS origins while rejecting canonical look-alikes', async () => {
    const legacyOrigin = 'https://2000sme.cavazzanileonardo.workers.dev'
    const legacy = await request('/api/projects', { headers: { Origin: legacyOrigin } })
    expect(legacy.headers.get('Access-Control-Allow-Origin')).toBe(legacyOrigin)

    const local = await request('/api/projects', { headers: { Origin: 'http://localhost:5173' } })
    expect(local.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:5173')

    const lookAlike = await request('/api/projects', { headers: { Origin: 'https://not-lcavazzani.com' } })
    expect(lookAlike.headers.get('Access-Control-Allow-Origin')).toBeNull()
  })
})
