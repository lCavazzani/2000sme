import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from './App'

describe('desktop shell interactions', () => {
  beforeEach(() => {
    window.location.hash = ''
    window.sessionStorage.clear()
  })

  afterEach(() => {
    window.location.hash = ''
    window.sessionStorage.clear()
  })

  it('opens desktop applications with keyboard activation while keeping the launcher focused and usable', async () => {
    const user = userEvent.setup()
    render(<App />)

    const resumeLauncher = screen.getByRole('button', { name: 'Open RESUME.PDF' })
    resumeLauncher.focus()
    await user.keyboard('{Enter}')

    const resumeWindow = screen.getByLabelText('RESUME.PDF - WORDPAD window')
    expect(resumeWindow).toBeInTheDocument()
    await waitFor(() => expect(resumeWindow).toHaveFocus())
  })

  it('minimizes, restores, and closes a window through visible taskbar and window controls', async () => {
    const user = userEvent.setup()
    render(<App />)

    const resumeLauncher = screen.getByRole('button', { name: 'Open RESUME.PDF' })
    await user.dblClick(resumeLauncher)

    const taskbarButton = screen.getByRole('button', { name: 'RESUME.PDF - WORDPAD' })
    await user.click(screen.getByRole('button', { name: 'Minimize' }))

    expect(screen.queryByLabelText('RESUME.PDF - WORDPAD window')).not.toBeInTheDocument()
    expect(taskbarButton).toHaveAttribute('aria-pressed', 'false')

    await user.click(taskbarButton)
    expect(screen.getByLabelText('RESUME.PDF - WORDPAD window')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByLabelText('RESUME.PDF - WORDPAD window')).not.toBeInTheDocument()
    await waitFor(() => expect(resumeLauncher).toHaveFocus())
  })

  it('launches the playable Minesweeper window through desktop and Start-menu paths', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.dblClick(screen.getByRole('button', { name: 'Open MINESWEEPER.EXE' }))
    expect(screen.getByLabelText('MINESWEEPER.EXE window')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('READY: REVEAL A CELL TO START.')

    await user.click(screen.getByRole('button', { name: 'Close' }))
    await user.click(screen.getByRole('button', { name: 'Start' }))
    await user.click(screen.getByRole('button', { name: 'MINESWEEPER.EXE' }))
    expect(screen.getByLabelText('MINESWEEPER.EXE window')).toBeInTheDocument()
  })

  it('opens the Start menu by keyboard, restores focus on Escape, and launches its My Machine shortcut', async () => {
    const user = userEvent.setup()
    render(<App />)

    const startButton = screen.getByRole('button', { name: 'Start' })
    startButton.focus()
    await user.keyboard('{Enter}')

    const startMenu = await screen.findByRole('navigation', { name: 'Start menu' })
    const myMachineShortcut = screen.getByRole('button', { name: 'MY MACHINE' })
    await waitFor(() => expect(myMachineShortcut).toHaveFocus())

    fireEvent.keyDown(startMenu, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('navigation', { name: 'Start menu' })).not.toBeInTheDocument())
    await waitFor(() => expect(startButton).toHaveFocus())

    await user.keyboard('{Enter}')
    await user.click(screen.getByRole('button', { name: 'MY MACHINE' }))

    expect(screen.queryByRole('navigation', { name: 'Start menu' })).not.toBeInTheDocument()
    expect(screen.getByLabelText('MY MACHINE window')).toBeInTheDocument()
  })
})


it('switches between direct routes and desktop mode while restoring a meaningful desktop focus target', async () => {
  const user = userEvent.setup()
  window.location.hash = '#/apps/minesweeper'
  render(<App />)

  expect(screen.getByRole('main', { name: 'MINESWEEPER.EXE direct route' })).toBeInTheDocument()
  expect(screen.getByRole('status')).toHaveTextContent('READY: REVEAL A CELL TO START.')
  await user.click(screen.getByRole('button', { name: 'Open desktop' }))

  const desktop = screen.getByRole('main', { name: 'Desktop' })
  await waitFor(() => expect(desktop).toHaveFocus())
  expect(window.location.hash).toBe('')

  window.location.hash = '#/apps/about-me'
  fireEvent(window, new HashChangeEvent('hashchange'))
  expect(screen.getByRole('main', { name: 'Desktop' })).toBeInTheDocument()

  window.location.hash = ''
  fireEvent(window, new HashChangeEvent('hashchange'))
  expect(screen.getByRole('main', { name: 'Desktop' })).toBeInTheDocument()
})
