export type ProjectTechnology = {
  name: string
}

export type ProjectLink = {
  label: string
  url: string
}

export type ProjectCard = {
  slug: string
  name: string
  summary: string
  year: number
  thumbnail: string
  technologies: ProjectTechnology[]
}

export type ProjectDetail = ProjectCard & {
  description: string
  links: ProjectLink[]
}

type ProjectRow = {
  id: string
  slug: string
  name: string
  summary: string
  description: string
  project_year: number
  sort_order: number
  thumbnail_ref: string
}

type ProjectTechnologyRow = {
  project_id: string
  technology: string
}

type ProjectLinkRow = {
  project_id: string
  label: string
  url: string
}

export type ProjectCatalogRows = {
  projects: ProjectRow[]
  technologies: ProjectTechnologyRow[]
  links: ProjectLinkRow[]
}

export function toProjectCard(project: ProjectRow, technologies: ProjectTechnology[]): ProjectCard {
  return {
    slug: project.slug,
    name: project.name,
    summary: project.summary,
    year: project.project_year,
    thumbnail: project.thumbnail_ref,
    technologies,
  }
}

export function toProjectDetail(
  project: ProjectRow,
  technologies: ProjectTechnology[],
  links: ProjectLink[],
): ProjectDetail {
  return {
    ...toProjectCard(project, technologies),
    description: project.description,
    links,
  }
}
