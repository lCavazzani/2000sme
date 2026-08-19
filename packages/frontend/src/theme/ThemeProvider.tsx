import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import './pixelos.css'

export type ActiveThemeId = 'pixelos'
export type EffectsPreference = 'system' | 'reduced'
export type ResolvedEffects = 'full' | 'reduced'

export const ACTIVE_THEME_IDS: readonly ActiveThemeId[] = ['pixelos']
export const DEFAULT_THEME: ActiveThemeId = 'pixelos'
const EFFECTS_STORAGE_KEY = '2000sme:effects'

type ThemeContextValue = {
  theme: ActiveThemeId
  effectsPreference: EffectsPreference
  setEffectsPreference: (effectsPreference: EffectsPreference) => void
  effects: ResolvedEffects
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function isEffectsPreference(value: string | null): value is EffectsPreference {
  return value === 'system' || value === 'reduced'
}

function readStoredEffectsPreference(): EffectsPreference {
  try {
    const storedPreference = window.localStorage.getItem(EFFECTS_STORAGE_KEY)
    return isEffectsPreference(storedPreference) ? storedPreference : 'system'
  } catch {
    return 'system'
  }
}

function readSystemReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

function persistEffectsPreference(effectsPreference: EffectsPreference) {
  try {
    window.localStorage.setItem(EFFECTS_STORAGE_KEY, effectsPreference)
  } catch {
    // Storage is optional; the in-memory preference remains active.
  }
}

function applyPixelOsAttributes(effects: ResolvedEffects) {
  const root = document.documentElement
  root.dataset.osTheme = DEFAULT_THEME
  root.dataset.themeChrome = 'pixel'
  root.dataset.themeGloss = 'off'
  root.dataset.themeCrt = 'on'
  root.dataset.themeEffects = effects
}

/**
 * PixelOS is a single product target. This provider retains the existing
 * reduced-effects preference and root capability attributes, but it no longer
 * swaps XP/98 stylesheets or exposes a runtime product-theme selector.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [effectsPreference, setActiveEffectsPreference] = useState<EffectsPreference>(readStoredEffectsPreference)
  const [systemReducedMotion, setSystemReducedMotion] = useState(readSystemReducedMotion)
  const effects: ResolvedEffects = effectsPreference === 'reduced' || systemReducedMotion ? 'reduced' : 'full'

  const setEffectsPreference = useCallback((nextEffectsPreference: EffectsPreference) => {
    persistEffectsPreference(nextEffectsPreference)
    setActiveEffectsPreference(nextEffectsPreference)
  }, [])

  useLayoutEffect(() => {
    const reducedMotionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    const syncSystemReducedMotion = () => setSystemReducedMotion(reducedMotionQuery?.matches ?? false)
    reducedMotionQuery?.addEventListener('change', syncSystemReducedMotion)
    syncSystemReducedMotion()
    return () => reducedMotionQuery?.removeEventListener('change', syncSystemReducedMotion)
  }, [])

  useLayoutEffect(() => {
    applyPixelOsAttributes(effects)
  }, [effects])

  const value = useMemo(
    () => ({ theme: DEFAULT_THEME, effectsPreference, setEffectsPreference, effects }),
    [effects, effectsPreference, setEffectsPreference],
  )
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used inside <ThemeProvider>')
  return context
}
