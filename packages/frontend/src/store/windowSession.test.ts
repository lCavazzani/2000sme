import { afterEach, describe, expect, it, vi } from 'vitest'
import type { StoreState } from '../types/window'
import { readWindowSession, writeWindowSession } from './windowSession'

const state: StoreState = {
  topZ: 1,
  windows: [
    {
      id: 'portfolio',
      title: 'My Portfolio',
      x: 64,
      y: 64,
      width: 480,
      height: 320,
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      zIndex: 1,
    },
  ],
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('window session persistence', () => {
  it('falls back to an empty safe state when a stored session is malformed', () => {
    vi.stubGlobal('window', {
      innerWidth: 1024,
      innerHeight: 768,
      sessionStorage: { getItem: () => '{not-json' },
    })

    expect(readWindowSession()).toEqual({ windows: [], topZ: 0 })
  })

  it('does not throw when browser storage is unavailable or blocked', () => {
    vi.stubGlobal('window', {
      sessionStorage: {
        setItem: () => {
          throw new Error('Storage disabled')
        },
      },
    })

    expect(() => writeWindowSession(state)).not.toThrow()
  })
})
