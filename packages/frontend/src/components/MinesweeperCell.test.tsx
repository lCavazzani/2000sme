import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MinesweeperCell } from './MinesweeperCell'

describe('MinesweeperCell', () => {
  it('renders a mine from the engine model after a lost game without requiring a UI rule fork', () => {
    render(
      <MinesweeperCell
        cell={{
          index: 0,
          row: 0,
          column: 0,
          isMine: true,
          adjacentMines: 0,
          isRevealed: false,
          isFlagged: false,
        }}
        display={{ kind: 'hidden' }}
        gameStatus="lost"
        isFocused
        onFocus={vi.fn()}
        onReveal={vi.fn()}
        onFlag={vi.fn()}
        onKeyDown={vi.fn()}
      />,
    )

    const mineCell = screen.getByRole('button', { name: 'Row 1, column 1, mine' })
    expect(mineCell).toHaveAttribute('data-cell-state', 'mine')
    expect(mineCell).toHaveTextContent('*')
  })
})
