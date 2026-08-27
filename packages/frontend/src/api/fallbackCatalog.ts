import type { ProjectCard } from './projects'

/**
 * Last-resort catalog shown when the Worker cannot be reached and no previously
 * fetched response is cached.
 *
 * This must only ever describe real work. The desktop previously shipped
 * fictional "Project Alpha"/"Project Beta" placeholders, which is exactly the
 * failure mode a fallback invites; presenting invented projects as portfolio
 * history is worse than showing nothing. Keep this in step with the approved
 * catalog in `packages/backend/seeds/projects.sql`.
 */
export const FALLBACK_CATALOG: ProjectCard[] = [
  {
    slug: 'sportifolio',
    name: '00sportifolio',
    summary: 'An interactive pixel-art desktop portfolio.',
    year: 2026,
    thumbnail: '/desktop-icons/my-computer.svg',
    technologies: [
      { name: 'React' },
      { name: 'TypeScript' },
      { name: 'Cloudflare Workers' },
      { name: 'Hono' },
      { name: 'D1' },
      { name: 'Vite' },
      { name: 'pnpm' },
    ],
  },
]
