import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ThemeProvider } from '../../theme/ThemeProvider'
import { WindowsProvider } from '../../store/windows'
import { SignalGuide } from './SignalGuide'

function renderGuide() {
  return render(
    <ThemeProvider>
      <WindowsProvider>
        <SignalGuide />
      </WindowsProvider>
    </ThemeProvider>,
  )
}

describe('SIGNAL.EXE local Mittens guide', () => {
  it('focuses a quick prompt rather than the composer and appends a local projects reply', () => {
    renderGuide()

    const projects = screen.getByRole('button', { name: 'PROJECTS' })
    expect(projects).toHaveFocus()
    expect(screen.getByLabelText('ASK THE LOCAL GUIDE')).not.toHaveFocus()

    fireEvent.click(projects)
    expect(screen.getByText('Show me the projects.')).toBeVisible()
    expect(within(screen.getByLabelText('Mittens local guide conversation')).getByText(/MY MACHINE contains a portfolio-safe project grid/i)).toBeVisible()
    expect(screen.getByRole('button', { name: 'OPEN MY MACHINE' })).toBeVisible()
  })

  it('matches typed local input and authors a safe fallback without network activity', () => {
    const fetchSpy = vi.spyOn(window, 'fetch')
    renderGuide()

    const composer = screen.getByLabelText('ASK THE LOCAL GUIDE')
    fireEvent.change(composer, { target: { value: 'Tell me about your TypeScript skills' } })
    fireEvent.click(screen.getByRole('button', { name: 'SEND LOCAL' }))
    expect(within(screen.getByLabelText('Mittens local guide conversation')).getByText(/This portfolio demonstrates React, TypeScript/i)).toBeVisible()

    fireEvent.change(composer, { target: { value: 'weather?' } })
    fireEvent.click(screen.getByRole('button', { name: 'SEND LOCAL' }))
    expect(within(screen.getByLabelText('Mittens local guide conversation')).getByText(/I only match local portfolio topics/i)).toBeVisible()
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
  })

  it('keeps WINK bounded and exposes the guide as local-only', () => {
    renderGuide()

    const wink = screen.getByRole('button', { name: 'WINK' })
    fireEvent.click(wink)
    expect(screen.getByText('MITTENS SENT A LOCAL WINK.')).toBeVisible()
    expect(wink).toBeDisabled()
    expect(screen.getByLabelText('SIGNAL local privacy status')).toHaveTextContent('NO NETWORK')
    expect(screen.getByLabelText('SIGNAL local privacy status')).toHaveTextContent('NO HISTORY')
  })
})
