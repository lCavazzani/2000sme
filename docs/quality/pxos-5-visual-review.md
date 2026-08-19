# PXOS-5 Local Visual Review

## Full effects

The supplied Mittens raster is present as a decorative lower-left desktop sprite. It is rendered below active windows and desktop launchers, has no accessible name, and uses a pointer-transparent layer so it cannot intercept clicks or focus. The supplied moonlit wallpaper remains visible beneath the pixel scanline and vignette treatment; taskbar, desktop icons, and the My Machine window remain readable and interactive.

## Reduced effects

The review preference was changed through the existing persistent `2000sme:effects` setting. On reload, ThemeProvider resolves the setting through the existing `data-theme-effects="reduced"` capability. The static fallback removes sprite/cursor animation and suppresses the scanline portion of the desktop overlay while retaining the vignette, content contrast, visible focus model, windows, and launch controls.
