import type { ComponentType } from 'react'
import { FileExplorer } from '../components/FileExplorer'
import { WordPad } from '../components/WordPad'
import type { WindowConfig } from '../types/window'

export const LAUNCH_SURFACES = ['desktop', 'start-menu', 'mobile'] as const
export type LaunchSurface = (typeof LAUNCH_SURFACES)[number]
export type ApplicationCategory = 'career' | 'system'
export type ApplicationCapability = 'desktop-window' | 'direct-route'
export type ApplicationId = 'my-computer' | 'resume'

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

/**
 * PXOS-3 retires legacy public surfaces. Future PixelOS applications are added
 * by their dedicated PXOS tickets; this registry intentionally exposes only
 * the two currently implemented, portfolio-safe applications.
 */
export const applicationRegistry = [
  defineApplication({
    id: 'my-computer',
    label: 'MY MACHINE',
    title: 'MY MACHINE',
    category: 'system',
    icon: '/desktop-icons/my-computer.svg',
    mobileLabel: 'My Machine',
    path: '#/apps/my-computer',
    shortcut: 'Alt+1',
    capability: 'desktop-window',
    launchSurfaces: ['desktop', 'start-menu', 'mobile'],
    x: 120,
    y: 50,
    width: 640,
    height: 440,
    renderer: FileExplorer,
  }),
  defineApplication({
    id: 'resume',
    label: 'README.TXT',
    title: 'README.TXT - WORDPAD',
    category: 'career',
    icon: '/desktop-icons/resume.svg',
    mobileLabel: 'README.TXT',
    path: '#/apps/resume',
    shortcut: 'Alt+2',
    capability: 'desktop-window',
    launchSurfaces: ['desktop', 'start-menu', 'mobile'],
    x: 150,
    y: 96,
    width: 760,
    height: 540,
    renderer: WordPad,
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
  return findApplication(id)?.path ?? '#/apps/my-computer'
}

/** Unsupported or retired hashes deliberately resolve to the desktop shell. */
export function applicationIdFromHash(hash: string): ApplicationId | undefined {
  return applicationRegistry.find((application) => application.path === hash)?.id
}
