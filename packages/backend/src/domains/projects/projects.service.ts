import { getPublishedProjectBySlug, listPublishedProjects } from './projects.repository'
import { toProjectCard, toProjectDetail, type ProjectLink, type ProjectTechnology } from './projects.types'

export const PROJECT_CATALOG_CACHE_CONTROL = 'public, max-age=300, stale-while-revalidate=86400'

export async function getProjectCatalog(database: D1Database) {
  const catalog = await listPublishedProjects(database)
  const technologies = technologiesByProject(catalog.technologies)

  return {
    projects: catalog.projects.map((project) => toProjectCard(project, technologies.get(project.id) ?? [])),
  }
}

export async function getProjectDetail(database: D1Database, slug: string) {
  const catalog = await getPublishedProjectBySlug(database, slug)
  const project = catalog.projects[0]
  if (!project) return null

  return toProjectDetail(
    project,
    technologiesByProject(catalog.technologies).get(project.id) ?? [],
    linksByProject(catalog.links).get(project.id) ?? [],
  )
}

function technologiesByProject(rows: { project_id: string; technology: string }[]) {
  const result = new Map<string, ProjectTechnology[]>()
  for (const row of rows) {
    const technologies = result.get(row.project_id) ?? []
    technologies.push({ name: row.technology })
    result.set(row.project_id, technologies)
  }
  return result
}

function linksByProject(rows: { project_id: string; label: string; url: string }[]) {
  const result = new Map<string, ProjectLink[]>()
  for (const row of rows) {
    const links = result.get(row.project_id) ?? []
    links.push({ label: row.label, url: row.url })
    result.set(row.project_id, links)
  }
  return result
}
