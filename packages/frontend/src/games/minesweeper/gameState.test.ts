import { describe, expect, it } from 'vitest'
import { createEmptyBoard } from './board'
import { createGameState, resetGame } from './gameState'
import { revealCell, toggleFlag } from './rules'
import type { MinesweeperState } from './types'

const smallConfig = { rows: 3, columns: 3, mineCount: 1 }

function stateWithTopLeftMine(): MinesweeperState {
  const cells = createEmptyBoard(smallConfig).map((cell) => {
    const isMine = cell.index === 0
    const adjacentMines = isMine ? 0 : [1, 3, 4].includes(cell.index) ? 1 : 0
    return { ...cell, isMine, adjacentMines }
  })

  return {
    config: smallConfig,
    seed: 1,
    status: 'playing',
    isInitialized: true,
    cells,
  }
}

describe('Minesweeper game state', () => {
  it('creates repeatable empty runs and makes the first selected cell safe', () => {
    const firstRun = revealCell(createGameState(smallConfig, 42), 1, 1)
    const secondRun = revealCell(createGameState(smallConfig, 42), 1, 1)

    expect(firstRun).toEqual(secondRun)
    expect(firstRun.cells[4].isMine).toBe(false)
    expect(firstRun.cells[4].isRevealed).toBe(true)
  })

  it('flood-reveals connected empty cells and their boundary numbers', () => {
    const state = revealCell(stateWithTopLeftMine(), 2, 2)

    expect(state.status).toBe('won')
    expect(state.cells.filter((cell) => cell.isRevealed && !cell.isMine)).toHaveLength(8)
    expect(state.cells[0].isRevealed).toBe(false)
    expect(state.cells[1].adjacentMines).toBe(1)
  })

  it('toggles flags without revealing or corrupting the underlying cell', () => {
    const flagged = toggleFlag(createGameState(smallConfig, 7), 0, 1)
    const unflagged = toggleFlag(flagged, 0, 1)

    expect(flagged.cells[1]).toMatchObject({ isFlagged: true, isRevealed: false })
    expect(unflagged.cells[1]).toMatchObject({ isFlagged: false, isRevealed: false })
  })

  it('loses only when a revealed cell is a mine', () => {
    const state = revealCell(stateWithTopLeftMine(), 0, 0)

    expect(state.status).toBe('lost')
    expect(state.cells[0]).toMatchObject({ isMine: true, isRevealed: true })
  })

  it('reset discards terminal state, revealed cells, flags, and initialized board data', () => {
    const lost = revealCell(stateWithTopLeftMine(), 0, 0)
    const reset = resetGame(lost, 19)

    expect(reset).toMatchObject({ status: 'ready', isInitialized: false, seed: 19 })
    expect(reset.cells.every((cell) => !cell.isRevealed && !cell.isFlagged && !cell.isMine)).toBe(true)
  })
})
