export type WindowState = {
  id: string
  title: string
  icon?: string
  isOpen: boolean
  isMinimized: boolean
  zIndex: number
  x: number
  y: number
  width: number
  height: number
}

export type WindowConfig = Omit<WindowState, 'isOpen' | 'isMinimized' | 'zIndex'>

export type StoreState = {
  windows: WindowState[]
  topZ: number
}

export type Action =
  | { type: 'OPEN'; config: WindowConfig }
  | { type: 'CLOSE'; id: string }
  | { type: 'FOCUS'; id: string }
  | { type: 'MINIMIZE'; id: string }
  | { type: 'UPDATE_BOUNDS'; id: string; x: number; y: number; width: number; height: number }

export type WindowsContextValue = {
  windows: WindowState[]
  openWindow: (config: WindowConfig) => void
  openWindowById: (id: string) => void
  closeWindow: (id: string) => void
  focusWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  updateBounds: (id: string, x: number, y: number, width: number, height: number) => void
}
