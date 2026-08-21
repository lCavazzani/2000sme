import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { MinesweeperWindow } from './MinesweeperWindow'

describe('MinesweeperWindow', () => {
  it('renders engine-backed counter, timer, reset, functional menus, and semantic status', async () => {
    const user = userEvent.setup()
    render(<MinesweeperWindow />)

    expect(screen.getByLabelText('10 mines remaining')).toHaveTextContent('010')
    expect(screen.getByLabelText('0 seconds elapsed')).toHaveTextContent('000')
    expect(screen.getByRole('status')).toHaveTextContent('READY: REVEAL A CELL TO START.')

    await user.click(screen.getByRole('button', { name: 'Game' }))
    expect(screen.getByRole('menu', { name: 'Game menu' })).toBeInTheDocument()
    await user.click(screen.getByRole('menuitem', { name: 'New game' }))
    expect(screen.getByRole('status')).toHaveTextContent('READY: REVEAL A CELL TO START.')

    await user.click(screen.getByRole('button', { name: 'Help' }))
    expect(screen.getByLabelText('Minesweeper controls')).toHaveTextContent('ENTER OR SPACE REVEALS')
  })

  it('reveals and flags cells through the GAME-2 actions, then resets through the accessible reset control', async () => {
    const user = userEvent.setup()
    render(<MinesweeperWindow />)

    const flagCell = screen.getByRole('button', { name: 'Row 1, column 3, covered cell' })
    fireEvent.contextMenu(flagCell)
    expect(screen.getByRole('button', { name: 'Row 1, column 3, flagged cell' })).toBeInTheDocument()

    const firstCell = screen.getByRole('button', { name: 'Row 1, column 1, covered cell' })
    await user.click(firstCell)
    expect(screen.getByRole('status')).toHaveTextContent('IN PROGRESS')

    await user.click(screen.getByRole('button', { name: 'Start a new Minesweeper game' }))
    expect(screen.getByRole('status')).toHaveTextContent('READY: REVEAL A CELL TO START.')
    expect(screen.getByRole('button', { name: 'Row 1, column 3, covered cell' })).toBeInTheDocument()
  })

  it('uses roving focus with documented keyboard equivalents for movement and flags', async () => {
    const user = userEvent.setup()
    render(<MinesweeperWindow />)

    const firstCell = screen.getByRole('button', { name: 'Row 1, column 1, covered cell' })
    firstCell.focus()
    await user.keyboard('{ArrowRight}')

    const secondCell = screen.getByRole('button', { name: 'Row 1, column 2, covered cell' })
    expect(secondCell).toHaveFocus()

    await user.keyboard('f')
    expect(screen.getByRole('button', { name: 'Row 1, column 2, flagged cell' })).toHaveFocus()
  })
})
