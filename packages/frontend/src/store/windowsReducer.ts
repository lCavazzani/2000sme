import type { Action, StoreState, Viewport, WindowBounds, WindowState } from '../types/window'

export const MIN_WINDOW_WIDTH = 200
export const MIN_WINDOW_HEIGHT = 150
export const TASKBAR_HEIGHT = 52
export const TITLEBAR_HEIGHT = 32

export const INITIAL_STATE: StoreState = {
  windows: [],
  topZ: 0,
}

function maxWindowBounds(viewport: Viewport): WindowBounds {
  return {
    x: 0,
    y: 0,
    width: Math.max(1, viewport.width),
    height: Math.max(1, viewport.height - TASKBAR_HEIGHT),
  }
}

export function constrainBounds(bounds: WindowBounds, viewport: Viewport): WindowBounds {
  const availableHeight = Math.max(1, viewport.height - TASKBAR_HEIGHT)
  const width = Math.min(Math.max(bounds.width, MIN_WINDOW_WIDTH), Math.max(1, viewport.width))
  const height = Math.min(Math.max(bounds.height, MIN_WINDOW_HEIGHT), availableHeight)
  const maxX = Math.max(0, viewport.width - width)
  const maxY = Math.max(0, availableHeight - Math.min(height, TITLEBAR_HEIGHT))

  return {
    width,
    height,
    x: Math.min(Math.max(0, bounds.x), maxX),
    y: Math.min(Math.max(0, bounds.y), maxY),
  }
}

function withFocus(state: StoreState, id: string, update: (windowState: WindowState) => WindowState): StoreState {
  if (!state.windows.some((windowState) => windowState.id === id)) return state

  const nextZ = state.topZ + 1
  return {
    topZ: nextZ,
    windows: state.windows.map((windowState) =>
      windowState.id === id ? { ...update(windowState), zIndex: nextZ } : windowState,
    ),
  }
}

export function windowsReducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case 'OPEN': {
      const existing = state.windows.find((windowState) => windowState.id === action.config.id)
      const nextZ = state.topZ + 1

      if (existing) {
        return {
          topZ: nextZ,
          windows: state.windows.map((windowState) =>
            windowState.id === action.config.id
              ? { ...windowState, isOpen: true, isMinimized: false, zIndex: nextZ }
              : windowState,
          ),
        }
      }

      return {
        topZ: nextZ,
        windows: [
          ...state.windows,
          {
            ...action.config,
            isOpen: true,
            isMinimized: false,
            isMaximized: false,
            zIndex: nextZ,
          },
        ],
      }
    }

    case 'CLOSE':
      return state.windows.some((windowState) => windowState.id === action.id)
        ? {
            ...state,
            windows: state.windows.filter((windowState) => windowState.id !== action.id),
          }
        : state

    case 'FOCUS':
      return withFocus(state, action.id, (windowState) => ({ ...windowState, isMinimized: false }))

    case 'MINIMIZE':
      return state.windows.some((windowState) => windowState.id === action.id)
        ? {
            ...state,
            windows: state.windows.map((windowState) =>
              windowState.id === action.id ? { ...windowState, isMinimized: true } : windowState,
            ),
          }
        : state

    case 'RESTORE':
      return withFocus(state, action.id, (windowState) => ({ ...windowState, isMinimized: false }))

    case 'TOGGLE_MAXIMIZE':
      return withFocus(state, action.id, (windowState) => {
        if (windowState.isMaximized) {
          const restored = constrainBounds(windowState.restoreBounds ?? windowState, action.viewport)
          return { ...windowState, ...restored, isMaximized: false, restoreBounds: undefined, isMinimized: false }
        }

        return {
          ...windowState,
          ...maxWindowBounds(action.viewport),
          isMaximized: true,
          isMinimized: false,
          restoreBounds: constrainBounds(windowState, action.viewport),
        }
      })

    case 'RESET_BOUNDS':
      return withFocus(state, action.id, (windowState) => ({
        ...windowState,
        ...constrainBounds(action.bounds, action.viewport),
        isMaximized: false,
        isMinimized: false,
        restoreBounds: undefined,
      }))

    case 'UPDATE_BOUNDS':
      return state.windows.some((windowState) => windowState.id === action.id)
        ? {
            ...state,
            windows: state.windows.map((windowState) =>
              windowState.id === action.id
                ? {
                    ...windowState,
                    ...constrainBounds(action.bounds, action.viewport),
                    isMaximized: false,
                    restoreBounds: undefined,
                  }
                : windowState,
            ),
          }
        : state

    case 'CONSTRAIN_TO_VIEWPORT':
      return {
        ...state,
        windows: state.windows.map((windowState) => {
          if (windowState.isMaximized) {
            return {
              ...windowState,
              ...maxWindowBounds(action.viewport),
              restoreBounds: windowState.restoreBounds
                ? constrainBounds(windowState.restoreBounds, action.viewport)
                : undefined,
            }
          }

          return {
            ...windowState,
            ...constrainBounds(windowState, action.viewport),
            restoreBounds: windowState.restoreBounds
              ? constrainBounds(windowState.restoreBounds, action.viewport)
              : undefined,
          }
        }),
      }
  }
}
