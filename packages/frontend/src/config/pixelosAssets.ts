export const PIXEL_OS_ASSET_SOURCE = {
  archive: 'leo-windows.zip',
  sha256: '07dcb28cefb37e11add98437eb820438895b69799060dd80f4e0d9382559bc15',
  importedWithoutSemanticEditing: true,
} as const

const assetRoot = '/pixelos/assets'

export const PIXEL_OS_ASSETS = {
  wallpaper: '/pixelos/wallpapers/pixelos-signal-ridge-wallpaper-640x360.png',
  moonrise: `${assetRoot}/dda42e57-923b-4342-b2b1-8ad755273c99.jpg`,
  mittens: `${assetRoot}/7dbdf7f0-0086-4ef8-8cbf-e345ae75e5de.jpg`,
  mascot: `${assetRoot}/109f5dfc-b775-4bf5-9a64-962651f649f6.jpg`,
  harbour: `${assetRoot}/57619517-ec8e-4409-b5e4-9b6c19235f98.jpg`,
  cockpit: `${assetRoot}/b8f2dc8c-d0e5-4b1f-87bb-43b221e8b3a5.jpg`,
  desktopNapStatic: '/pixelos/details/pixelos-grey-tabby-nap-00.png',
  desktopNapGif: '/pixelos/details/pixelos-grey-tabby-nap-32.gif',
  galleryPeek: '/pixelos/details/pixelos-grey-tabby-peek-00.png',
  bootBeacon: '/pixelos/intro/pixelos-boot-beacon-static-00.png',
  ownerEmblem: '/pixelos/intro/pixelos-owner-emblem-static-00.png',
  minesweeperIcon: '/pixelos/icons/pixelos-minesweeper-static-00.png',
  minesweeperVictoryBurst: '/pixelos/icons/pixelos-minesweeper-victory-burst-static-00.png',
  leonardoEntryHero: '/pixelos/portraits/pixelos-leonardo-entry-hero-00.png',
  leonardoProfile64: '/pixelos/portraits/pixelos-leonardo-profile-64-00.png',
  leonardoProfile32: '/pixelos/portraits/pixelos-leonardo-profile-32-00.png',
  nightshiftPlayerCar: '/pixelos/games/nightshift/nightshift-player-car-static-00.png',
  nightshiftTrafficCoupe: '/pixelos/games/nightshift/nightshift-traffic-violet-coupe-static-00.png',
  nightshiftTrafficVan: '/pixelos/games/nightshift/nightshift-traffic-amber-van-static-00.png',
  nightshiftPlayerCarVertical: '/pixelos/games/nightshift/nightshift-player-car-vertical-static-00.png',
  nightshiftPlayerCarVerticalDamage: '/pixelos/games/nightshift/nightshift-player-car-vertical-damage-static-00.png',
  nightshiftTrafficCoupeVertical: '/pixelos/games/nightshift/nightshift-traffic-violet-coupe-vertical-static-00.png',
  nightshiftTrafficVanVertical: '/pixelos/games/nightshift/nightshift-traffic-amber-van-vertical-static-00.png',
  nightshiftTwilightCity: '/pixelos/games/nightshift/nightshift-twilight-city-parallax-strip-static-00.png',
  nightshiftTwilightRoadside: '/pixelos/games/nightshift/nightshift-twilight-roadside-strip-static-00.png',
  nightshiftTwilightReflector: '/pixelos/games/nightshift/nightshift-twilight-road-reflector-tile-static-00.png',
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
    src: PIXEL_OS_ASSETS.moonrise,
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
  },
  chrome: {
    bevelWidth: '2px',
    taskbarHeight: '34px',
    startMenuWidth: '228px',
    titlebar: 'steel-violet active titlebar with cool inactive titlebar',
    fontStack: '"Pixelify Sans", "Courier New", monospace',
  },
  rendering: {
    rasterImageRendering: 'pixelated',
    overlays: 'full-effects scanlines plus vignette with pointer-events disabled',
    effects: 'the nap GIF is full-effects only with a static reduced-motion and image-error fallback',
  },
} as const
