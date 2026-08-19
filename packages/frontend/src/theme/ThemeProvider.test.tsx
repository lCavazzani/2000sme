import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider, useTheme } from './ThemeProvider'

function ThemeProbe() {
  const { theme, effectsPreference, setEffectsPreference } = useTheme()

  return (
    <>
      <output>Active visual target: {theme}</output>
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
    delete document.documentElement.dataset.osTheme
    delete document.documentElement.dataset.themeChrome
    delete document.documentElement.dataset.themeGloss
    delete document.documentElement.dataset.themeCrt
    delete document.documentElement.dataset.themeEffects
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('uses PixelOS as the single visual target and preserves its capability attributes', () => {
    installMatchMedia(false)

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    )

    const root = document.documentElement
    expect(root.dataset.osTheme).toBe('pixelos')
    expect(root.dataset.themeChrome).toBe('pixel')
    expect(root.dataset.themeGloss).toBe('off')
    expect(root.dataset.themeCrt).toBe('on')
    expect(root.dataset.themeEffects).toBe('full')
    expect(screen.getByText('Active visual target: pixelos')).toBeVisible()
    expect(document.querySelectorAll('link[data-os-theme]')).toHaveLength(0)
  })

  it('keeps PixelOS active while following system and manual reduced-effects preference changes', async () => {
    const media = installMatchMedia(false)

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    )

    const root = document.documentElement
    expect(root.dataset.osTheme).toBe('pixelos')

    media.setReducedEffects(true)
    await waitFor(() => expect(root.dataset.themeEffects).toBe('reduced'))

    media.setReducedEffects(false)
    await waitFor(() => expect(root.dataset.themeEffects).toBe('full'))
    fireEvent.click(screen.getByRole('button', { name: 'Set effects to reduced' }))
    expect(root.dataset.themeEffects).toBe('reduced')
    expect(window.localStorage.getItem('2000sme:effects')).toBe('reduced')
  })
})
