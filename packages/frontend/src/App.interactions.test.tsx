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

    const resumeLauncher = screen.getByRole('button', { name: 'Open README.TXT' })
    resumeLauncher.focus()
    await user.keyboard('{Enter}')

    const resumeWindow = screen.getByLabelText('README.TXT - WORDPAD window')
    expect(resumeWindow).toBeInTheDocument()
    await waitFor(() => expect(resumeWindow).toHaveFocus())
  })

  it('minimizes, restores, and closes a window through visible taskbar and window controls', async () => {
    const user = userEvent.setup()
    render(<App />)

    const resumeLauncher = screen.getByRole('button', { name: 'Open README.TXT' })
    await user.dblClick(resumeLauncher)

    const taskbarButton = screen.getByRole('button', { name: 'README.TXT - WORDPAD' })
    await user.click(screen.getByRole('button', { name: 'Minimize' }))

    expect(screen.queryByLabelText('README.TXT - WORDPAD window')).not.toBeInTheDocument()
    expect(taskbarButton).toHaveAttribute('aria-pressed', 'false')

    await user.click(taskbarButton)
    expect(screen.getByLabelText('README.TXT - WORDPAD window')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByLabelText('README.TXT - WORDPAD window')).not.toBeInTheDocument()
    await waitFor(() => expect(resumeLauncher).toHaveFocus())
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
  window.location.hash = '#/apps/resume'
  render(<App />)

  expect(screen.getByRole('main', { name: 'README.TXT direct route' })).toBeInTheDocument()
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
