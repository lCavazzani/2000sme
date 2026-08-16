import { describe, expect, it } from 'vitest'
import type { StoreState, Viewport, WindowConfig } from '../types/window'
import { INITIAL_STATE, TASKBAR_HEIGHT, windowsReducer } from './windowsReducer'

const viewport: Viewport = { width: 1024, height: 768 }
const compactViewport: Viewport = { width: 360, height: 280 }
const portfolio: WindowConfig = {
  id: 'portfolio',
  title: 'My Portfolio',
  x: 64,
  y: 64,
  width: 480,
  height: 320,
}
const resume: WindowConfig = {
  id: 'resume',
  title: 'Resume',
  x: 120,
  y: 90,
  width: 420,
  height: 280,
}

function open(...configs: WindowConfig[]): StoreState {
  return configs.reduce((state, config) => windowsReducer(state, { type: 'OPEN', config }), INITIAL_STATE)
}

function expectSingleTopWindow(state: StoreState, id: string) {
  const highestZ = Math.max(...state.windows.map((windowState) => windowState.zIndex))
  expect(state.windows.filter((windowState) => windowState.zIndex === highestZ)).toHaveLength(1)
  expect(state.windows.find((windowState) => windowState.id === id)?.zIndex).toBe(highestZ)
}

describe('windowsReducer', () => {
  it('opens a configured app once and reopens it without creating a duplicate window', () => {
    const opened = open(portfolio)
    const reopened = windowsReducer(opened, { type: 'OPEN', config: portfolio })

    expect(opened).toEqual({
      topZ: 1,
      windows: [expect.objectContaining({ id: portfolio.id, isOpen: true, isMinimized: false, zIndex: 1 })],
    })
    expect(reopened.windows).toHaveLength(1)
    expect(reopened.windows[0]).toMatchObject({ id: portfolio.id, isOpen: true, isMinimized: false, zIndex: 2 })
    expectSingleTopWindow(reopened, portfolio.id)
    expect(opened.windows[0]?.zIndex).toBe(1)
  })

  it('closes only the requested window and treats an unknown app ID as an immutable no-op', () => {
    const opened = open(portfolio, resume)
    const closed = windowsReducer(opened, { type: 'CLOSE', id: portfolio.id })

    expect(closed.windows.map((windowState) => windowState.id)).toEqual([resume.id])
    expect(opened.windows.map((windowState) => windowState.id)).toEqual([portfolio.id, resume.id])
    expect(windowsReducer(closed, { type: 'CLOSE', id: 'not-real' })).toBe(closed)
  })

  it('focuses the requested window, restores it from minimization, and gives it the unique highest z-index', () => {
    const opened = open(portfolio, resume)
    const minimized = windowsReducer(opened, { type: 'MINIMIZE', id: portfolio.id })
    const focused = windowsReducer(minimized, { type: 'FOCUS', id: portfolio.id })

    expect(minimized.windows.find((windowState) => windowState.id === portfolio.id)?.isMinimized).toBe(true)
    expect(focused.windows.find((windowState) => windowState.id === portfolio.id)?.isMinimized).toBe(false)
    expectSingleTopWindow(focused, portfolio.id)
    expect(windowsReducer(focused, { type: 'FOCUS', id: 'not-real' })).toBe(focused)
  })

  it('minimizes and restores a window while returning it to the active layer', () => {
    const opened = open(portfolio)
    const minimized = windowsReducer(opened, { type: 'MINIMIZE', id: portfolio.id })
    const restored = windowsReducer(minimized, { type: 'RESTORE', id: portfolio.id })

    expect(minimized.windows[0]?.isMinimized).toBe(true)
    expect(restored.windows[0]).toMatchObject({ isMinimized: false, zIndex: 2 })
    expectSingleTopWindow(restored, portfolio.id)
    expect(windowsReducer(restored, { type: 'MINIMIZE', id: 'not-real' })).toBe(restored)
    expect(windowsReducer(restored, { type: 'RESTORE', id: 'not-real' })).toBe(restored)
  })

  it('maximizes visibly and restores the exact safe pre-maximize geometry', () => {
    const opened = open(portfolio)
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
    expect(windowsReducer(restored, { type: 'TOGGLE_MAXIMIZE', id: 'not-real', viewport })).toBe(restored)
  })

  it('updates bounds with viewport constraints and clears maximized restore state', () => {
    const maximized = windowsReducer(open(portfolio), { type: 'TOGGLE_MAXIMIZE', id: portfolio.id, viewport })
    const updated = windowsReducer(maximized, {
      type: 'UPDATE_BOUNDS',
      id: portfolio.id,
      bounds: { x: 2000, y: 2000, width: 800, height: 600 },
      viewport: compactViewport,
    })
    const windowState = updated.windows[0]

    expect(windowState).toMatchObject({ isMaximized: false, restoreBounds: undefined })
    expect(windowState.width).toBeLessThanOrEqual(compactViewport.width)
    expect(windowState.height).toBeLessThanOrEqual(compactViewport.height - TASKBAR_HEIGHT)
    expect(windowState.x).toBeGreaterThanOrEqual(0)
    expect(windowState.y).toBeGreaterThanOrEqual(0)
    expect(windowState.x + windowState.width).toBeLessThanOrEqual(compactViewport.width)
    expect(windowsReducer(updated, { type: 'UPDATE_BOUNDS', id: 'not-real', bounds: portfolio, viewport })).toBe(updated)
  })

  it('resets geometry from a known safe application configuration and focuses the window', () => {
    const moved = windowsReducer(open(portfolio, resume), {
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

    expect(reset.windows.find((windowState) => windowState.id === portfolio.id)).toMatchObject({
      ...portfolio,
      isMaximized: false,
      isMinimized: false,
      restoreBounds: undefined,
    })
    expectSingleTopWindow(reset, portfolio.id)
    expect(windowsReducer(reset, { type: 'RESET_BOUNDS', id: 'not-real', bounds: portfolio, viewport })).toBe(reset)
  })

  it('constrains every open window to a smaller viewport while preserving safe maximum geometry', () => {
    const maximized = windowsReducer(open(portfolio, resume), { type: 'TOGGLE_MAXIMIZE', id: resume.id, viewport })
    const constrained = windowsReducer(maximized, { type: 'CONSTRAIN_TO_VIEWPORT', viewport: compactViewport })

    for (const windowState of constrained.windows) {
      expect(windowState.width).toBeLessThanOrEqual(compactViewport.width)
      expect(windowState.height).toBeLessThanOrEqual(compactViewport.height - TASKBAR_HEIGHT)
      expect(windowState.x).toBeGreaterThanOrEqual(0)
      expect(windowState.y).toBeGreaterThanOrEqual(0)
    }
    expect(constrained.windows.find((windowState) => windowState.id === resume.id)).toMatchObject({
      x: 0,
      y: 0,
      width: compactViewport.width,
      height: compactViewport.height - TASKBAR_HEIGHT,
      isMaximized: true,
    })
  })
})
