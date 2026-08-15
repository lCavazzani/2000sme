import { describe, expect, it } from 'vitest'
import {
  applicationIdFromHash,
  applicationRegistry,
  applicationsForSurface,
  findApplication,
} from './applicationRegistry'

describe('applicationRegistry', () => {
  it('uses unique identifiers and direct paths for every application', () => {
    const ids = applicationRegistry.map((application) => application.id)
    const paths = applicationRegistry.map((application) => application.path)

    expect(new Set(ids)).toHaveLength(applicationRegistry.length)
    expect(new Set(paths)).toHaveLength(applicationRegistry.length)

    for (const application of applicationRegistry) {
      expect(findApplication(application.id)).toBe(application)
      expect(applicationIdFromHash(application.path)).toBe(application.id)
    }
  })

  it('derives launch surfaces from the same registry without duplicate destination definitions', () => {
    const desktopIds = applicationsForSurface('desktop').map((application) => application.id)
    const startMenuIds = applicationsForSurface('start-menu').map((application) => application.id)

    expect(desktopIds).toEqual(['my-computer', 'resume', 'guestbook', 'about-me', 'appearance-themes'])
    expect(startMenuIds).toContain('portfolio')
    expect(startMenuIds).toContain('appearance-themes')
  })

  it('returns no application for unsupported direct routes', () => {
    expect(applicationIdFromHash('#/apps/not-real')).toBeUndefined()
  })
})
