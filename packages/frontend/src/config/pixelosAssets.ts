export const PIXEL_OS_ASSET_SOURCE = {
  archive: 'leo-windows.zip',
  sha256: '07dcb28cefb37e11add98437eb820438895b69799060dd80f4e0d9382559bc15',
  importedWithoutSemanticEditing: true,
} as const

const assetRoot = '/pixelos/assets'

export const PIXEL_OS_ASSETS = {
  wallpaper: `${assetRoot}/dda42e57-923b-4342-b2b1-8ad755273c99.jpg`,
  mittens: `${assetRoot}/7dbdf7f0-0086-4ef8-8cbf-e345ae75e5de.jpg`,
  mascot: `${assetRoot}/109f5dfc-b775-4bf5-9a64-962651f649f6.jpg`,
  harbour: `${assetRoot}/57619517-ec8e-4409-b5e4-9b6c19235f98.jpg`,
  cockpit: `${assetRoot}/b8f2dc8c-d0e5-4b1f-87bb-43b221e8b3a5.jpg`,
  bootBeacon: '/pixelos/intro/pixelos-boot-beacon-static-00.png',
  ownerEmblem: '/pixelos/intro/pixelos-owner-emblem-static-00.png',
  minesweeperIcon: '/pixelos/icons/pixelos-minesweeper-static-00.png',
  minesweeperVictoryBurst: '/pixelos/icons/pixelos-minesweeper-victory-burst-static-00.png',
} as const

export const PIXEL_OS_GALLERY = [
  {
    id: 'harbour',
    title: 'HARBOUR.PNG',
    caption: '320 × 240 · 24 colors · painted at dusk',
    src: PIXEL_OS_ASSETS.harbour,
  },
  {
    id: 'cockpit',
    title: 'COCKPIT.PNG',
    caption: '320 × 240 · 24 colors · nebula run',
    src: PIXEL_OS_ASSETS.cockpit,
  },
  {
    id: 'moonrise',
    title: 'MOONRISE.PNG',
    caption: '640 × 360 · 32 colors · the desktop tile',
    src: PIXEL_OS_ASSETS.wallpaper,
  },
  {
    id: 'catsill',
    title: 'CATSILL.PNG',
    caption: '256 × 256 · 18 colors · the resident',
    src: PIXEL_OS_ASSETS.mittens,
  },
] as const

export const PIXEL_OS_VISUAL_CONTRACT = {
  palette: {
    void: '#120b22',
    panel: '#1c1436',
    panelDark: '#3b2d5e',
    bevelHighlight: '#6d5aa8',
    edge: '#0d0819',
    ink: '#f2ecff',
    muted: '#a89ac8',
    cyan: '#4de3d0',
    magenta: '#df4fbc',
  },
  chrome: {
    bevelWidth: '2px',
    taskbarHeight: '34px',
    startMenuWidth: '228px',
    titlebar: 'magenta active titlebar with dark indigo inactive titlebar',
    fontStack: '"Pixelify Sans", "Courier New", monospace',
  },
  rendering: {
    rasterImageRendering: 'pixelated',
    overlays: 'scanlines plus vignette with pointer-events disabled',
    effects: 'step-based sprite bob and cursor blink with a static reduced-motion fallback',
  },
} as const
