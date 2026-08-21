import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { WindowsProvider } from '../store/windows'
import { ThemeProvider } from '../theme/ThemeProvider'
import { PixelOSIntroGate } from './PixelOSIntroGate'

function renderIntroGate() {
  return render(
    <ThemeProvider>
      <WindowsProvider>
        <PixelOSIntroGate />
      </WindowsProvider>
    </ThemeProvider>,
  )
}

describe('PixelOSIntroGate', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
    window.localStorage.clear()
    window.history.replaceState(null, '', '/')
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('offers an immediately focusable Skip intro action that enters the existing desktop', () => {
    renderIntroGate()

    const skip = screen.getByRole('button', { name: 'Skip intro' })
    expect(skip).toHaveFocus()
    fireEvent.click(skip)

    expect(screen.getByRole('main', { name: 'Desktop' })).toBeInTheDocument()
    expect(window.sessionStorage.getItem('2000sme:pixelos-intro-seen:v1')).toBe('true')
  })

  it('keeps the visible boot card long enough to read before entering the semantic Enter PixelOS screen', () => {
    vi.useFakeTimers()
    renderIntroGate()

    act(() => {
      vi.advanceTimersByTime(1_599)
    })
    expect(screen.getByRole('button', { name: 'Skip intro' })).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1)
    })

    const enter = screen.getByRole('button', { name: 'Enter Desktop' })
    expect(enter).toHaveFocus()
    expect(screen.getByText('LEONARDO CAVAZZANI')).toBeInTheDocument()
    expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument()
    const portrait = screen.getByText('LEONARDO CAVAZZANI').closest('section')?.querySelector('img')
    expect(portrait).toHaveAttribute('src', '/pixelos/portraits/pixelos-leonardo-entry-hero-00.png')
    expect(portrait).toHaveAttribute('width', '128')
    expect(portrait).toHaveAttribute('height', '128')
    expect(portrait).toHaveAttribute('alt', '')

    fireEvent.click(enter)
    expect(screen.getByRole('main', { name: 'Desktop' })).toBeInTheDocument()
  })

  it('bypasses both intro stages for direct application routes', () => {
    window.history.replaceState(null, '', '/#/apps/minesweeper')
    renderIntroGate()

    expect(screen.getByRole('main', { name: 'MINESWEEPER.EXE direct route' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Skip intro' })).not.toBeInTheDocument()
  })

  it('uses the session-only seen flag and reduced-effects preference to avoid required boot animation', () => {
    window.sessionStorage.setItem('2000sme:pixelos-intro-seen:v1', 'true')
    const firstRender = renderIntroGate()
    expect(screen.getByRole('main', { name: 'Desktop' })).toBeInTheDocument()
    firstRender.unmount()

    window.sessionStorage.clear()
    window.localStorage.setItem('2000sme:effects', 'reduced')
    renderIntroGate()

    expect(screen.getByRole('button', { name: 'Enter Desktop' })).toHaveFocus()
    expect(screen.queryByRole('button', { name: 'Skip intro' })).not.toBeInTheDocument()
  })
})
