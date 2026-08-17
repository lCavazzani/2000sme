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

    const resumeLauncher = screen.getByRole('button', { name: 'Open Resume' })
    resumeLauncher.focus()
    await user.keyboard('{Enter}')

    const resumeWindow = screen.getByLabelText('resume.md - WordPad window')
    expect(resumeWindow).toBeInTheDocument()
    await waitFor(() => expect(resumeWindow).toHaveFocus())
  })

  it('minimizes, restores, and closes a window through visible taskbar and window controls', async () => {
    const user = userEvent.setup()
    render(<App />)

    const resumeLauncher = screen.getByRole('button', { name: 'Open Resume' })
    await user.dblClick(resumeLauncher)

    const taskbarButton = screen.getByRole('button', { name: 'resume.md - WordPad' })
    await user.click(screen.getByRole('button', { name: 'Minimize' }))

    expect(screen.queryByLabelText('resume.md - WordPad window')).not.toBeInTheDocument()
    expect(taskbarButton).toHaveAttribute('aria-pressed', 'false')

    await user.click(taskbarButton)
    expect(screen.getByLabelText('resume.md - WordPad window')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByLabelText('resume.md - WordPad window')).not.toBeInTheDocument()
    await waitFor(() => expect(resumeLauncher).toHaveFocus())
  })

  it('opens the Start menu by keyboard, restores focus on Escape, and launches its portfolio shortcut', async () => {
    const user = userEvent.setup()
    render(<App />)

    const startButton = screen.getByRole('button', { name: 'Start' })
    startButton.focus()
    await user.keyboard('{Enter}')

    const startMenu = await screen.findByRole('navigation', { name: 'Start menu' })
    const portfolioShortcut = screen.getByRole('button', { name: 'My Portfolio' })
    await waitFor(() => expect(portfolioShortcut).toHaveFocus())

    fireEvent.keyDown(startMenu, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('navigation', { name: 'Start menu' })).not.toBeInTheDocument())
    await waitFor(() => expect(startButton).toHaveFocus())

    await user.keyboard('{Enter}')
    await user.click(screen.getByRole('button', { name: 'My Portfolio' }))

    expect(screen.queryByRole('navigation', { name: 'Start menu' })).not.toBeInTheDocument()
    expect(screen.getByLabelText('My Portfolio window')).toBeInTheDocument()
  })
})
