import {
  DEFAULT_NIGHTSHIFT_CONFIG,
  DEFAULT_NIGHTSHIFT_INPUT,
  NIGHTSHIFT_COLLISION_DISTANCE,
  NIGHTSHIFT_PLAYER_Y,
  NIGHTSHIFT_TRAFFIC_DESPAWN_Y,
  clampLane,
  speedForBand,
  type NightshiftConfig,
  type NightshiftInput,
  type NightshiftState,
  type NightshiftTraffic,
} from './types'

const MAX_STEP_MS = 100
const TRAFFIC_SPEEDS = [34, 48, 62] as const

export function seededRandom(state: number): readonly [value: number, nextState: number] {
  let value = state >>> 0
  value += 0x6d2b79f5
  let mixed = value
  mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1)
  mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61)
  return [((mixed ^ (mixed >>> 14)) >>> 0) / 4_294_967_296, value >>> 0]
}

export function createNightshiftState(config: Partial<NightshiftConfig> = {}): NightshiftState {
  const resolved = { ...DEFAULT_NIGHTSHIFT_CONFIG, ...config }

  return {
    status: 'ready',
    seed: resolved.seed >>> 0,
    randomState: resolved.seed >>> 0,
    elapsedMs: 0,
    distance: 0,
    playerLane: 1,
    speedBand: 1,
    hits: 0,
    nextTrafficId: 1,
    spawnElapsedMs: 0,
    traffic: [],
  }
}

export function startNightshift(state: NightshiftState): NightshiftState {
  if (state.status === 'playing') return state
  if (state.status === 'game-over') return createNightshiftState({ seed: state.seed })

  return { ...state, status: 'playing' }
}

export function pauseNightshift(state: NightshiftState): NightshiftState {
  return state.status === 'playing' ? { ...state, status: 'paused' } : state
}

export function resumeNightshift(state: NightshiftState): NightshiftState {
  return state.status === 'paused' ? { ...state, status: 'playing' } : state
}

export function restartNightshift(state: NightshiftState, seed = state.seed): NightshiftState {
  return createNightshiftState({ seed })
}

function spawnTraffic(state: NightshiftState): NightshiftState {
  const [laneRoll, laneState] = seededRandom(state.randomState)
  const [kindRoll, kindState] = seededRandom(laneState)
  const [speedRoll, nextState] = seededRandom(kindState)
  const traffic: NightshiftTraffic = {
    id: state.nextTrafficId,
    lane: clampLane(Math.floor(laneRoll * 3)),
    kind: kindRoll > 0.52 ? 'van' : 'coupe',
    y: -32,
    speed: TRAFFIC_SPEEDS[Math.min(TRAFFIC_SPEEDS.length - 1, Math.floor(speedRoll * TRAFFIC_SPEEDS.length))],
  }

  return {
    ...state,
    randomState: nextState,
    nextTrafficId: state.nextTrafficId + 1,
    traffic: [...state.traffic, traffic],
  }
}

function updateSpeedBand(speedBand: NightshiftState['speedBand'], input: NightshiftInput): NightshiftState['speedBand'] {
  if (input.accelerate) return Math.min(2, speedBand + 1) as NightshiftState['speedBand']
  if (input.brake) return Math.max(0, speedBand - 1) as NightshiftState['speedBand']
  return speedBand
}

function tickOnce(state: NightshiftState, input: NightshiftInput, config: NightshiftConfig, deltaMs: number): NightshiftState {
  const deltaSeconds = deltaMs / 1_000
  const speedBand = updateSpeedBand(state.speedBand, input)
  const playerLane = clampLane(state.playerLane + input.steer)
  const spawnElapsedMs = state.spawnElapsedMs + deltaMs
  const updatedTraffic = state.traffic
    .map((traffic) => ({ ...traffic, y: traffic.y + (traffic.speed + speedForBand(speedBand) * 0.28) * deltaSeconds }))
    .filter((traffic) => traffic.y < NIGHTSHIFT_TRAFFIC_DESPAWN_Y)

  let nextState: NightshiftState = {
    ...state,
    elapsedMs: state.elapsedMs + deltaMs,
    distance: state.distance + speedForBand(speedBand) * deltaSeconds,
    playerLane,
    speedBand,
    spawnElapsedMs,
    traffic: updatedTraffic,
  }

  while (nextState.spawnElapsedMs >= config.spawnIntervalMs) {
    nextState = spawnTraffic({ ...nextState, spawnElapsedMs: nextState.spawnElapsedMs - config.spawnIntervalMs })
  }

  const collidingTraffic = nextState.traffic.filter(
    (traffic) => traffic.lane === nextState.playerLane && Math.abs(traffic.y - NIGHTSHIFT_PLAYER_Y) <= NIGHTSHIFT_COLLISION_DISTANCE,
  )
  if (collidingTraffic.length === 0) return nextState

  const hits = Math.min(config.maxHits, nextState.hits + 1)
  const collidedIds = new Set(collidingTraffic.map((traffic) => traffic.id))
  return {
    ...nextState,
    hits,
    status: hits >= config.maxHits ? 'game-over' : 'paused',
    traffic: nextState.traffic.filter((traffic) => !collidedIds.has(traffic.id)),
  }
}

/** Advances only an actively playing state. Identical seed, input, and timestep yield identical output. */
export function tickNightshift(
  state: NightshiftState,
  input: NightshiftInput = DEFAULT_NIGHTSHIFT_INPUT,
  deltaMs: number,
  config: NightshiftConfig = DEFAULT_NIGHTSHIFT_CONFIG,
): NightshiftState {
  if (state.status !== 'playing' || deltaMs <= 0) return state

  let remainingMs = Math.min(deltaMs, 1_000)
  let nextState = state
  while (remainingMs > 0) {
    const stepMs = Math.min(MAX_STEP_MS, remainingMs)
    nextState = tickOnce(nextState, input, config, stepMs)
    if (nextState.status !== 'playing') break
    remainingMs -= stepMs
  }
  return nextState
}
