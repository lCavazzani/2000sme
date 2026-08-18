import { env } from 'cloudflare:workers'
import { createExecutionContext, waitOnExecutionContext } from 'cloudflare:test'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app'

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>
const worker = createApp(async () => ({ status: 'valid' }))

type ProjectCard = {
  slug: string
  name: string
  summary: string
  year: number
  thumbnail: string
  technologies: Array<{ name: string }>
}

type ProjectDetail = ProjectCard & {
  description: string
  links: Array<{ label: string; url: string }>
}

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
    env.portfolio_db
      .prepare(
        'INSERT INTO projects (id, slug, name, summary, description, project_year, publication_state, sort_order, thumbnail_ref, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      )
      .bind(
        'alpha',
        'alpha',
        'Alpha',
        'First published card',
        'The full published Alpha description.',
        2026,
        'published',
        0,
        '/desktop-icons/my-computer.svg',
        '2026-01-01T00:00:00.000Z',
        '2026-01-01T00:00:00.000Z',
      ),
    env.portfolio_db
      .prepare(
        'INSERT INTO projects (id, slug, name, summary, description, project_year, publication_state, sort_order, thumbnail_ref, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      )
      .bind(
        'beta',
        'beta',
        'Beta',
        'Second published card',
        'The full published Beta description.',
        2025,
        'published',
        1,
        '/desktop-icons/my-computer.svg',
        '2026-01-01T00:00:00.000Z',
        '2026-01-01T00:00:00.000Z',
      ),
    env.portfolio_db
      .prepare(
        'INSERT INTO projects (id, slug, name, summary, description, project_year, publication_state, sort_order, thumbnail_ref, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      )
      .bind(
        'draft',
        'internal-draft',
        'Internal draft',
        'Draft summary',
        'This content must never become public.',
        2027,
        'draft',
        2,
        '/desktop-icons/my-computer.svg',
        '2026-01-01T00:00:00.000Z',
        '2026-01-01T00:00:00.000Z',
      ),
    env.portfolio_db
      .prepare('INSERT INTO project_technologies (project_id, technology, sort_order) VALUES (?, ?, ?), (?, ?, ?)')
      .bind('alpha', 'React', 0, 'alpha', 'TypeScript', 1),
    env.portfolio_db
      .prepare('INSERT INTO project_links (project_id, label, url, sort_order) VALUES (?, ?, ?, ?)')
      .bind('alpha', 'Live', 'https://example.test/alpha', 0),
  ])
})

describe('public projects catalog API', () => {
  it('returns compact published cards in the documented stable sort order', async () => {
    const response = await request('/api/projects')

    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=300, stale-while-revalidate=86400')
    const body = (await response.json()) as { projects: ProjectCard[] }
    expect(body.projects.map((project) => project.slug)).toEqual(['alpha', 'beta'])
    expect(body.projects[0]).toEqual({
      slug: 'alpha',
      name: 'Alpha',
      summary: 'First published card',
      year: 2026,
      thumbnail: '/desktop-icons/my-computer.svg',
      technologies: [{ name: 'React' }, { name: 'TypeScript' }],
    })
    expect('description' in body.projects[0]).toBe(false)
  })

  it('returns full published detail including ordered links', async () => {
    const response = await request('/api/projects/alpha')

    expect(response.status).toBe(200)
    expect((await response.json()) as ProjectDetail).toEqual({
      slug: 'alpha',
      name: 'Alpha',
      summary: 'First published card',
      description: 'The full published Alpha description.',
      year: 2026,
      thumbnail: '/desktop-icons/my-computer.svg',
      technologies: [{ name: 'React' }, { name: 'TypeScript' }],
      links: [{ label: 'Live', url: 'https://example.test/alpha' }],
    })
  })

  it('does not disclose draft or unknown projects', async () => {
    for (const slug of ['internal-draft', 'missing-project']) {
      const response = await request(`/api/projects/${slug}`)
      expect(response.status).toBe(404)
      expect(await response.json()).toEqual({
        error: 'The requested project was not found.',
        code: 'project_not_found',
      })
    }
  })
})
