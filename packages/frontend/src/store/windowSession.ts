import type { StoreState, Viewport, WindowState } from '../types/window'
import { constrainBounds, INITIAL_STATE } from './windowsReducer'

const STORAGE_KEY = '2000sme.window-session.v1'

type PersistedWindow = Pick<
  WindowState,
  'id' | 'title' | 'icon' | 'isOpen' | 'isMinimized' | 'isMaximized' | 'zIndex' | 'x' | 'y' | 'width' | 'height' | 'restoreBounds'
>

type PersistedWindowSession = {
  windows: PersistedWindow[]
  topZ: number
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isPersistedWindow(value: unknown): value is PersistedWindow {
  if (!value || typeof value !== 'object') return false
  const windowState = value as Record<string, unknown>
  return (
    typeof windowState.id === 'string' &&
    typeof windowState.title === 'string' &&
    typeof windowState.isOpen === 'boolean' &&
    typeof windowState.isMinimized === 'boolean' &&
    typeof windowState.isMaximized === 'boolean' &&
    isFiniteNumber(windowState.zIndex) &&
    isFiniteNumber(windowState.x) &&
    isFiniteNumber(windowState.y) &&
    isFiniteNumber(windowState.width) &&
    isFiniteNumber(windowState.height)
  )
}

function viewportOrFallback(): Viewport {
  if (typeof window === 'undefined') return { width: 1280, height: 720 }
  return { width: window.innerWidth, height: window.innerHeight }
}

export function readWindowSession(viewport = viewportOrFallback()): StoreState {
  if (typeof window === 'undefined') return INITIAL_STATE

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return INITIAL_STATE

    const parsed = JSON.parse(raw) as Partial<PersistedWindowSession>
    if (!Array.isArray(parsed.windows) || !isFiniteNumber(parsed.topZ)) return INITIAL_STATE

    const windows = parsed.windows
      .filter(isPersistedWindow)
      .map((windowState) => ({
        ...windowState,
        ...constrainBounds(windowState, viewport),
        restoreBounds: windowState.restoreBounds
          ? constrainBounds(windowState.restoreBounds, viewport)
          : undefined,
      }))

    return { windows, topZ: Math.max(parsed.topZ, ...windows.map((windowState) => windowState.zIndex), 0) }
  } catch {
    return INITIAL_STATE
  }
}

export function writeWindowSession(state: StoreState): void {
  if (typeof window === 'undefined') return

  try {
    const session: PersistedWindowSession = { windows: state.windows, topZ: state.topZ }
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch {
    // Private browsing, storage quotas, and browser policy must not block the desktop.
  }
}
