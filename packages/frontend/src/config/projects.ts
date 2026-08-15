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
      'Personal portfolio built as a Windows 98 desktop simulation. Features draggable/resizable windows, theme switching between Win98, WinXP, and Win7, a Cloudflare Workers API with D1, rate-limited guestbook, and a pnpm monorepo with GitHub Actions CI/CD.',
    techStack: ['React', 'TypeScript', 'Cloudflare Workers', 'Hono', 'D1', 'Vite', 'pnpm'],
    links: [
      { label: 'GitHub', url: 'https://github.com/lCavazzani/2000sme' },
      { label: 'Live', url: 'https://2000sme.cavazzanileonardo.workers.dev' },
    ],
    icon: '/desktop-icons/my-computer.svg',
    year: 2026,
  },
  {
    id: 'project-alpha',
    name: 'Project Alpha',
    description: 'Replace with a real project description.',
    techStack: ['Node.js', 'TypeScript', 'PostgreSQL', 'Docker'],
    links: [{ label: 'GitHub', url: 'https://github.com/lCavazzani' }],
    icon: '/desktop-icons/my-computer.svg',
    year: 2025,
  },
  {
    id: 'project-beta',
    name: 'Project Beta',
    description: 'Replace with a real project description.',
    techStack: ['Python', 'FastAPI', 'Redis', 'Terraform'],
    links: [{ label: 'GitHub', url: 'https://github.com/lCavazzani' }],
    icon: '/desktop-icons/my-computer.svg',
    year: 2024,
  },
]

export function findProject(id: string) {
  return projects.find((p) => p.id === id)
}
