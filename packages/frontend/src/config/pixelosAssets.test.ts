import { describe, expect, it } from 'vitest'
import {
  PIXEL_OS_ASSETS,
  PIXEL_OS_ASSET_SOURCE,
  PIXEL_OS_GALLERY,
  PIXEL_OS_VISUAL_CONTRACT,
} from './pixelosAssets'

describe('pixelosAssets', () => {
  it('preserves the exact owner-supplied PixelOS raster asset contract and approved local desk additions', () => {
    expect(PIXEL_OS_ASSET_SOURCE.importedWithoutSemanticEditing).toBe(true)
    expect(PIXEL_OS_ASSET_SOURCE.sha256).toBe('07dcb28cefb37e11add98437eb820438895b69799060dd80f4e0d9382559bc15')
    expect(Object.values(PIXEL_OS_ASSETS)).toEqual([
      '/pixelos/wallpapers/pixelos-signal-ridge-wallpaper-640x360.png',
      '/pixelos/assets/dda42e57-923b-4342-b2b1-8ad755273c99.jpg',
      '/pixelos/assets/7dbdf7f0-0086-4ef8-8cbf-e345ae75e5de.jpg',
      '/pixelos/assets/109f5dfc-b775-4bf5-9a64-962651f649f6.jpg',
      '/pixelos/assets/57619517-ec8e-4409-b5e4-9b6c19235f98.jpg',
      '/pixelos/assets/b8f2dc8c-d0e5-4b1f-87bb-43b221e8b3a5.jpg',
      '/pixelos/details/pixelos-grey-tabby-nap-00.png',
      '/pixelos/details/pixelos-grey-tabby-nap-32.gif',
      '/pixelos/details/pixelos-grey-tabby-peek-00.png',
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
      '/pixelos/games/nightshift/nightshift-player-car-vertical-static-00.png',
      '/pixelos/games/nightshift/nightshift-player-car-vertical-damage-static-00.png',
      '/pixelos/games/nightshift/nightshift-traffic-violet-coupe-vertical-static-00.png',
      '/pixelos/games/nightshift/nightshift-traffic-amber-van-vertical-static-00.png',
      '/pixelos/games/nightshift/nightshift-twilight-city-parallax-strip-static-00.png',
      '/pixelos/games/nightshift/nightshift-twilight-roadside-strip-static-00.png',
      '/pixelos/games/nightshift/nightshift-twilight-road-reflector-tile-static-00.png',
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
      PIXEL_OS_ASSETS.moonrise,
      PIXEL_OS_ASSETS.mittens,
    ])
  })

  it('defines the Quiet Technical Desk semantic palette and fixed desktop chrome metrics once', () => {
    expect(PIXEL_OS_VISUAL_CONTRACT.palette).toMatchObject({
      void: '#171a2a',
      panel: '#262a3b',
      panelDark: '#3a4056',
      bevelHighlight: '#7e879f',
      edge: '#0b0f18',
      cyan: '#4de3d0',
      magenta: '#c953a3',
      amber: '#e8ad64',
    })
    expect(PIXEL_OS_VISUAL_CONTRACT.chrome).toMatchObject({
      bevelWidth: '2px',
      taskbarHeight: '34px',
      startMenuWidth: '228px',
      titlebar: 'steel-violet active titlebar with cool inactive titlebar',
    })
  })
})
