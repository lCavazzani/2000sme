import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const gameHook = vi.hoisted(() => vi.fn())

vi.mock('./useMinesweeperGame', () => ({
  useMinesweeperGame: gameHook,
}))

import { MinesweeperWindow } from './MinesweeperWindow'

function gameResult(status: 'won' | 'lost') {
  const isLost = status === 'lost'
  return {
    game: {
      config: { rows: 1, columns: 2, mineCount: 1 },
      seed: 12,
      status,
      isInitialized: true,
      cells: [
        {
          index: 0,
          row: 0,
          column: 0,
          isMine: false,
          adjacentMines: 1,
          isRevealed: true,
          isFlagged: false,
        },
        {
          index: 1,
          row: 0,
          column: 1,
          isMine: true,
          adjacentMines: 0,
          isRevealed: isLost,
          isFlagged: false,
        },
      ],
    },
    elapsedSeconds: 18,
    remainingMines: 1,
    reveal: vi.fn(),
    flag: vi.fn(),
    reset: vi.fn(),
  }
}

describe('MinesweeperWindow terminal state presentation', () => {
  beforeEach(() => {
    gameHook.mockReset()
  })

  it('communicates a won game with semantic status and a distinct reset-face cue', () => {
    gameHook.mockReturnValue(gameResult('won'))
    render(<MinesweeperWindow />)

    expect(screen.getByRole('status')).toHaveTextContent('CLEARED: EVERY SAFE CELL IS REVEALED.')
    expect(screen.getByRole('button', { name: 'Start a new Minesweeper game' })).toHaveTextContent(':D')
  })

  it('communicates a lost game and exposes engine-known mines with a non-color cue', () => {
    gameHook.mockReturnValue(gameResult('lost'))
    render(<MinesweeperWindow />)

    expect(screen.getByRole('status')).toHaveTextContent('MINE DETONATED: START A NEW GAME TO TRY AGAIN.')
    expect(screen.getByRole('button', { name: 'Start a new Minesweeper game' })).toHaveTextContent('X(')
    expect(screen.getByRole('button', { name: 'Row 1, column 2, mine' })).toHaveTextContent('*')
  })
})
