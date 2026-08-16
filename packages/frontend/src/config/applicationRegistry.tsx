import type { ComponentType } from 'react'
import { AppearanceThemesWindow } from '../components/AppearanceThemesWindow'
import { FileExplorer } from '../components/FileExplorer'
import { Guestbook } from '../components/Guestbook'
import { WordPad } from '../components/WordPad'
import type { WindowConfig } from '../types/window'

export const LAUNCH_SURFACES = ['desktop', 'start-menu', 'mobile'] as const
export type LaunchSurface = (typeof LAUNCH_SURFACES)[number]
export type ApplicationCategory = 'portfolio' | 'career' | 'visitor' | 'system'
export type ApplicationCapability = 'desktop-window' | 'direct-route'
export type ApplicationId =
  | 'portfolio'
  | 'my-computer'
  | 'resume'
  | 'guestbook'
  | 'about-me'
  | 'appearance-themes'

export type ApplicationDefinition = WindowConfig & {
  id: ApplicationId
  label: string
  title: string
  category: ApplicationCategory
  icon: string
  mobileLabel: string
  path: `#/apps/${ApplicationId}`
  shortcut?: string
  capability: ApplicationCapability
  launchSurfaces: readonly LaunchSurface[]
  renderer?: ComponentType
}

function defineApplication(application: ApplicationDefinition): ApplicationDefinition {
  return application
}

export const applicationRegistry = [
  defineApplication({
    id: 'portfolio',
    label: 'My Portfolio',
    title: 'My Portfolio',
    category: 'portfolio',
    icon: '/desktop-icons/my-computer.svg',
    mobileLabel: 'Portfolio',
    path: '#/apps/portfolio',
    shortcut: 'Alt+1',
    capability: 'desktop-window',
    launchSurfaces: ['start-menu', 'mobile', 'desktop'],
    x: 64,
    y: 64,
    width: 480,
    height: 320,
  }),
  defineApplication({
    id: 'my-computer',
    label: 'My Computer',
    title: 'My Computer',
    category: 'system',
    icon: '/desktop-icons/my-computer.svg',
    mobileLabel: 'Explore',
    path: '#/apps/my-computer',
    shortcut: 'Alt+2',
    capability: 'desktop-window',
    launchSurfaces: ['start-menu', 'mobile'],
    x: 72,
    y: 48,
    width: 640,
    height: 440,
    renderer: FileExplorer,
  }),
  defineApplication({
    id: 'resume',
    label: 'Resume',
    title: 'resume.md - WordPad',
    category: 'career',
    icon: '/desktop-icons/resume.svg',
    mobileLabel: 'Resume',
    path: '#/apps/resume',
    shortcut: 'Alt+3',
    capability: 'desktop-window',
    launchSurfaces: ['desktop', 'start-menu', 'mobile'],
    x: 96,
    y: 48,
    width: 760,
    height: 540,
    renderer: WordPad,
  }),
  defineApplication({
    id: 'guestbook',
    label: 'Guestbook',
    title: 'Guestbook',
    category: 'visitor',
    icon: '/desktop-icons/guestbook.svg',
    mobileLabel: 'Guestbook',
    path: '#/apps/guestbook',
    shortcut: 'Alt+4',
    capability: 'desktop-window',
    launchSurfaces: ['desktop', 'start-menu', 'mobile'],
    x: 156,
    y: 124,
    width: 440,
    height: 380,
    renderer: Guestbook,
  }),
  defineApplication({
    id: 'about-me',
    label: 'About Me',
    title: 'About Me',
    category: 'career',
    icon: '/desktop-icons/about-me.svg',
    mobileLabel: 'About',
    path: '#/apps/about-me',
    shortcut: 'Alt+5',
    capability: 'desktop-window',
    launchSurfaces: ['desktop', 'start-menu', 'mobile'],
    x: 196,
    y: 152,
    width: 420,
    height: 320,
  }),
  defineApplication({
    id: 'appearance-themes',
    label: 'Control Panel',
    title: 'Appearance & Themes',
    category: 'system',
    icon: '/desktop-icons/control-panel.svg',
    mobileLabel: 'Themes',
    path: '#/apps/appearance-themes',
    shortcut: 'Alt+6',
    capability: 'desktop-window',
    launchSurfaces: ['desktop', 'start-menu', 'mobile'],
    x: 236,
    y: 180,
    width: 540,
    height: 390,
    renderer: AppearanceThemesWindow,
  }),
] as const satisfies readonly ApplicationDefinition[]

export const applicationById = new Map<ApplicationId, ApplicationDefinition>(
  applicationRegistry.map((application) => [application.id, application]),
)

export function findApplication(id: string): ApplicationDefinition | undefined {
  return applicationById.get(id as ApplicationId)
}

export function applicationsForSurface(surface: LaunchSurface): ApplicationDefinition[] {
  return applicationRegistry.filter((application) => application.launchSurfaces.includes(surface))
}

export function applicationPath(id: ApplicationId): ApplicationDefinition['path'] {
  return findApplication(id)?.path ?? '#/apps/portfolio'
}

export function applicationIdFromHash(hash: string): ApplicationId | undefined {
  return applicationRegistry.find((application) => application.path === hash)?.id
}
