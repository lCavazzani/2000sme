import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

/**
 * Windows 7 remains a retained technical preview so its runtime asset can be
 * inspected without being presented as a supported release theme.
 */
export type ThemeId = 'win98' | 'winxp' | 'win7'
export type ActiveThemeId = Exclude<ThemeId, 'win7'>
export type EffectsPreference = 'system' | 'reduced'
export type ResolvedEffects = 'full' | 'reduced'

export const ACTIVE_THEME_IDS: readonly ActiveThemeId[] = ['winxp', 'win98']
export const DEFAULT_THEME: ActiveThemeId = 'winxp'
const STORAGE_KEY = '2000sme:theme'
const EFFECTS_STORAGE_KEY = '2000sme:effects'

const stylesheets: Record<ThemeId, string> = {
  win98: '/themes/98.css',
  winxp: '/themes/xp.css',
  // Retained intentionally as a dormant technical preview; it is not selectable
  // in the release UI and is not included in the active compatibility promise.
  win7: '/themes/7.css',
}

const SEMANTIC_OVERRIDE_STYLESHEET = '/themes/semantic-overrides.css'

const themeCapabilities: Record<ActiveThemeId, {
  chrome: 'bevel' | 'luna'
  gloss: 'off' | 'on'
  crt: 'off' | 'on'
}> = {
  win98: { chrome: 'bevel', gloss: 'off', crt: 'off' },
  winxp: { chrome: 'luna', gloss: 'on', crt: 'off' },
}

type ThemeContextValue = {
  theme: ActiveThemeId
  setTheme: (theme: ActiveThemeId) => void
  effectsPreference: EffectsPreference
  setEffectsPreference: (effectsPreference: EffectsPreference) => void
  effects: ResolvedEffects
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function isActiveThemeId(value: string | null): value is ActiveThemeId {
  return value === 'win98' || value === 'winxp'
}

function isEffectsPreference(value: string | null): value is EffectsPreference {
  return value === 'system' || value === 'reduced'
}

function readStoredTheme(): ActiveThemeId {
  try {
    const storedTheme = window.localStorage.getItem(STORAGE_KEY)
    // Older builds could persist win7. Normalize it to the current release
    // default instead of loading a preview as if it had release parity.
    return isActiveThemeId(storedTheme) ? storedTheme : DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
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

function persistTheme(theme: ActiveThemeId) {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Storage is optional; the in-memory theme remains active.
  }
}

function persistEffectsPreference(effectsPreference: EffectsPreference) {
  try {
    window.localStorage.setItem(EFFECTS_STORAGE_KEY, effectsPreference)
  } catch {
    // Storage is optional; the in-memory preference remains active.
  }
}

function getThemeLink() {
  const links = document.querySelectorAll<HTMLLinkElement>('link[data-os-theme]')
  links.forEach((link, index) => {
    if (index > 0) link.remove()
  })

  const existing = document.getElementById('os-theme')
  if (existing instanceof HTMLLinkElement) return existing

  const link = document.createElement('link')
  link.id = 'os-theme'
  link.dataset.osTheme = 'true'
  link.rel = 'stylesheet'
  document.head.append(link)
  return link
}

function getSemanticOverridesLink(themeLink: HTMLLinkElement) {
  const existing = document.getElementById('os-theme-overrides')
  const link = existing instanceof HTMLLinkElement ? existing : document.createElement('link')

  link.id = 'os-theme-overrides'
  link.dataset.osThemeOverrides = 'true'
  link.rel = 'stylesheet'
  link.href = SEMANTIC_OVERRIDE_STYLESHEET
  themeLink.after(link)
  return link
}

function applyThemeAttributes(theme: ActiveThemeId, effects: ResolvedEffects) {
  const root = document.documentElement
  const capabilities = themeCapabilities[theme]
  root.dataset.osTheme = theme
  root.dataset.themeChrome = capabilities.chrome
  root.dataset.themeGloss = capabilities.gloss
  root.dataset.themeCrt = capabilities.crt
  root.dataset.themeEffects = effects
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setActiveTheme] = useState<ActiveThemeId>(readStoredTheme)
  const [effectsPreference, setActiveEffectsPreference] = useState<EffectsPreference>(readStoredEffectsPreference)
  const [systemReducedMotion, setSystemReducedMotion] = useState(readSystemReducedMotion)
  const effects: ResolvedEffects = effectsPreference === 'reduced' || systemReducedMotion ? 'reduced' : 'full'

  const setTheme = useCallback((nextTheme: ActiveThemeId) => {
    persistTheme(nextTheme)
    setActiveTheme(nextTheme)
  }, [])

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
    const link = getThemeLink()
    getSemanticOverridesLink(link)
    let disposed = false
    const handleLoad = () => {
      if (!disposed) applyThemeAttributes(theme, effects)
    }
    const handleError = () => {
      if (!disposed && theme !== DEFAULT_THEME) {
        persistTheme(DEFAULT_THEME)
        setActiveTheme(DEFAULT_THEME)
      }
    }

    link.addEventListener('load', handleLoad)
    link.addEventListener('error', handleError)
    applyThemeAttributes(theme, effects)
    if (link.dataset.themeId !== theme) {
      link.dataset.themeId = theme
      link.href = stylesheets[theme]
    }
    return () => {
      disposed = true
      link.removeEventListener('load', handleLoad)
      link.removeEventListener('error', handleError)
    }
  }, [effects, theme])

  const value = useMemo(
    () => ({ theme, setTheme, effectsPreference, setEffectsPreference, effects }),
    [effects, effectsPreference, setEffectsPreference, setTheme, theme],
  )
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used inside <ThemeProvider>')
  return context
}
