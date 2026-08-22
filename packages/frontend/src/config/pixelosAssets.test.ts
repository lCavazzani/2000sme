import { describe, expect, it } from 'vitest'
import {
  PIXEL_OS_ASSETS,
  PIXEL_OS_ASSET_SOURCE,
  PIXEL_OS_GALLERY,
  PIXEL_OS_VISUAL_CONTRACT,
} from './pixelosAssets'

describe('pixelosAssets', () => {
  it('preserves the exact owner-supplied PixelOS raster asset contract', () => {
    expect(PIXEL_OS_ASSET_SOURCE.importedWithoutSemanticEditing).toBe(true)
    expect(PIXEL_OS_ASSET_SOURCE.sha256).toBe('07dcb28cefb37e11add98437eb820438895b69799060dd80f4e0d9382559bc15')
    expect(Object.values(PIXEL_OS_ASSETS)).toEqual([
      '/pixelos/assets/dda42e57-923b-4342-b2b1-8ad755273c99.jpg',
      '/pixelos/assets/7dbdf7f0-0086-4ef8-8cbf-e345ae75e5de.jpg',
      '/pixelos/assets/109f5dfc-b775-4bf5-9a64-962651f649f6.jpg',
      '/pixelos/assets/57619517-ec8e-4409-b5e4-9b6c19235f98.jpg',
      '/pixelos/assets/b8f2dc8c-d0e5-4b1f-87bb-43b221e8b3a5.jpg',
      '/pixelos/intro/pixelos-boot-beacon-static-00.png',
      '/pixelos/intro/pixelos-owner-emblem-static-00.png',
      '/pixelos/icons/pixelos-minesweeper-static-00.png',
      '/pixelos/icons/pixelos-minesweeper-victory-burst-static-00.png',
      '/pixelos/portraits/pixelos-leonardo-entry-hero-00.png',
      '/pixelos/portraits/pixelos-leonardo-profile-64-00.png',
      '/pixelos/portraits/pixelos-leonardo-profile-32-00.png',
      '/pixelos/games/nightshift/nightshift-player-car-static-00.png',
      '/pixelos/games/nightshift/nightshift-traffic-violet-coupe-static-00.png',
      '/pixelos/games/nightshift/nightshift-traffic-amber-van-static-00.png',
    ])
  })

  it('keeps the supplied gallery names and source references stable for future PixelOS applications', () => {
    expect(PIXEL_OS_GALLERY.map((piece) => piece.title)).toEqual([
      'HARBOUR.PNG',
      'COCKPIT.PNG',
      'MOONRISE.PNG',
      'CATSILL.PNG',
    ])
    expect(PIXEL_OS_GALLERY.map((piece) => piece.src)).toEqual([
      PIXEL_OS_ASSETS.harbour,
      PIXEL_OS_ASSETS.cockpit,
      PIXEL_OS_ASSETS.wallpaper,
      PIXEL_OS_ASSETS.mittens,
    ])
  })

  it('defines the reference palette and fixed desktop chrome metrics once', () => {
    expect(PIXEL_OS_VISUAL_CONTRACT.palette).toMatchObject({
      void: '#120b22',
      panel: '#1c1436',
      bevelHighlight: '#6d5aa8',
      edge: '#0d0819',
      cyan: '#4de3d0',
      magenta: '#df4fbc',
    })
    expect(PIXEL_OS_VISUAL_CONTRACT.chrome).toMatchObject({
      bevelWidth: '2px',
      taskbarHeight: '34px',
      startMenuWidth: '228px',
    })
  })
})
