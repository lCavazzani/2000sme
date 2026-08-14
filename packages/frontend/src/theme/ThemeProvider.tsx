import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type ThemeId = 'win98' | 'winxp' | 'win7'

const DEFAULT_THEME: ThemeId = 'win98'
const STORAGE_KEY = '2000sme:theme'
const stylesheets: Record<ThemeId, string> = {
  win98: '/themes/98.css',
  winxp: '/themes/xp.css',
  win7: '/themes/7.css',
}

const ThemeContext = createContext<{
  theme: ThemeId
  setTheme: (theme: ThemeId) => void
} | null>(null)

function isThemeId(value: string | null): value is ThemeId {
  return value === 'win98' || value === 'winxp' || value === 'win7'
}

function readStoredTheme(): ThemeId {
  try {
    const storedTheme = window.localStorage.getItem(STORAGE_KEY)
    return isThemeId(storedTheme) ? storedTheme : DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

function persistTheme(theme: ThemeId) {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Storage is optional; the in-memory theme remains active.
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

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setActiveTheme] = useState<ThemeId>(readStoredTheme)
  const setTheme = useCallback((nextTheme: ThemeId) => {
    persistTheme(nextTheme)
    setActiveTheme(nextTheme)
  }, [])

  useLayoutEffect(() => {
    const link = getThemeLink()
    let disposed = false
    const handleLoad = () => {
      if (!disposed) document.documentElement.dataset.osTheme = theme
    }
    const handleError = () => {
      if (!disposed && theme !== DEFAULT_THEME) {
        persistTheme(DEFAULT_THEME)
        setActiveTheme(DEFAULT_THEME)
      }
    }

    link.addEventListener('load', handleLoad)
    link.addEventListener('error', handleError)
    document.documentElement.dataset.osTheme = theme
    if (link.dataset.themeId !== theme) {
      link.dataset.themeId = theme
      link.href = stylesheets[theme]
    }

    return () => {
      disposed = true
      link.removeEventListener('load', handleLoad)
      link.removeEventListener('error', handleError)
    }
  }, [theme])

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used inside <ThemeProvider>')
  return context
}
