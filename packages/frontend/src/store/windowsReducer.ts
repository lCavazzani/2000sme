import type { StoreState, Action } from '../types/window'

export const INITIAL_STATE: StoreState = {
  windows: [],
  topZ: 0,
}

export function windowsReducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case 'OPEN': {
      const existing = state.windows.find((w) => w.id === action.config.id)
      const nextZ = state.topZ + 1

      if (existing) {
        return {
          topZ: nextZ,
          windows: state.windows.map((w) =>
            w.id === action.config.id
              ? { ...w, isOpen: true, isMinimized: false, zIndex: nextZ }
              : w
          ),
        }
      }

      return {
        topZ: nextZ,
        windows: [
          ...state.windows,
          { ...action.config, isOpen: true, isMinimized: false, zIndex: nextZ },
        ],
      }
    }

    case 'CLOSE':
      return {
        ...state,
        windows: state.windows.filter((w) => w.id !== action.id),
      }

    case 'FOCUS': {
      const nextZ = state.topZ + 1
      return {
        topZ: nextZ,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, zIndex: nextZ } : w
        ),
      }
    }

    case 'MINIMIZE':
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, isMinimized: !w.isMinimized } : w
        ),
      }

    case 'UPDATE_BOUNDS':
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id
            ? { ...w, x: action.x, y: action.y, width: action.width, height: action.height }
            : w
        ),
      }
  }
}
