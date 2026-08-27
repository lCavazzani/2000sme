import { describe, expect, it } from 'vitest'
import {
  createNightshiftState,
  pauseNightshift,
  restartNightshift,
  startNightshift,
  tickNightshift,
} from './engine'

describe('NIGHTSHIFT deterministic core', () => {
  it('produces the same traffic outcome for the same seed and input sequence', () => {
    const initial = startNightshift(createNightshiftState({ seed: 42, spawnIntervalMs: 200 }))
    const inputs = [
      { steer: 0 as const, accelerate: false, brake: false },
      { steer: 1 as const, accelerate: true, brake: false },
      { steer: -1 as const, accelerate: false, brake: true },
    ]

    const outcome = inputs.reduce((state, input) => tickNightshift(state, input, 250, { seed: 42, laneCount: 3, maxHits: 2, spawnIntervalMs: 200 }), initial)
    const repeated = inputs.reduce((state, input) => tickNightshift(state, input, 250, { seed: 42, laneCount: 3, maxHits: 2, spawnIntervalMs: 200 }), initial)

    expect(outcome).toEqual(repeated)
  })

  it('keeps the player in the three approved road lanes', () => {
    let game = startNightshift(createNightshiftState())
    for (let index = 0; index < 10; index += 1) game = tickNightshift(game, { steer: -1, accelerate: false, brake: false }, 20)
    expect(game.playerLane).toBe(0)

    for (let index = 0; index < 10; index += 1) game = tickNightshift(game, { steer: 1, accelerate: false, brake: false }, 20)
    expect(game.playerLane).toBe(2)
  })

  it('freezes paused simulation state', () => {
    const playing = startNightshift(createNightshiftState())
    const paused = pauseNightshift(tickNightshift(playing, { steer: 0, accelerate: false, brake: false }, 400))
    expect(tickNightshift(paused, { steer: 1, accelerate: true, brake: false }, 800)).toEqual(paused)
  })

  it('pauses after the first collision and reaches game over after the second', () => {
    const base = startNightshift(createNightshiftState())
    const collision = { id: 1, lane: 1 as const, kind: 'coupe' as const, y: 132, speed: 0 }
    const firstImpact = tickNightshift({ ...base, traffic: [collision] }, { steer: 0, accelerate: false, brake: false }, 1)
    expect(firstImpact.status).toBe('paused')
    expect(firstImpact.hits).toBe(1)

    const secondImpact = tickNightshift({ ...firstImpact, status: 'playing', traffic: [{ ...collision, id: 2 }] }, { steer: 0, accelerate: false, brake: false }, 1)
    expect(secondImpact.status).toBe('game-over')
    expect(secondImpact.hits).toBe(2)
  })

  it('restarts with a fresh ready state and preserved deterministic seed', () => {
    const game = startNightshift(createNightshiftState({ seed: 99 }))
    const reset = restartNightshift(game)
    expect(reset.status).toBe('ready')
    expect(reset.seed).toBe(99)
    expect(reset.traffic).toEqual([])
  })
})
