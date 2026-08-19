import { createContext, useCallback, useContext, useEffect, useReducer, type ReactNode } from 'react'
import { findApplication } from '../config/applicationRegistry'
import type { Viewport, WindowBounds, WindowConfig, WindowsContextValue } from '../types/window'
import { readWindowSession, writeWindowSession } from './windowSession'
import { windowsReducer } from './windowsReducer'

const WindowsContext = createContext<WindowsContextValue | null>(null)

function getViewport(): Viewport {
  return { width: window.innerWidth, height: window.innerHeight }
}

export function WindowsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(windowsReducer, undefined, () => {
    const storedState = readWindowSession()
    return {
      ...storedState,
      // PixelOS may retire registry entries while retaining the session schema.
      // Unsupported saved windows are omitted rather than rendering a stale
      // shell or making a retired public application reachable.
      windows: storedState.windows.filter((windowState) => findApplication(windowState.id)),
    }
  })

  useEffect(() => {
    writeWindowSession(state)
  }, [state])

  useEffect(() => {
    const constrainToViewport = () => dispatch({ type: 'CONSTRAIN_TO_VIEWPORT', viewport: getViewport() })
    constrainToViewport()
    window.addEventListener('resize', constrainToViewport)
    return () => window.removeEventListener('resize', constrainToViewport)
  }, [])

  const openWindow = useCallback((config: WindowConfig) => dispatch({ type: 'OPEN', config }), [])
  const openWindowById = useCallback((id: string) => {
    const app = findApplication(id)
    if (app) dispatch({ type: 'OPEN', config: app })
  }, [])
  const closeWindow = useCallback((id: string) => dispatch({ type: 'CLOSE', id }), [])
  const focusWindow = useCallback((id: string) => dispatch({ type: 'FOCUS', id }), [])
  const minimizeWindow = useCallback((id: string) => dispatch({ type: 'MINIMIZE', id }), [])
  const restoreWindow = useCallback((id: string) => dispatch({ type: 'RESTORE', id }), [])
  const toggleMaximizeWindow = useCallback(
    (id: string) => dispatch({ type: 'TOGGLE_MAXIMIZE', id, viewport: getViewport() }),
    [],
  )
  const resetWindowBounds = useCallback(
    (id: string) => {
      const app = findApplication(id)
      const existing = state.windows.find((windowState) => windowState.id === id)
      const bounds: WindowBounds | undefined = app ?? existing?.restoreBounds
      if (bounds) dispatch({ type: 'RESET_BOUNDS', id, bounds, viewport: getViewport() })
    },
    [state.windows],
  )
  const updateBounds = useCallback(
    (id: string, bounds: WindowBounds) => dispatch({ type: 'UPDATE_BOUNDS', id, bounds, viewport: getViewport() }),
    [],
  )

  return (
    <WindowsContext.Provider
      value={{
        windows: state.windows,
        openWindow,
        openWindowById,
        closeWindow,
        focusWindow,
        minimizeWindow,
        restoreWindow,
        toggleMaximizeWindow,
        resetWindowBounds,
        updateBounds,
      }}
    >
      {children}
    </WindowsContext.Provider>
  )
}

export function useWindows() {
  const ctx = useContext(WindowsContext)
  if (!ctx) throw new Error('useWindows must be used inside <WindowsProvider>')
  return ctx
}
