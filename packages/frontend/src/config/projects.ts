export type ProjectLink = {
  label: string
  url: string
}

export type Project = {
  id: string
  name: string
  description: string
  techStack: string[]
  links: ProjectLink[]
  icon: string
  year: number
}

export const projects: Project[] = [
  {
    id: 'sportifolio',
    name: '00sportifolio',
    description:
      'Personal portfolio built as PixelOS, an interactive pixel-art desktop environment. Features draggable/resizable windows, a registry-driven application shell, playable Minesweeper and NIGHTSHIFT games, a Cloudflare Workers API with D1, and a pnpm monorepo with GitHub Actions CI/CD.',
    techStack: ['React', 'TypeScript', 'Cloudflare Workers', 'Hono', 'D1', 'Vite', 'pnpm'],
    links: [
      { label: 'GitHub', url: 'https://github.com/lCavazzani/2000sme' },
      { label: 'Live', url: 'https://2000sme.cavazzanileonardo.workers.dev' },
    ],
    icon: '/desktop-icons/my-computer.svg',
    year: 2026,
  },
]

export function findProject(id: string) {
  return projects.find((p) => p.id === id)
}
