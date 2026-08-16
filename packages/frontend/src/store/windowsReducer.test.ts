import { describe, expect, it } from 'vitest'
import type { StoreState, Viewport, WindowConfig } from '../types/window'
import { INITIAL_STATE, TASKBAR_HEIGHT, windowsReducer } from './windowsReducer'

const viewport: Viewport = { width: 1024, height: 768 }
const portfolio: WindowConfig = {
  id: 'portfolio',
  title: 'My Portfolio',
  x: 64,
  y: 64,
  width: 480,
  height: 320,
}

function openPortfolio(): StoreState {
  return windowsReducer(INITIAL_STATE, { type: 'OPEN', config: portfolio })
}

describe('windowsReducer', () => {
  it('maximizes visibly and restores the exact safe pre-maximize geometry', () => {
    const opened = openPortfolio()
    const maximized = windowsReducer(opened, { type: 'TOGGLE_MAXIMIZE', id: portfolio.id, viewport })
    const windowState = maximized.windows[0]

    expect(windowState).toMatchObject({
      isMaximized: true,
      x: 0,
      y: 0,
      width: viewport.width,
      height: viewport.height - TASKBAR_HEIGHT,
      restoreBounds: { x: portfolio.x, y: portfolio.y, width: portfolio.width, height: portfolio.height },
    })

    const restored = windowsReducer(maximized, { type: 'TOGGLE_MAXIMIZE', id: portfolio.id, viewport })
    expect(restored.windows[0]).toMatchObject({
      isMaximized: false,
      x: portfolio.x,
      y: portfolio.y,
      width: portfolio.width,
      height: portfolio.height,
      restoreBounds: undefined,
    })
  })

  it('minimizes and restores while returning the window to the active layer', () => {
    const opened = openPortfolio()
    const minimized = windowsReducer(opened, { type: 'MINIMIZE', id: portfolio.id })
    expect(minimized.windows[0]?.isMinimized).toBe(true)

    const restored = windowsReducer(minimized, { type: 'RESTORE', id: portfolio.id })
    expect(restored.windows[0]).toMatchObject({ isMinimized: false, zIndex: 2 })
  })

  it('constrains restored and resized geometry so a window title bar remains reachable', () => {
    const opened = openPortfolio()
    const resized = windowsReducer(opened, {
      type: 'UPDATE_BOUNDS',
      id: portfolio.id,
      bounds: { x: 2000, y: 2000, width: 800, height: 600 },
      viewport: { width: 360, height: 280 },
    })
    const constrained = resized.windows[0]

    expect(constrained.width).toBeLessThanOrEqual(360)
    expect(constrained.height).toBeLessThanOrEqual(280 - TASKBAR_HEIGHT)
    expect(constrained.x).toBeGreaterThanOrEqual(0)
    expect(constrained.y).toBeGreaterThanOrEqual(0)
    expect(constrained.x + constrained.width).toBeLessThanOrEqual(360)
  })

  it('resets geometry from a known safe application configuration', () => {
    const opened = openPortfolio()
    const moved = windowsReducer(opened, {
      type: 'UPDATE_BOUNDS',
      id: portfolio.id,
      bounds: { x: 300, y: 180, width: 400, height: 260 },
      viewport,
    })
    const reset = windowsReducer(moved, {
      type: 'RESET_BOUNDS',
      id: portfolio.id,
      bounds: portfolio,
      viewport,
    })

    expect(reset.windows[0]).toMatchObject({ ...portfolio, isMaximized: false, isMinimized: false })
  })
})
