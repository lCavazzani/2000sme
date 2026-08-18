import { Hono, type Context } from 'hono'
import { apiError } from '../../shared/http-errors'
import { PROJECT_CATALOG_CACHE_CONTROL, getProjectCatalog, getProjectDetail } from './projects.service'

export function createProjectRoutes() {
  const projectRoutes = new Hono<{ Bindings: CloudflareBindings }>()

  projectRoutes.get('/', async (c) => {
    try {
      const catalog = await getProjectCatalog(c.env.portfolio_db)
      return c.json(catalog, 200, cacheHeaders())
    } catch {
      return unavailable(c)
    }
  })

  projectRoutes.get('/:slug', async (c) => {
    try {
      const project = await getProjectDetail(c.env.portfolio_db, c.req.param('slug'))
      if (!project) {
        const error = apiError(404, 'project_not_found', 'The requested project was not found.')
        return c.json(error.body, error.init)
      }
      return c.json(project, 200, cacheHeaders())
    } catch {
      return unavailable(c)
    }
  })

  return projectRoutes
}

function cacheHeaders() {
  return { 'Cache-Control': PROJECT_CATALOG_CACHE_CONTROL }
}

function unavailable(c: Context<{ Bindings: CloudflareBindings }>) {
  const error = apiError(500, 'service_unavailable', 'The project catalog service is unavailable. Please try again later.')
  return c.json(error.body, error.init)
}
