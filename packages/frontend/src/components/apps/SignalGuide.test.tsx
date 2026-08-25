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

describe('SIGNAL.EXE Leonardo local portfolio guide', () => {
  it('focuses a labelled quick tool and appends a deterministic local projects reply', () => {
    renderGuide()

    const projects = screen.getByRole('button', { name: 'PROJECTS' })
    expect(projects).toHaveFocus()
    expect(screen.getByLabelText('MESSAGE THE LOCAL PORTFOLIO GUIDE')).not.toHaveFocus()

    fireEvent.click(projects)
    expect(screen.getByText('Show me the projects.')).toBeVisible()
    expect(within(screen.getByLabelText('Leonardo local portfolio guide conversation')).getByText(/MY MACHINE contains a portfolio-safe project grid/i)).toBeVisible()
    expect(screen.getByRole('button', { name: 'OPEN MY MACHINE' })).toBeVisible()
    expect(screen.getByText('LOCAL ONLY · NO NETWORK · NO STORAGE')).toBeVisible()
  })

  it('matches typed local input and authors a safe Leonardo fallback without network activity', () => {
    const fetchSpy = vi.spyOn(window, 'fetch')
    renderGuide()

    const composer = screen.getByLabelText('MESSAGE THE LOCAL PORTFOLIO GUIDE')
    fireEvent.change(composer, { target: { value: 'Tell me about your TypeScript skills' } })
    fireEvent.click(screen.getByRole('button', { name: 'SEND LOCAL' }))
    expect(within(screen.getByLabelText('Leonardo local portfolio guide conversation')).getByText(/This portfolio demonstrates React, TypeScript/i)).toBeVisible()

    fireEvent.change(composer, { target: { value: 'weather?' } })
    fireEvent.click(screen.getByRole('button', { name: 'SEND LOCAL' }))
    expect(within(screen.getByLabelText('Leonardo local portfolio guide conversation')).getByText(/This local portfolio guide matches projects, resume, experience/i)).toBeVisible()
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
  })

  it('uses the smart-blink owner rail only under full effects and falls back to the supplied static portrait after image failure', () => {
    renderGuide()

    const portrait = screen.getByLabelText('Leonardo local portfolio guide profile').querySelector('img')
    expect(portrait).not.toBeNull()
    expect(portrait).toHaveAttribute('src', expect.stringContaining('pixelos-leonardo-entry-hero-smart-blink-128.gif'))
    fireEvent.error(portrait!)
    expect(portrait).toHaveAttribute('src', expect.stringContaining('pixelos-leonardo-entry-hero-static-128.png'))
  })

  it('keeps WINK bounded and exposes the local-only privacy status without live-person language', () => {
    renderGuide()

    const wink = screen.getByRole('button', { name: 'WINK' })
    fireEvent.click(wink)
    expect(within(screen.getByLabelText('Leonardo local portfolio guide conversation')).getByText('LOCAL WINK MARKED. NO MESSAGE WAS SENT.')).toBeVisible()
    expect(wink).toBeDisabled()
    expect(screen.getByLabelText('SIGNAL local privacy status')).toHaveTextContent('NO NETWORK')
    expect(screen.getByLabelText('SIGNAL local privacy status')).toHaveTextContent('NO HISTORY')
    expect(screen.queryByText(/online|typing|available/i)).not.toBeInTheDocument()
  })
})
