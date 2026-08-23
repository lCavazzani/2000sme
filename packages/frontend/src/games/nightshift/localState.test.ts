import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_NIGHTSHIFT_LOCAL_STATE,
  NIGHTSHIFT_LOCAL_STATE_KEY,
  readNightshiftLocalState,
  writeNightshiftLocalState,
} from './localState'

describe('NIGHTSHIFT local state', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('reads a valid best distance and local guide preference', () => {
    window.localStorage.setItem(NIGHTSHIFT_LOCAL_STATE_KEY, JSON.stringify({ bestDistance: 245.8, showGuide: false }))

    expect(readNightshiftLocalState()).toEqual({ bestDistance: 245, showGuide: false })
  })

  it('returns safe defaults for malformed or incomplete stored values', () => {
    window.localStorage.setItem(NIGHTSHIFT_LOCAL_STATE_KEY, '{bad json')
    expect(readNightshiftLocalState()).toEqual(DEFAULT_NIGHTSHIFT_LOCAL_STATE)

    window.localStorage.setItem(NIGHTSHIFT_LOCAL_STATE_KEY, JSON.stringify({ bestDistance: -3, showGuide: 'yes' }))
    expect(readNightshiftLocalState()).toEqual(DEFAULT_NIGHTSHIFT_LOCAL_STATE)
  })

  it('writes normalized values and tolerates blocked storage', () => {
    writeNightshiftLocalState({ bestDistance: 12.9, showGuide: false })
    expect(window.localStorage.getItem(NIGHTSHIFT_LOCAL_STATE_KEY)).toBe(JSON.stringify({ bestDistance: 12, showGuide: false }))

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(() => writeNightshiftLocalState({ bestDistance: 20, showGuide: true })).not.toThrow()
  })
})
