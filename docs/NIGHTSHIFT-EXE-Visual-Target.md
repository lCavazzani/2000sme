# NIGHTSHIFT.EXE — Visual Target & Asset Manifest

> **Ticket:** GAME-9 — Define NIGHTSHIFT.EXE Visual Target & Asset Manifest
> **Status:** Discovery and art-contract work only. This document does **not** add a registry entry, Canvas element, game loop, gameplay rules, score, persistence, or deployment.

## Decision

**NIGHTSHIFT.EXE** is an original compact **Canvas 2D arcade racer** that will eventually live as a PixelOS application. Its image is a night highway seen from a high three-quarter view: void-indigo road, cyan reflector rhythm, magenta traffic signals, a restrained amber attention cue, and a dark city silhouette. The vehicle language is original and unbranded. It is not a recreation of a commercial arcade cabinet, a historical game title, or a real vehicle catalogue.

The future game should preserve PixelOS’s visual language while remaining a bounded portfolio interaction. React stays responsible for the PixelOS window, semantic labels, controls, status, and lifecycle boundary; Canvas draws only the game world. This follows the existing project architecture rather than introducing a second standalone application shell.

| Visual layer | Target | Deliberate exclusions |
|---|---|---|
| Road world | Narrow void-indigo highway, two or three readable lanes, cyan reflectors, pixel lane dashes, and a subdued lower city/roadside band. | Fullscreen pseudo-3D, photoreal asphalt, video backdrops, copied road signs, or branded environments. |
| Player identity | Compact midnight-blue hatchback sprite with cyan/magenta lighting detail. | Manufacturer badge, license plate, racing number, character portrait, or textual sprite label. |
| Traffic | Violet coupe for low wide traffic and amber van for a taller silhouette. | Real car forms, commercial branding, random external art, or a large vehicle roster before gameplay proves the need. |
| Game feedback | Small local vehicle/road-edge flash and a semantic status update when collision feedback is needed. | Full-viewport flashing, seizure-risk effects, alarm graphics, or audio by default. |
| Pixel fidelity | Logical low-resolution Canvas world with integer pixel scaling, CSS `image-rendering: pixelated`, and `context.imageSmoothingEnabled = false`. | Fractional sprite dimensions, smoothing, blur, glow, or non-integral transforms. |

## Future Canvas Contract

This is a design contract for later tickets, not an implementation instruction to start them early. The future Canvas should use a small fixed logical resolution, with **320 × 180** as the proposed starting composition, then scale evenly within a retained PixelOS window. Every vehicle source frame is 64 × 64 pixels, so it may be drawn at native size or an integer multiple; a later implementation must avoid non-integral `drawImage()` destinations.

The browser Canvas API smooths scaled images by default, so the future renderer must set `imageSmoothingEnabled` to `false` before drawing scaled source frames. MDN also recommends a lower logical canvas resolution with equal CSS scaling and `image-rendering: pixelated` for crisp Canvas pixel art. [1] [2]

> **Accessibility boundary:** the canvas needs an accessible name or fallback content, but the score, speed, pause, restart, control instructions, and collision status must remain semantic HTML in the PixelOS application shell. Canvas pixels alone are not an accessible control surface. [2]

The later game loop must use the `requestAnimationFrame()` timestamp to calculate elapsed movement rather than advancing a fixed amount each frame; display refresh rates differ, and fixed per-frame movement would change game speed. The loop must retain its request ID and cancel it when the PixelOS game window is minimized, closed, or disposed. [3]

| Later implementation concern | GAME-9 decision | Verification in later tickets |
|---|---|---|
| Render cadence | One `requestAnimationFrame()` loop with timestamp-based delta time; no `setInterval` simulation loop. | GAME-10 deterministic core and GAME-12 lifecycle/performance tests. |
| Pixel scale | Integer-only vehicle and logical-canvas scaling with smoothing disabled. | Screenshot baselines and pixel-dimension assertions. |
| Lifecycle | Pause/cancel animation-frame work when the PixelOS window is minimized or closed; resume only from explicit local state. | GAME-12 lifecycle test. |
| Input and feedback | Keyboard/touch controls and score/status live in semantic DOM; canvas is not the only way to learn controls or state. | GAME-11 responsive and accessibility tests. |
| Determinism | Future traffic spawning takes an injected seed/configuration. | GAME-10 rules-engine tests. |

## Approved Initial Asset Set

The owner-supplied archive was downloaded for passive validation on 2026-08-21. Its SHA-256 is `26e7e18f69c6c3a477aee9128303e49997299660127582c0b23f4893f1025633`. GAME-9 ships only the three native static vehicle frames and their JSON metadata under `packages/frontend/public/pixelos/games/nightshift/`. The composite sheet and handoff document remain source-package references; no generated images, commercial imagery, or external hotlinks are shipped.

| Source-controlled path | SHA-256 | Native size | Future role | Accessibility and rendering rule |
|---|---|---:|---|---|
| `public/pixelos/games/nightshift/nightshift-player-car-static-00.png` | `e464505f84edfddf12d22a4249d45ca0157a3d653c8c569c01bd7056286df7bb` | 64 × 64 px | Player vehicle. | Decorative Canvas sprite; static image at integer scale and smoothing disabled. |
| `public/pixelos/games/nightshift/nightshift-traffic-violet-coupe-static-00.png` | `423aa193c9688c0feb2d975981cd000cf15cdda5471ec5d447950ede201ca856` | 64 × 64 px | Fast, low traffic silhouette. | Decorative Canvas sprite; deterministic lane/speed selection later. |
| `public/pixelos/games/nightshift/nightshift-traffic-amber-van-static-00.png` | `c79e6199525b63b1362945ee371f11203366eb5ca894a69a786a3ff00a9baba3` | 64 × 64 px | Tall traffic silhouette. | Decorative Canvas sprite; semantic status remains outside Canvas. |
| `public/pixelos/games/nightshift/nightshift-vehicle-kit.json` | `a704a5e4f7926325f225883fd8e55cdfe4196720c849caf7759eb0c2ecf53254` | Metadata | Canonical frame order and descriptive asset context. | Supports a future loader; does not replace DOM control/status text. |

## Asset Expansion Gate

No new art is required before the playable-loop ticket. If usability testing later demonstrates a need, the next permitted assets are one small road-reflector tile, two restrained city/roadside parallax strips, and one local impact/damage vehicle state. Any other art—racing-cabinet scene, live leaderboard graphic, video backdrop, branded vehicle set, or audio package—requires a new product decision.

## Handoff to Later Tickets

GAME-9 is complete when this visual contract and manifest are accepted. **GAME-10** may consume the three approved source frames to create the Canvas 2D core. **GAME-11** may add responsive controls and local-only score behavior only after that core is reviewed. **GAME-12** owns the deterministic, lifecycle, accessibility, and performance gate. This ticket intentionally does not pre-implement those later scopes.

## References

[1] [MDN: `CanvasRenderingContext2D.imageSmoothingEnabled`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/imageSmoothingEnabled) — scaled Canvas images are smoothed by default; disabling smoothing preserves pixel sharpness.

[2] [MDN: Crisp pixel art look with `image-rendering`](https://developer.mozilla.org/en-US/docs/Games/Techniques/Crisp_pixel_art_look) — low logical Canvas resolution, equal scaling, `image-rendering: pixelated`, integer draw dimensions, and Canvas accessibility considerations.

[3] [MDN: `window.requestAnimationFrame()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame) — callbacks are refresh-rate dependent and one-shot, requiring timestamp-based progression and explicit re-scheduling/cancellation.
