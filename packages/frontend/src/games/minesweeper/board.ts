import type { MinesweeperCell, MinesweeperConfig } from './types'

export function cellIndex(config: MinesweeperConfig, row: number, column: number) {
  return row * config.columns + column
}

export function isWithinBoard(config: MinesweeperConfig, row: number, column: number) {
  return row >= 0 && row < config.rows && column >= 0 && column < config.columns
}

export function adjacentIndexes(config: MinesweeperConfig, index: number) {
  const row = Math.floor(index / config.columns)
  const column = index % config.columns
  const indexes: number[] = []

  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
      if (rowOffset === 0 && columnOffset === 0) continue
      const adjacentRow = row + rowOffset
      const adjacentColumn = column + columnOffset
      if (isWithinBoard(config, adjacentRow, adjacentColumn)) {
        indexes.push(cellIndex(config, adjacentRow, adjacentColumn))
      }
    }
  }

  return indexes
}

/** Mulberry32 is deterministic, compact, and sufficient for predictable board placement. */
export function seededRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296
  }
}

export function createEmptyBoard(config: MinesweeperConfig): MinesweeperCell[] {
  return Array.from({ length: config.rows * config.columns }, (_, index) => ({
    index,
    row: Math.floor(index / config.columns),
    column: index % config.columns,
    isMine: false,
    adjacentMines: 0,
    isRevealed: false,
    isFlagged: false,
  }))
}

export function validateConfig(config: MinesweeperConfig) {
  const capacity = config.rows * config.columns
  if (!Number.isInteger(config.rows) || !Number.isInteger(config.columns) || !Number.isInteger(config.mineCount)) {
    throw new Error('Minesweeper configuration values must be integers.')
  }
  if (config.rows < 1 || config.columns < 1) {
    throw new Error('Minesweeper board dimensions must be positive.')
  }
  if (config.mineCount < 0 || config.mineCount >= capacity) {
    throw new Error('Minesweeper mine count must leave at least one safe cell.')
  }
}

export function createBoard(config: MinesweeperConfig, seed: number, safeIndex?: number): MinesweeperCell[] {
  validateConfig(config)
  const cells = createEmptyBoard(config)
  const candidates = cells.map((cell) => cell.index).filter((index) => index !== safeIndex)
  const random = seededRandom(seed)

  for (let mineNumber = 0; mineNumber < config.mineCount; mineNumber += 1) {
    const selection = Math.floor(random() * candidates.length)
    const [mineIndex] = candidates.splice(selection, 1)
    cells[mineIndex] = { ...cells[mineIndex], isMine: true }
  }

  return cells.map((cell) => ({
    ...cell,
    adjacentMines: cell.isMine
      ? 0
      : adjacentIndexes(config, cell.index).filter((index) => cells[index].isMine).length,
  }))
}
