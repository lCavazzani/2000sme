import { afterEach, describe, expect, it } from 'vitest'
import {
  createNightshiftState,
  restartNightshift,
  startNightshift,
  tickNightshift,
} from './engine'
import { DEFAULT_NIGHTSHIFT_CONFIG, type NightshiftInput } from './types'
import {
  DEFAULT_NIGHTSHIFT_LOCAL_STATE,
  NIGHTSHIFT_LOCAL_STATE_KEY,
  readNightshiftLocalState,
  writeNightshiftLocalState,
} from './localState'

const QUALITY_CONFIG = {
  ...DEFAULT_NIGHTSHIFT_CONFIG,
  seed: 20260823,
  spawnIntervalMs: 180,
}

const SCRIPT: readonly NightshiftInput[] = [
  { steer: 0, accelerate: true, brake: false },
  { steer: 1, accelerate: true, brake: false },
  { steer: 0, accelerate: false, brake: false },
  { steer: -1, accelerate: false, brake: true },
  { steer: 0, accelerate: false, brake: false },
]

function scriptedOutcome() {
  return SCRIPT.reduce(
    (state, input) => tickNightshift(state, input, 220, QUALITY_CONFIG),
    startNightshift(createNightshiftState(QUALITY_CONFIG)),
  )
}

afterEach(() => {
  window.localStorage.clear()
})

describe('TEST-15 NIGHTSHIFT quality contract', () => {
  it('keeps a fixed seed and scripted inputs deterministic across repeated simulation runs', () => {
    const first = scriptedOutcome()
    const repeated = scriptedOutcome()

    expect(first).toEqual(repeated)
    expect(first.distance).toBeGreaterThan(0)
    expect(first.traffic.every((traffic) => traffic.lane >= 0 && traffic.lane <= 2)).toBe(true)
    expect(first.speedBand).toBeGreaterThanOrEqual(0)
    expect(first.speedBand).toBeLessThanOrEqual(2)
  })

  it('scores distance, clamps speed, and preserves a ready state after restart', () => {
    let game = startNightshift(createNightshiftState(QUALITY_CONFIG))
    game = tickNightshift(game, { steer: 0, accelerate: true, brake: false }, 100)
    game = tickNightshift(game, { steer: 0, accelerate: true, brake: false }, 100)
    game = tickNightshift(game, { steer: 0, accelerate: true, brake: false }, 100)

    expect(game.speedBand).toBe(2)
    expect(game.distance).toBeGreaterThan(0)

    game = tickNightshift(game, { steer: 0, accelerate: false, brake: true }, 100)
    game = tickNightshift(game, { steer: 0, accelerate: false, brake: true }, 100)
    game = tickNightshift(game, { steer: 0, accelerate: false, brake: true }, 100)
    expect(game.speedBand).toBe(0)

    const restarted = restartNightshift(game)
    expect(restarted).toMatchObject({ status: 'ready', distance: 0, hits: 0, speedBand: 1 })
    expect(restarted.traffic).toEqual([])
  })

  it('applies bounded damage before game-over and removes colliding traffic deterministically', () => {
    const base = startNightshift(createNightshiftState(QUALITY_CONFIG))
    const traffic = { id: 7, lane: 1 as const, kind: 'coupe' as const, y: 132, speed: 0 }
    const firstHit = tickNightshift({ ...base, traffic: [traffic] }, { steer: 0, accelerate: false, brake: false }, 1, QUALITY_CONFIG)
    const finalHit = tickNightshift(
      { ...firstHit, status: 'playing', traffic: [{ ...traffic, id: 8 }] },
      { steer: 0, accelerate: false, brake: false },
      1,
      QUALITY_CONFIG,
    )

    expect(firstHit).toMatchObject({ status: 'paused', hits: 1, traffic: [] })
    expect(finalHit).toMatchObject({ status: 'game-over', hits: 2, traffic: [] })
  })

  it('persists only valid local best-distance and guide values, then recovers from malformed storage', () => {
    writeNightshiftLocalState({ bestDistance: 42.8, showGuide: false })
    expect(readNightshiftLocalState()).toEqual({ bestDistance: 42, showGuide: false })

    window.localStorage.setItem(NIGHTSHIFT_LOCAL_STATE_KEY, '{"bestDistance":-5,"showGuide":"yes"}')
    expect(readNightshiftLocalState()).toEqual(DEFAULT_NIGHTSHIFT_LOCAL_STATE)
  })
})
