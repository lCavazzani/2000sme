import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { WindowsProvider } from '../../store/windows'
import { ThemeProvider } from '../../theme/ThemeProvider'
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
  it('places the three labelled topic tools in the owner rail and appends a deterministic local projects reply', () => {
    renderGuide()

    const ownerRail = screen.getByLabelText('Leonardo local portfolio guide profile')
    const projects = within(ownerRail).getByRole('button', { name: 'PROJECTS' })
    expect(projects).toHaveFocus()
    expect(within(ownerRail).getByRole('button', { name: 'RESUME' })).toBeVisible()
    expect(within(ownerRail).getByRole('button', { name: 'ABOUT' })).toBeVisible()
    expect(screen.queryByRole('button', { name: 'WINK' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'ATTENTION' })).not.toBeInTheDocument()

    fireEvent.click(projects)
    expect(screen.getByText('Show me the projects.')).toBeVisible()
    expect(within(screen.getByLabelText('Leonardo local portfolio guide conversation')).getByText(/MY MACHINE contains a portfolio-safe project grid/i)).toBeVisible()
    expect(screen.getByRole('button', { name: 'OPEN MY MACHINE' })).toBeVisible()
  })

  it('uses one inline Send control for typed deterministic local replies without network activity', () => {
    const fetchSpy = vi.spyOn(window, 'fetch')
    renderGuide()

    const composer = screen.getByLabelText('MESSAGE THE LOCAL PORTFOLIO GUIDE')
    const send = screen.getByRole('button', { name: 'SEND' })
    expect(send).toBeDisabled()

    fireEvent.change(composer, { target: { value: 'Tell me about your TypeScript skills' } })
    expect(send).toBeEnabled()
    fireEvent.click(send)
    expect(within(screen.getByLabelText('Leonardo local portfolio guide conversation')).getByText(/This portfolio demonstrates React, TypeScript/i)).toBeVisible()

    fireEvent.change(composer, { target: { value: 'weather?' } })
    fireEvent.click(send)
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

  it('keeps hidden local semantics while removing redundant privacy, owner-context, and transient event surfaces', () => {
    renderGuide()

    expect(screen.getByText('LOCAL GUIDE READY')).toHaveAttribute('aria-live', 'polite')
    expect(screen.queryByText('LOCAL ONLY · NO NETWORK · NO STORAGE')).not.toBeInTheDocument()
    expect(screen.queryByText('OWNER CONTEXT')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('SIGNAL local privacy status')).not.toBeInTheDocument()
    expect(screen.queryByText(/online|typing|available/i)).not.toBeInTheDocument()
  })
})
