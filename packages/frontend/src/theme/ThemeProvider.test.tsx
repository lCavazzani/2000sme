import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider, useTheme } from './ThemeProvider'

function ThemeProbe() {
  const { theme, setTheme, effectsPreference, setEffectsPreference } = useTheme()

  return (
    <>
      <button type="button" onClick={() => setTheme(theme === 'winxp' ? 'win98' : 'winxp')}>
        Switch from {theme}
      </button>
      <button
        type="button"
        onClick={() => setEffectsPreference(effectsPreference === 'system' ? 'reduced' : 'system')}
      >
        Set effects to {effectsPreference === 'system' ? 'reduced' : 'system'}
      </button>
    </>
  )
}

type MediaChangeListener = (event: Pick<MediaQueryListEvent, 'matches'>) => void

function installMatchMedia(matches = false) {
  let changeListener: MediaChangeListener | undefined
  const mediaQuery = {
    matches,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addEventListener: vi.fn((event: string, listener: MediaChangeListener) => {
      if (event === 'change') changeListener = listener
    }),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }

  vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery))

  return {
    setReducedEffects(nextMatches: boolean) {
      mediaQuery.matches = nextMatches
      changeListener?.({ matches: nextMatches })
    },
  }
}

describe('ThemeProvider semantic theme contract', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.querySelectorAll('#os-theme, #os-theme-overrides').forEach((link) => link.remove())
    delete document.documentElement.dataset.osTheme
    delete document.documentElement.dataset.themeChrome
    delete document.documentElement.dataset.themeGloss
    delete document.documentElement.dataset.themeCrt
    delete document.documentElement.dataset.themeEffects
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('uses XP semantic capabilities by default and keeps the override stylesheet after the vendor theme stylesheet', () => {
    installMatchMedia(false)

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    )

    const root = document.documentElement
    const themeLink = document.getElementById('os-theme')
    const overrideLink = document.getElementById('os-theme-overrides')

    expect(root.dataset.osTheme).toBe('winxp')
    expect(root.dataset.themeChrome).toBe('luna')
    expect(root.dataset.themeGloss).toBe('on')
    expect(root.dataset.themeCrt).toBe('off')
    expect(root.dataset.themeEffects).toBe('full')
    expect(themeLink).toHaveAttribute('href', '/themes/xp.css')
    expect(overrideLink).toHaveAttribute('href', '/themes/semantic-overrides.css')
    expect(themeLink?.nextElementSibling).toBe(overrideLink)
    expect(document.querySelectorAll('link[data-os-theme]')).toHaveLength(1)
  })

  it('switches semantic capabilities to Windows 98 and follows reduced-effects preference changes', async () => {
    const media = installMatchMedia(false)

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Switch from winxp' }))

    const root = document.documentElement
    expect(root.dataset.osTheme).toBe('win98')
    expect(root.dataset.themeChrome).toBe('bevel')
    expect(root.dataset.themeGloss).toBe('off')
    expect(window.localStorage.getItem('2000sme:theme')).toBe('win98')
    expect(document.getElementById('os-theme')).toHaveAttribute('href', '/themes/98.css')
    expect(document.querySelectorAll('link[data-os-theme]')).toHaveLength(1)

    media.setReducedEffects(true)
    await waitFor(() => expect(root.dataset.themeEffects).toBe('reduced'))

    media.setReducedEffects(false)
    await waitFor(() => expect(root.dataset.themeEffects).toBe('full'))
    fireEvent.click(screen.getByRole('button', { name: 'Set effects to reduced' }))
    expect(root.dataset.themeEffects).toBe('reduced')
    expect(window.localStorage.getItem('2000sme:effects')).toBe('reduced')
  })
})
