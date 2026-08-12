import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react'
import type { WindowConfig, WindowsContextValue } from '../types/window'
import { windowsReducer, INITIAL_STATE } from './windowsReducer'

const WindowsContext = createContext<WindowsContextValue | null>(null)

export function WindowsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(windowsReducer, INITIAL_STATE)

  const openWindow = useCallback(
    (config: WindowConfig) => dispatch({ type: 'OPEN', config }),
    []
  )
  const closeWindow = useCallback(
    (id: string) => dispatch({ type: 'CLOSE', id }),
    []
  )
  const focusWindow = useCallback(
    (id: string) => dispatch({ type: 'FOCUS', id }),
    []
  )
  const minimizeWindow = useCallback(
    (id: string) => dispatch({ type: 'MINIMIZE', id }),
    []
  )
  const updateBounds = useCallback(
    (id: string, x: number, y: number, width: number, height: number) =>
      dispatch({ type: 'UPDATE_BOUNDS', id, x, y, width, height }),
    []
  )

  return (
    <WindowsContext.Provider
      value={{ windows: state.windows, openWindow, closeWindow, focusWindow, minimizeWindow, updateBounds }}
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
