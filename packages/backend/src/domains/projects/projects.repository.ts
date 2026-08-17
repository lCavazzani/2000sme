import type { ProjectCatalogRows } from './projects.types'

type ProjectRow = ProjectCatalogRows['projects'][number]
type ProjectTechnologyRow = ProjectCatalogRows['technologies'][number]
type ProjectLinkRow = ProjectCatalogRows['links'][number]

const PROJECT_ORDER = 'sort_order ASC, project_year DESC, slug ASC'

export async function listPublishedProjects(database: D1Database): Promise<ProjectCatalogRows> {
  const projects = await database
    .prepare(`SELECT id, slug, name, summary, description, project_year, sort_order, thumbnail_ref FROM published_projects ORDER BY ${PROJECT_ORDER}`)
    .all<ProjectRow>()

  return getCatalogChildren(database, projects.results)
}

export async function getPublishedProjectBySlug(database: D1Database, slug: string): Promise<ProjectCatalogRows> {
  const project = await database
    .prepare(`SELECT id, slug, name, summary, description, project_year, sort_order, thumbnail_ref FROM published_projects WHERE slug = ? LIMIT 1`)
    .bind(slug)
    .first<ProjectRow>()

  return getCatalogChildren(database, project ? [project] : [])
}

async function getCatalogChildren(database: D1Database, projects: ProjectRow[]): Promise<ProjectCatalogRows> {
  if (projects.length === 0) {
    return { projects: [], technologies: [], links: [] }
  }

  const placeholders = projects.map(() => '?').join(', ')
  const ids = projects.map((project) => project.id)
  const [technologies, links] = await database.batch([
    database
      .prepare(`SELECT project_id, technology FROM project_technologies WHERE project_id IN (${placeholders}) ORDER BY project_id ASC, sort_order ASC`)
      .bind(...ids),
    database
      .prepare(`SELECT project_id, label, url FROM project_links WHERE project_id IN (${placeholders}) ORDER BY project_id ASC, sort_order ASC`)
      .bind(...ids),
  ])

  return {
    projects,
    technologies: technologies.results as ProjectTechnologyRow[],
    links: links.results as ProjectLinkRow[],
  }
}
