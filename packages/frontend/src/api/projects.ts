/**
 * Client for the D1-backed project catalog served by the Worker at
 * `/api/projects`. Responses are validated at the boundary rather than cast,
 * because the catalog is a separately deployed service: a shape change should
 * surface as a typed error in the UI, not as `undefined` mid-render.
 */

export type ProjectTechnology = { name: string }

export type ProjectCard = {
  slug: string
  name: string
  summary: string
  year: number
  thumbnail: string
  technologies: ProjectTechnology[]
}

export class ProjectCatalogError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ProjectCatalogError'
    this.status = status
    this.code = code
  }
}

/** Same-origin in production; Vite proxies `/api` to the local Worker in dev. */
const CATALOG_URL = '/api/projects'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseTechnologies(value: unknown): ProjectTechnology[] {
  if (!Array.isArray(value)) return []

  return value.flatMap((entry) =>
    isRecord(entry) && typeof entry.name === 'string' ? [{ name: entry.name }] : [],
  )
}

function parseProjectCard(value: unknown): ProjectCard {
  if (
    !isRecord(value)
    || typeof value.slug !== 'string'
    || typeof value.name !== 'string'
    || typeof value.summary !== 'string'
    || typeof value.year !== 'number'
    || typeof value.thumbnail !== 'string'
  ) {
    throw new ProjectCatalogError(200, 'invalid_response', 'The project catalog returned an unexpected shape.')
  }

  return {
    slug: value.slug,
    name: value.name,
    summary: value.summary,
    year: value.year,
    thumbnail: value.thumbnail,
    technologies: parseTechnologies(value.technologies),
  }
}

export function parseProjectCatalog(payload: unknown): ProjectCard[] {
  if (!isRecord(payload) || !Array.isArray(payload.projects)) {
    throw new ProjectCatalogError(200, 'invalid_response', 'The project catalog returned an unexpected shape.')
  }

  return payload.projects.map(parseProjectCard)
}

export async function fetchProjectCatalog(signal?: AbortSignal): Promise<ProjectCard[]> {
  let response: Response

  try {
    response = await fetch(CATALOG_URL, { signal, headers: { Accept: 'application/json' } })
  } catch (error) {
    // An aborted request is React Query unmounting the observer, not a failure.
    if (error instanceof DOMException && error.name === 'AbortError') throw error

    throw new ProjectCatalogError(0, 'network_error', 'Could not reach the project catalog.')
  }

  if (!response.ok) {
    throw new ProjectCatalogError(
      response.status,
      'catalog_unavailable',
      response.status >= 500
        ? 'The project catalog is unavailable.'
        : 'The project catalog could not be read.',
    )
  }

  return parseProjectCatalog(await response.json().catch(() => undefined))
}

export const projectCatalogQuery = {
  queryKey: ['projects', 'catalog'] as const,
  queryFn: ({ signal }: { signal: AbortSignal }) => fetchProjectCatalog(signal),
}
