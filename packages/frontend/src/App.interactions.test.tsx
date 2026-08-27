import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from './App'

describe('desktop shell interactions', () => {
  beforeEach(() => {
    window.location.hash = ''
    window.sessionStorage.clear()
    window.sessionStorage.setItem('2000sme:pixelos-intro-seen:v1', 'true')
  })

  afterEach(() => {
    window.location.hash = ''
    window.sessionStorage.clear()
  })

  it('auto-opens RESUME.PDF while keeping its desktop launcher focused and usable', async () => {
    const user = userEvent.setup()
    render(<App />)

    const resumeWindow = screen.getByLabelText('RESUME.PDF - WORDPAD window')
    expect(resumeWindow).toBeInTheDocument()
    await waitFor(() => expect(resumeWindow).toHaveFocus())

    const resumeLauncher = screen.getByRole('button', { name: 'Open RESUME.PDF' })
    resumeLauncher.focus()
    await user.keyboard('{Enter}')
    expect(screen.getByLabelText('RESUME.PDF - WORDPAD window')).toBeInTheDocument()
  })

  it('minimizes, restores, and closes a window through visible taskbar and window controls', async () => {
    const user = userEvent.setup()
    render(<App />)

    const resumeLauncher = screen.getByRole('button', { name: 'Open RESUME.PDF' })
    const resumeWindow = screen.getByLabelText('RESUME.PDF - WORDPAD window')

    const taskbarButton = screen.getByRole('button', { name: 'RESUME.PDF - WORDPAD' })
    await user.click(within(resumeWindow).getByRole('button', { name: 'Minimize' }))

    expect(screen.queryByLabelText('RESUME.PDF - WORDPAD window')).not.toBeInTheDocument()
    expect(taskbarButton).toHaveAttribute('aria-pressed', 'false')

    await user.click(taskbarButton)
    const restoredResumeWindow = screen.getByLabelText('RESUME.PDF - WORDPAD window')
    expect(restoredResumeWindow).toBeInTheDocument()

    await user.click(within(restoredResumeWindow).getByRole('button', { name: 'Close' }))
    expect(screen.queryByLabelText('RESUME.PDF - WORDPAD window')).not.toBeInTheDocument()
    await waitFor(() => expect(resumeLauncher).toHaveFocus())
  })

  it('launches the playable Minesweeper window through desktop and Start-menu paths', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.dblClick(screen.getByRole('button', { name: 'Open MINESWEEPER.EXE' }))
    expect(screen.getByLabelText('MINESWEEPER.EXE window')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('READY: REVEAL A CELL TO START.')

    await user.click(screen.getByRole('button', { name: 'Start' }))
    const startMenu = await screen.findByRole('navigation', { name: 'Start menu' })
    await user.click(within(startMenu).getByRole('button', { name: 'MINESWEEPER.EXE' }))
    expect(screen.getByLabelText('MINESWEEPER.EXE window')).toBeInTheDocument()
  })

  it('closes a focused window on Escape and dismisses the Start menu globally', async () => {
    const user = userEvent.setup()
    render(<App />)

    const resumeWindow = screen.getByLabelText('RESUME.PDF - WORDPAD window')
    await waitFor(() => expect(resumeWindow).toHaveFocus())
    await user.keyboard('{Escape}')

    expect(screen.queryByLabelText('RESUME.PDF - WORDPAD window')).not.toBeInTheDocument()

    const startButton = screen.getByRole('button', { name: 'Start' })
    await user.click(startButton)
    expect(await screen.findByRole('navigation', { name: 'Start menu' })).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('navigation', { name: 'Start menu' })).not.toBeInTheDocument())
    await waitFor(() => expect(startButton).toHaveFocus())
  })

  it('opens the Start menu, restores focus on Escape, and launches its My Machine shortcut', async () => {
    const user = userEvent.setup()
    render(<App />)

    await waitFor(() => expect(screen.getByLabelText('RESUME.PDF - WORDPAD window')).toHaveFocus())

    const startButton = screen.getByRole('button', { name: 'Start' })
    await user.click(startButton)

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

  expect(screen.getByRole('main', { name: 'Desktop' })).toBeInTheDocument()
  const resumeWindow = screen.getByLabelText('RESUME.PDF - WORDPAD window')
  await waitFor(() => expect(resumeWindow).toHaveFocus())
  expect(window.location.hash).toBe('')

  window.location.hash = '#/apps/about-me'
  fireEvent(window, new HashChangeEvent('hashchange'))
  expect(screen.getByRole('main', { name: 'Desktop' })).toBeInTheDocument()

  window.location.hash = ''
  fireEvent(window, new HashChangeEvent('hashchange'))
  expect(screen.getByRole('main', { name: 'Desktop' })).toBeInTheDocument()
})
