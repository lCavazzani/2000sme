import type { WindowConfig } from '../types/window'
import type { ApplicationId } from './applicationRegistry'

/**
 * The one editable source of truth for a desktop application's first-open and
 * Reset Bounds geometry. Values are CSS pixels in the desktop coordinate space.
 *
 * Keep positions non-negative and sizes positive. The window reducer remains
 * responsible for clamping every entry to the active viewport and taskbar, so
 * these defaults stay safe on narrow screens and after a viewport resize.
 *
 * Existing sessionStorage layouts are intentionally not overwritten. To preview
 * a changed default for an open app, use Reset Bounds; to test a true first-open
 * state, clear the current PixelOS session.
 */
export type InitialWindowGeometry = Pick<WindowConfig, 'x' | 'y' | 'width' | 'height'>

export const INITIAL_WINDOW_GEOMETRY = {
  'my-computer': { x: 120, y: 50, width: 640, height: 440 },
  gallery: { x: 210, y: 70, width: 560, height: 400 },
  pet: { x: 560, y: 90, width: 300, height: 360 },
  notepad: { x: 150, y: 96, width: 460, height: 360 },
  about: { x: 300, y: 180, width: 380, height: 270 },
  signal: { x: 260, y: 104, width: 620, height: 590 },
  minesweeper: { x: 340, y: 76, width: 500, height: 560 },
  nightshift: { x: 370, y: 96, width: 680, height: 580 },
  // Keep the desktop icon column clear while opening the primary portfolio document.
  resume: { x: 500, y: 56, width: 760, height: 540 },
} as const satisfies Record<ApplicationId, InitialWindowGeometry>

/** Returns a fresh object so callers cannot mutate the centralized defaults. */
export function initialWindowGeometryFor(id: ApplicationId): InitialWindowGeometry {
  return { ...INITIAL_WINDOW_GEOMETRY[id] }
}
