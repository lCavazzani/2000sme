/**
 * Single source of truth for the PixelOS palette.
 *
 * Nothing else in the codebase may declare a colour literal for chrome. CSS
 * consumes these values through `theme/generated/tokens.css`, which is emitted
 * by `scripts/generate-tokens.mjs`; TypeScript consumers (canvas rendering,
 * which cannot read CSS custom properties) import this module directly.
 *
 * `tokens.sync.test.ts` fails when the generated stylesheet drifts from this
 * file, so a palette change cannot land half-applied.
 */

/** Core chrome ramp. Every semantic token below is derived from these. */
export const palette = {
  void: '#171a2a',
  panel: '#262a3b',
  panelDark: '#3a4056',
  bevelHighlight: '#7e879f',
  edge: '#0b0f18',
  ink: '#eef2ff',
  muted: '#aab4c8',
  cyan: '#4de3d0',
  magenta: '#c953a3',
  amber: '#e8ad64',
  titleActive: '#4f566f',
  titleInactive: '#30354a',
} as const

export type PaletteColor = keyof typeof palette

/** Non-colour chrome metrics that both namespaces publish. */
export const metrics = {
  taskbarHeight: '36px',
  bevelWidth: '2px',
  scanlineOpacity: '0.20',
  focusOffset: '-4px',
  motionDuration: '0ms',
  windowShadow: '3px 3px 0 rgb(0 0 0 / 52%)',
} as const

export const fontStack = "'Pixelify Sans', 'Courier New', monospace"

/**
 * NIGHTSHIFT scene colours. These are game art rather than chrome: the night
 * highway keeps its own ramp so retuning window chrome cannot wash out the
 * playfield. Accents that should track the OS deliberately reference `palette`.
 */
export const nightshiftPalette = {
  sky: '#574478',
  ground: '#8774ad',
  roadShoulder: '#211b40',
  roadSurface: '#302852',
  laneEdge: palette.cyan,
  laneDash: '#d5c8ef',
  windshield: '#19142d',
  trafficCoupe: palette.magenta,
  trafficVan: palette.amber,
  player: palette.cyan,
  playerDamaged: '#ffb454',
} as const

/**
 * `--os-*` semantic tokens on bare `:root`. Consumed by application-level CSS
 * modules. Each entry names the palette role it resolves to so a retune is a
 * one-line change here rather than a search across stylesheets.
 */
export const osTokens: Record<string, string> = {
  'desktop-surface': palette.void,
  'desktop-fg': palette.ink,
  'focus-ring': `2px dotted ${palette.cyan}`,
  'focus-offset': metrics.focusOffset,
  'motion-duration': metrics.motionDuration,
  'window-surface': palette.panel,
  'window-radius': '0',
  'window-border': palette.edge,
  'window-shadow': metrics.windowShadow,
  'title-active-bg': palette.titleActive,
  'title-active-fg': palette.ink,
  'title-inactive-bg': palette.titleInactive,
  'title-inactive-fg': palette.ink,
  'control-fg': palette.ink,
  'control-border': palette.edge,
  'control-border-color': palette.edge,
  'control-hover-bg': palette.panelDark,
  'control-pressed-bg': palette.void,
  'control-disabled-fg': palette.muted,
  'control-inset': `inset 2px 2px ${palette.edge}, inset -2px -2px ${palette.bevelHighlight}`,
  'control-selected-bg': palette.magenta,
  'control-selected-fg': palette.edge,
  'taskbar-bg': palette.panel,
  'taskbar-fg': palette.ink,
  'taskbar-border-width': '0',
  'taskbar-border-color': 'transparent',
  'taskbar-radius': '0',
  'taskbar-elevation': 'none',
  'start-menu-bg': palette.panel,
  'start-menu-fg': palette.ink,
  'start-menu-border-width': '2px',
  'start-menu-border-color': palette.edge,
  'start-menu-elevation': metrics.windowShadow,
  'tray-bg': palette.panel,
  'tray-border-width': '0',
  'tray-border-color': 'transparent',
  'tray-radius': '0',
  'icon-label-fg': palette.ink,
  'icon-label-shadow': `1px 1px ${palette.edge}`,
  'icon-selected-shadow': 'none',
  'app-content-surface': palette.panel,
  'app-inset-surface': palette.void,
  'app-inset-shadow': `inset 2px 2px ${palette.edge}, inset -2px -2px ${palette.panelDark}`,
  'app-divider': palette.bevelHighlight,
  'app-link-fg': palette.cyan,
  'app-link-hover-fg': palette.magenta,
  'app-selection-bg': palette.magenta,
  'app-selection-fg': palette.edge,
  'app-selection-hover': palette.panelDark,
  'app-toolbar-surface': palette.panelDark,
  'app-toolbar-highlight': palette.bevelHighlight,
  'crt-opacity': metrics.scanlineOpacity,

  // Shorthand aliases used directly by component CSS and inline SVG glyph fills.
  cyan: palette.cyan,
  magenta: palette.magenta,
  amber: palette.amber,
  ink: palette.ink,
  panel: palette.panel,
  muted: palette.muted,
  edge: palette.edge,
  'font-stack': fontStack,
}

/**
 * `--pixelos-*` tokens, scoped to `:root[data-os-theme='pixelos']`. Shell CSS
 * modules read this namespace. It carries the same ramp as `osTokens` because
 * both describe one visual system; the split is historical.
 */
export const pixelosTokens: Record<string, string> = {
  void: palette.void,
  panel: palette.panel,
  'panel-dark': palette.panelDark,
  'bevel-highlight': palette.bevelHighlight,
  edge: palette.edge,
  ink: palette.ink,
  muted: palette.muted,
  cyan: palette.cyan,
  magenta: palette.magenta,
  amber: palette.amber,
  'title-active': palette.titleActive,
  'title-inactive': palette.titleInactive,
  font: fontStack,
  'taskbar-height': metrics.taskbarHeight,
  'bevel-width': metrics.bevelWidth,
  'scanline-opacity': metrics.scanlineOpacity,
}

/**
 * `--pixelos-bevel-*` are read by application CSS modules that otherwise use
 * the `--os-*` namespace, so they must exist on bare `:root` too.
 */
export const pixelosRootAliases: Record<string, string> = {
  'bevel-width': metrics.bevelWidth,
  'bevel-highlight': palette.bevelHighlight,
}
