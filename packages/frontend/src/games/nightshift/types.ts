export const NIGHTSHIFT_LANES = [0, 1, 2] as const
export type NightshiftLane = (typeof NIGHTSHIFT_LANES)[number]

export type NightshiftStatus = 'ready' | 'playing' | 'paused' | 'game-over'
export type NightshiftTrafficKind = 'coupe' | 'van'

export type NightshiftInput = {
  steer: -1 | 0 | 1
  accelerate: boolean
  brake: boolean
}

export type NightshiftTraffic = {
  id: number
  lane: NightshiftLane
  kind: NightshiftTrafficKind
  y: number
  speed: number
}

export type NightshiftConfig = {
  seed: number
  laneCount: number
  maxHits: number
  spawnIntervalMs: number
}

export type NightshiftState = {
  status: NightshiftStatus
  seed: number
  randomState: number
  elapsedMs: number
  distance: number
  playerLane: NightshiftLane
  speedBand: 0 | 1 | 2
  hits: number
  nextTrafficId: number
  spawnElapsedMs: number
  traffic: readonly NightshiftTraffic[]
}

export const DEFAULT_NIGHTSHIFT_CONFIG: NightshiftConfig = {
  seed: 0x1a2b3c4d,
  laneCount: NIGHTSHIFT_LANES.length,
  maxHits: 2,
  spawnIntervalMs: 1_250,
}

export const DEFAULT_NIGHTSHIFT_INPUT: NightshiftInput = {
  steer: 0,
  accelerate: false,
  brake: false,
}

export const NIGHTSHIFT_LOGICAL_WIDTH = 320
export const NIGHTSHIFT_LOGICAL_HEIGHT = 180
export const NIGHTSHIFT_PLAYER_Y = 132
export const NIGHTSHIFT_TRAFFIC_DESPAWN_Y = 204
export const NIGHTSHIFT_COLLISION_DISTANCE = 18

export function isNightshiftLane(value: number): value is NightshiftLane {
  return NIGHTSHIFT_LANES.includes(value as NightshiftLane)
}

export function clampLane(value: number): NightshiftLane {
  return Math.max(NIGHTSHIFT_LANES[0], Math.min(NIGHTSHIFT_LANES[NIGHTSHIFT_LANES.length - 1], value)) as NightshiftLane
}

export function speedForBand(speedBand: NightshiftState['speedBand']): number {
  return [34, 58, 86][speedBand]
}

export function speedLabel(speedBand: NightshiftState['speedBand']): string {
  return ['COAST', 'CRUISE', 'BOOST'][speedBand]
}

export function statusLabel(status: NightshiftStatus): string {
  return {
    ready: 'READY',
    playing: 'RUNNING',
    paused: 'PAUSED',
    'game-over': 'SIGNAL LOST',
  }[status]
}
