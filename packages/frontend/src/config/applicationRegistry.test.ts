import { describe, expect, it } from 'vitest'
import {
  applicationById,
  applicationIdFromHash,
  applicationPath,
  applicationRegistry,
  applicationsForSurface,
  findApplication,
  LAUNCH_SURFACES,
  type ApplicationId,
} from './applicationRegistry'

describe('applicationRegistry', () => {
  it('uses unique identifiers, paths, shortcuts, and map entries for every application', () => {
    const ids = applicationRegistry.map((application) => application.id)
    const paths = applicationRegistry.map((application) => application.path)
    const shortcuts = applicationRegistry.flatMap((application) => application.shortcut ? [application.shortcut] : [])

    expect(new Set(ids)).toHaveLength(applicationRegistry.length)
    expect(new Set(paths)).toHaveLength(applicationRegistry.length)
    expect(new Set(shortcuts)).toHaveLength(shortcuts.length)
    expect(applicationById).toHaveLength(applicationRegistry.length)

    for (const application of applicationRegistry) {
      expect(findApplication(application.id)).toBe(application)
      expect(applicationIdFromHash(application.path)).toBe(application.id)
      expect(applicationPath(application.id)).toBe(application.path)
    }
  })

  it('defines complete, positive, window-launcher metadata for every application', () => {
    for (const application of applicationRegistry) {
      expect(application.label).not.toBe('')
      expect(application.mobileLabel).not.toBe('')
      expect(application.title).not.toBe('')
      expect(application.icon).toMatch(/^\//)
      expect(application.path).toBe(`#/apps/${application.id}`)
      expect(application.width).toBeGreaterThan(0)
      expect(application.height).toBeGreaterThan(0)
      expect(application.x).toBeGreaterThanOrEqual(0)
      expect(application.y).toBeGreaterThanOrEqual(0)
      expect(application.launchSurfaces.length).toBeGreaterThan(0)
      expect(application.launchSurfaces.every((surface) => LAUNCH_SURFACES.includes(surface))).toBe(true)
    }
  })

  it('maps the approved static PixelOS icon family to its intended application identities', () => {
    expect(findApplication('my-computer')?.icon).toBe('/pixelos/icons/pixelos-my-machine-static-00.png')
    expect(findApplication('gallery')?.icon).toBe('/pixelos/icons/pixelos-gallery-static-00.png')
    expect(findApplication('pet')?.icon).toBe('/pixelos/icons/pixelos-desktop-pet-static-00.png')
    expect(findApplication('notepad')?.icon).toBe('/pixelos/icons/pixelos-readme-static-00.png')
  })

  it('derives every launcher surface from the same registry without duplicate destinations', () => {
    for (const surface of LAUNCH_SURFACES) {
      const applications = applicationsForSurface(surface)
      const ids = applications.map((application) => application.id)

      expect(new Set(ids)).toHaveLength(ids.length)
      expect(applications.every((application) => application.launchSurfaces.includes(surface))).toBe(true)
      expect(applications.every((application) => applicationRegistry.includes(application))).toBe(true)
    }

    expect(applicationsForSurface('desktop').map((application) => application.id)).toEqual([
      'my-computer',
      'gallery',
      'pet',
      'notepad',
      'about',
      'resume',
    ])
    expect(applicationsForSurface('start-menu').map((application) => application.id)).toEqual([
      'my-computer',
      'gallery',
      'pet',
      'notepad',
      'about',
      'resume',
    ])
    expect(applicationsForSurface('mobile').map((application) => application.id)).toEqual([
      'my-computer',
      'gallery',
      'pet',
      'notepad',
      'about',
      'resume',
    ])
  })

  it('returns no application for retired or unsupported IDs and direct routes', () => {
    expect(findApplication('not-real')).toBeUndefined()
    expect(findApplication('portfolio')).toBeUndefined()
    expect(findApplication('guestbook')).toBeUndefined()
    expect(findApplication('contact')).toBeUndefined()
    expect(findApplication('appearance-themes')).toBeUndefined()
    expect(applicationIdFromHash('#/apps/not-real')).toBeUndefined()
    expect(applicationIdFromHash('#/apps/guestbook')).toBeUndefined()
    expect(applicationPath('not-real' as ApplicationId)).toBe('#/apps/my-computer')
  })
})
