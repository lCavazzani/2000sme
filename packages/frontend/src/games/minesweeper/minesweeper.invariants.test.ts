import { describe, expect, it } from 'vitest'
import { createEmptyBoard } from './board'
import { createGameState, resetGame } from './gameState'
import { revealCell, toggleFlag } from './rules'
import type { MinesweeperConfig, MinesweeperState } from './types'

const representativeConfigs: readonly MinesweeperConfig[] = [
  { rows: 2, columns: 2, mineCount: 1 },
  { rows: 3, columns: 5, mineCount: 4 },
  { rows: 5, columns: 5, mineCount: 8 },
  { rows: 9, columns: 9, mineCount: 10 },
]

function stateWithTopLeftMine(): MinesweeperState {
  const config = { rows: 3, columns: 3, mineCount: 1 }
  const cells = createEmptyBoard(config).map((cell) => {
    const isMine = cell.index === 0
    return {
      ...cell,
      isMine,
      adjacentMines: isMine ? 0 : [1, 3, 4].includes(cell.index) ? 1 : 0,
    }
  })

  return { config, seed: 1, status: 'playing', isInitialized: true, cells }
}

function runDeterministicSequence(config: MinesweeperConfig, seed: number) {
  let state = createGameState(config, seed)
  state = toggleFlag(state, 0, 0)
  state = toggleFlag(state, 0, 0)
  state = revealCell(state, 0, 0)
  state = toggleFlag(state, config.rows - 1, config.columns - 1)
  return state
}

describe('TEST-8 Minesweeper invariants', () => {
  it('keeps every first reveal safe across representative sizes, seeds, and cell positions', () => {
    for (const config of representativeConfigs) {
      for (let seed = 0; seed < 32; seed += 1) {
        for (let row = 0; row < config.rows; row += 1) {
          for (let column = 0; column < config.columns; column += 1) {
            const state = revealCell(createGameState(config, seed), row, column)
            const index = row * config.columns + column
            expect(state.cells[index].isMine, `seed ${seed}, cell ${row},${column}`).toBe(false)
            expect(state.cells[index].isRevealed, `seed ${seed}, cell ${row},${column}`).toBe(true)
          }
        }
      }
    }
  })

  it('creates exactly the configured mine count after first reveal for representative inputs', () => {
    for (const config of representativeConfigs) {
      for (let seed = 0; seed < 64; seed += 1) {
        const state = revealCell(createGameState(config, seed), 0, 0)
        expect(state.cells.filter((cell) => cell.isMine), `${JSON.stringify(config)} / ${seed}`).toHaveLength(config.mineCount)
      }
    }
  })

  it('produces the same state for the same seed and action sequence', () => {
    for (const config of representativeConfigs) {
      for (let seed = 0; seed < 48; seed += 1) {
        expect(runDeterministicSequence(config, seed)).toEqual(runDeterministicSequence(config, seed))
      }
    }
  })

  it('floods valid connected empty cells while exposing boundary numbers only', () => {
    const state = revealCell(stateWithTopLeftMine(), 2, 2)
    const hiddenMine = state.cells[0]
    const boundaryNumbers = state.cells.filter((cell) => cell.adjacentMines > 0 && !cell.isMine)

    expect(hiddenMine.isRevealed).toBe(false)
    expect(boundaryNumbers.every((cell) => cell.isRevealed)).toBe(true)
    expect(state.cells.filter((cell) => !cell.isMine && cell.isRevealed)).toHaveLength(8)
  })

  it('keeps repeated flag toggles valid and never reveals a flagged cell', () => {
    let state = createGameState({ rows: 4, columns: 4, mineCount: 2 }, 9)
    for (let iteration = 0; iteration < 12; iteration += 1) {
      state = toggleFlag(state, 2, 1)
      expect(state.cells[9].isRevealed).toBe(false)
    }
    expect(state.cells[9].isFlagged).toBe(false)

    state = toggleFlag(state, 2, 1)
    const unchanged = revealCell(state, 2, 1)
    expect(unchanged).toBe(state)
    expect(unchanged.cells[9]).toMatchObject({ isFlagged: true, isRevealed: false })
  })

  it('cannot report contradictory terminal states and ties terminal states to their defined board conditions', () => {
    const lost = revealCell(stateWithTopLeftMine(), 0, 0)
    const won = revealCell(stateWithTopLeftMine(), 2, 2)

    expect(lost.status).toBe('lost')
    expect(lost.cells.some((cell) => cell.isMine && cell.isRevealed)).toBe(true)
    expect(won.status).toBe('won')
    expect(won.cells.every((cell) => cell.isMine || cell.isRevealed)).toBe(true)
  })

  it('reset discards the prior run, including flags, reveals, terminal state, and initialized board data', () => {
    const initial = createGameState({ rows: 4, columns: 4, mineCount: 2 }, 3)
    const flagged = toggleFlag(initial, 1, 1)
    const played = revealCell(flagged, 0, 0)
    const reset = resetGame(played, 77)

    expect(reset).toMatchObject({ status: 'ready', isInitialized: false, seed: 77 })
    expect(reset.cells.every((cell) => !cell.isMine && !cell.isRevealed && !cell.isFlagged)).toBe(true)
    expect(reset.cells).not.toEqual(played.cells)
  })
})
