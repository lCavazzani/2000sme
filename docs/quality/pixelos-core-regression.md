# PixelOS Core Regression Gate

`e2e/pixelos-core.spec.ts` is the PixelOS Core browser gate. It exists to protect the owner-approved `leo-windows` visual direction while ensuring that the retained desktop operating-system behavior remains available after visible chrome changes.

## Visual evidence contract

The browser suite verifies the active `pixelos` target, the supplied wallpaper mapping, Pixelify typography, fixed 34px taskbar, pointer-transparent decorative sprite, single-column Start-menu geometry, magenta Start rail, and the two approved application entries. The suite attaches a full-page desktop-and-Start-menu screenshot to its test report as repeatable review evidence.

## Preserved OS behavior

The suite opens both retained applications and verifies active/inactive title-bar contrast, taskbar minimize/restore behavior, maximize/restore controls, title-bar dragging, bottom-right resizing, and focus restoration. It also protects Start-menu keyboard focus and Escape return, stale Guestbook direct-route fallback, the narrow-screen mobile launcher, and system reduced-motion behavior.

## Running the gate

```bash
pnpm --filter 00sfrontend exec playwright test e2e/pixelos-core.spec.ts
```

The standard release gate remains broader:

```bash
pnpm --filter 00sfrontend test:a11y
```

No Windows XP, Windows 98, or Windows 7 parity requirement remains. The release target is PixelOS only.
