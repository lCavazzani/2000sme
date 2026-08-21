export type GameStatus = 'ready' | 'playing' | 'won' | 'lost'

export type MinesweeperConfig = {
  rows: number
  columns: number
  mineCount: number
}

export type MinesweeperCell = {
  index: number
  row: number
  column: number
  isMine: boolean
  adjacentMines: number
  isRevealed: boolean
  isFlagged: boolean
}

export type MinesweeperState = {
  config: MinesweeperConfig
  seed: number
  status: GameStatus
  isInitialized: boolean
  cells: readonly MinesweeperCell[]
}

export type CellDisplay =
  | { kind: 'hidden' }
  | { kind: 'flagged' }
  | { kind: 'mine' }
  | { kind: 'number'; value: number }
  | { kind: 'empty' }
