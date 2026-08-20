import type { ComponentType } from 'react'
import { AboutPixelOS } from '../components/AboutPixelOS'
import { FileExplorer } from '../components/FileExplorer'
import { PixelGallery } from '../components/PixelGallery'
import { PixelPet } from '../components/PixelPet'
import { PixelNotepad } from '../components/PixelNotepad'
import { WordPad } from '../components/WordPad'
import type { WindowConfig } from '../types/window'

export const LAUNCH_SURFACES = ['desktop', 'start-menu', 'mobile'] as const
export type LaunchSurface = (typeof LAUNCH_SURFACES)[number]
export type ApplicationCategory = 'career' | 'system'
export type ApplicationCapability = 'desktop-window' | 'direct-route'
export type ApplicationId = 'my-computer' | 'resume' | 'gallery' | 'pet' | 'notepad' | 'about'

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
 * by their dedicated PXOS tickets; every entry remains registry-driven so the
 * desktop, Start menu, mobile launcher, routes, and window manager share one contract.
 */
export const applicationRegistry = [
  defineApplication({
    id: 'my-computer',
    label: 'MY MACHINE',
    title: 'MY MACHINE',
    category: 'system',
    icon: '/pixelos/icons/pixelos-my-machine-static-00.png',
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
    id: 'gallery',
    label: 'PIXEL GALLERY',
    title: 'PIXEL GALLERY',
    category: 'system',
    icon: '/pixelos/icons/pixelos-gallery-static-00.png',
    mobileLabel: 'Pixel Gallery',
    path: '#/apps/gallery',
    shortcut: 'Alt+3',
    capability: 'desktop-window',
    launchSurfaces: ['desktop', 'start-menu', 'mobile'],
    x: 210,
    y: 70,
    width: 560,
    height: 400,
    renderer: PixelGallery,
  }),
  defineApplication({
    id: 'pet',
    label: 'DESKTOP PET',
    title: 'DESKTOP PET',
    category: 'system',
    icon: '/pixelos/icons/pixelos-desktop-pet-static-00.png',
    mobileLabel: 'Desktop Pet',
    path: '#/apps/pet',
    shortcut: 'Alt+4',
    capability: 'desktop-window',
    launchSurfaces: ['desktop', 'start-menu', 'mobile'],
    x: 560,
    y: 90,
    width: 300,
    height: 360,
    renderer: PixelPet,
  }),
  defineApplication({
    id: 'notepad',
    label: 'README.TXT',
    title: 'README.TXT',
    category: 'system',
    icon: '/pixelos/icons/pixelos-readme-static-00.png',
    mobileLabel: 'README.TXT',
    path: '#/apps/notepad',
    shortcut: 'Alt+2',
    capability: 'desktop-window',
    launchSurfaces: ['desktop', 'start-menu', 'mobile'],
    x: 150,
    y: 96,
    width: 460,
    height: 360,
    renderer: PixelNotepad,
  }),
  defineApplication({
    id: 'about',
    label: 'ABOUT PIXELOS',
    title: 'ABOUT PIXELOS',
    category: 'system',
    icon: '/pixelos/assets/109f5dfc-b775-4bf5-9a64-962651f649f6.jpg',
    mobileLabel: 'About PixelOS',
    path: '#/apps/about',
    shortcut: 'Alt+6',
    capability: 'desktop-window',
    launchSurfaces: ['desktop', 'start-menu', 'mobile'],
    x: 300,
    y: 180,
    width: 380,
    height: 270,
    renderer: AboutPixelOS,
  }),
  defineApplication({
    id: 'resume',
    label: 'RESUME.PDF',
    title: 'RESUME.PDF - WORDPAD',
    category: 'career',
    icon: '/desktop-icons/resume.svg',
    mobileLabel: 'Resume PDF',
    path: '#/apps/resume',
    shortcut: 'Alt+5',
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
