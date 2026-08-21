import { cellIndex, createBoard, isWithinBoard, adjacentIndexes } from './board'
import { resetGame } from './gameState'
import type { MinesweeperCell, MinesweeperState } from './types'

function initializeBoard(state: MinesweeperState, safeIndex: number): MinesweeperState {
  if (state.isInitialized) return state
  const board = createBoard(state.config, state.seed, safeIndex).map((cell) => ({
    ...cell,
    isFlagged: state.cells[cell.index]?.isFlagged ?? false,
  }))
  return {
    ...state,
    status: 'playing',
    isInitialized: true,
    cells: board,
  }
}

function revealIndexes(state: MinesweeperState, firstIndex: number) {
  const cells = state.cells.slice() as MinesweeperCell[]
  const pending = [firstIndex]
  const revealed = new Set<number>()

  while (pending.length > 0) {
    const index = pending.pop()
    if (index === undefined || revealed.has(index)) continue
    const cell = cells[index]
    if (cell.isRevealed || cell.isFlagged || cell.isMine) continue

    revealed.add(index)
    cells[index] = { ...cell, isRevealed: true }

    if (cell.adjacentMines === 0) {
      for (const adjacentIndex of adjacentIndexes(state.config, index)) {
        const adjacentCell = cells[adjacentIndex]
        if (!adjacentCell.isRevealed && !adjacentCell.isFlagged && !adjacentCell.isMine) {
          pending.push(adjacentIndex)
        }
      }
    }
  }

  return cells
}

function hasWon(cells: readonly MinesweeperCell[]) {
  return cells.every((cell) => cell.isMine || cell.isRevealed)
}

export function revealCell(state: MinesweeperState, row: number, column: number): MinesweeperState {
  if (!isWithinBoard(state.config, row, column) || state.status === 'won' || state.status === 'lost') {
    return state
  }

  const index = cellIndex(state.config, row, column)
  const initialCell = state.cells[index]
  if (initialCell.isFlagged || initialCell.isRevealed) return state

  const initializedState = initializeBoard(state, index)
  const selectedCell = initializedState.cells[index]

  if (selectedCell.isMine) {
    return {
      ...initializedState,
      status: 'lost',
      cells: initializedState.cells.map((cell) =>
        cell.index === index ? { ...cell, isRevealed: true } : cell,
      ),
    }
  }

  const cells = revealIndexes(initializedState, index)
  return {
    ...initializedState,
    status: hasWon(cells) ? 'won' : 'playing',
    cells,
  }
}

export function toggleFlag(state: MinesweeperState, row: number, column: number): MinesweeperState {
  if (!isWithinBoard(state.config, row, column) || state.status === 'won' || state.status === 'lost') {
    return state
  }

  const index = cellIndex(state.config, row, column)
  const cell = state.cells[index]
  if (cell.isRevealed) return state

  const cells = state.cells.map((currentCell) =>
    currentCell.index === index ? { ...currentCell, isFlagged: !currentCell.isFlagged } : currentCell,
  )

  return {
    ...state,
    cells,
  }
}

export { resetGame }
