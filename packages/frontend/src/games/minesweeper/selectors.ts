import type { CellDisplay, MinesweeperCell, MinesweeperState } from './types'

export function flaggedCount(state: MinesweeperState) {
  return state.cells.filter((cell) => cell.isFlagged).length
}

export function remainingMineEstimate(state: MinesweeperState) {
  return Math.max(0, state.config.mineCount - flaggedCount(state))
}

export function cellDisplay(cell: MinesweeperCell): CellDisplay {
  if (cell.isFlagged) return { kind: 'flagged' }
  if (!cell.isRevealed) return { kind: 'hidden' }
  if (cell.isMine) return { kind: 'mine' }
  if (cell.adjacentMines === 0) return { kind: 'empty' }
  return { kind: 'number', value: cell.adjacentMines }
}

export function isTerminal(state: MinesweeperState) {
  return state.status === 'won' || state.status === 'lost'
}
