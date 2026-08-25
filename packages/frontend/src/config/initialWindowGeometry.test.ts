import { describe, expect, it } from 'vitest'
import { applicationRegistry } from './applicationRegistry'
import { INITIAL_WINDOW_GEOMETRY, initialWindowGeometryFor } from './initialWindowGeometry'

describe('INITIAL_WINDOW_GEOMETRY', () => {
  it('provides one complete positive default for every registered application', () => {
    expect(Object.keys(INITIAL_WINDOW_GEOMETRY)).toEqual(applicationRegistry.map((application) => application.id))

    for (const application of applicationRegistry) {
      expect(INITIAL_WINDOW_GEOMETRY[application.id]).toEqual({
        x: application.x,
        y: application.y,
        width: application.width,
        height: application.height,
      })
      expect(application.width).toBeGreaterThan(0)
      expect(application.height).toBeGreaterThan(0)
      expect(application.x).toBeGreaterThanOrEqual(0)
      expect(application.y).toBeGreaterThanOrEqual(0)
    }
  })

  it('returns a fresh bounds object so callers cannot mutate the editable defaults', () => {
    const initial = initialWindowGeometryFor('gallery')
    initial.width = 1

    expect(initialWindowGeometryFor('gallery')).toEqual(INITIAL_WINDOW_GEOMETRY.gallery)
  })
})
