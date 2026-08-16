export type WindowBounds = {
  x: number
  y: number
  width: number
  height: number
}

export type Viewport = {
  width: number
  height: number
}

export type WindowState = WindowBounds & {
  id: string
  title: string
  icon?: string
  isOpen: boolean
  isMinimized: boolean
  isMaximized: boolean
  zIndex: number
  restoreBounds?: WindowBounds
}

export type WindowConfig = Omit<WindowState, 'isOpen' | 'isMinimized' | 'isMaximized' | 'zIndex' | 'restoreBounds'>

export type StoreState = {
  windows: WindowState[]
  topZ: number
}

export type Action =
  | { type: 'OPEN'; config: WindowConfig }
  | { type: 'CLOSE'; id: string }
  | { type: 'FOCUS'; id: string }
  | { type: 'MINIMIZE'; id: string }
  | { type: 'RESTORE'; id: string }
  | { type: 'TOGGLE_MAXIMIZE'; id: string; viewport: Viewport }
  | { type: 'RESET_BOUNDS'; id: string; bounds: WindowBounds; viewport: Viewport }
  | { type: 'UPDATE_BOUNDS'; id: string; bounds: WindowBounds; viewport: Viewport }
  | { type: 'CONSTRAIN_TO_VIEWPORT'; viewport: Viewport }

export type WindowsContextValue = {
  windows: WindowState[]
  openWindow: (config: WindowConfig) => void
  openWindowById: (id: string) => void
  closeWindow: (id: string) => void
  focusWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  restoreWindow: (id: string) => void
  toggleMaximizeWindow: (id: string) => void
  resetWindowBounds: (id: string) => void
  updateBounds: (id: string, bounds: WindowBounds) => void
}
