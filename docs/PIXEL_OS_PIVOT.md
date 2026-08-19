# PixelOS Pivot Scope and Board Mapping

> **Verified against:** `development` `765799a` · successful release evidence [Deploy #32220399581](https://github.com/lCavazzani/2000sme/actions/runs/32220399581) / 2026-08-19 05:41Z · board 2026-08-19 06:10 MDT.  
> **Relevant work:** FE-24, FE-19, THEME-19, THEME-10 through THEME-12, TEST-6, BUG-1 through BUG-5.  
> **Known release risk:** Latest deployment evidence confirms deployment success but does not itself provide functional endpoint smoke-test evidence.

## Product decision

The application will pivot from an **XP-default, Windows 98-alternate multi-theme portfolio** to a single, named **PixelOS** product. PixelOS will use the supplied `leo-windows` project as its canonical implementation reference. The supplied source, five raster assets, window layouts, pixel chroming, CRT/scanline treatment, sprite bob/blink effects, and application behavior are the required target. The OS state model—windows, focus, z-order, minimize/maximize, drag/resize, taskbar buttons, Start menu, desktop icons, hash/direct routes, responsive launcher behavior, accessibility, and tests—remains valuable and must be preserved.

The pivot does not erase completed work. In-progress and in-review work will be recorded as **Done** under the stated reconciliation rule, then no longer expanded through legacy-theme follow-on tickets.

## Preserved versus removed product scope

| Product area | Decision | Delivery implication |
|---|---|---|
| Window manager, desktop, taskbar, Start menu, icon launcher, direct routes, responsive fallback | **Preserve** | Adapt only the chrome and application registry to PixelOS. Do not reimplement OS behavior. |
| Existing completed runtime/token/theme work | **Preserve as historical implementation** | Keep the technical capability only where it supports migration; do not continue multi-theme product work. |
| Resume / WordPad | **Preserve and restyle** | Keep approved Leonardo Cavazzani content and the clear PDF-download behavior; rebuild the visible chrome for PixelOS. |
| My Computer | **Preserve and redesign as My Machine** | Replace old Explorer presentation with the supplied `MY MACHINE` structure and labels. |
| Guestbook / Visitor Scrapbook | **Remove from public application registry and routes** | End all UI, motion, adapter, and test follow-on scope. Retire the public surface safely; do not silently delete stored data. |
| Contact, Control Panel, My Portfolio | **Remove from registry, icons, routes, menu, and taskbar entry points** | No new public application work. Project API/data work becomes deferred product infrastructure, not a primary UI channel. |
| Mittens / Desktop Pet | **Add** | Copy the supplied cat asset and local pet/feed interaction model. It is not a chatbot. |
| Pixel Gallery | **Add** | Use the supplied four-image gallery collection, thumbnail rail, captions, nearest-neighbor rendering, and supplied image files. |
| Minesweeper | **Add / replace prior generic game scope** | Retain a testable engine but make the playable UI match the supplied PixelOS reference. |
| About PixelOS and README / Notepad | **Add** | Add the supplied dialog/editor patterns, adapting copy only to the current product name and retained behavior. |
| Windows XP, Windows 98, Windows 7 alternate/default themes | **End as a product direction** | Cancel all open Theme System work; completed work stays Done as historical technical work. |
| Pixel Desktop preview backlog | **Replace** | Cancel the speculative preview/promotion scope. PixelOS is now the single target, not a future optional theme. |
| Three.js, Vaporwave visualizer, 3D CRT, Solitaire, Pinball | **Remove from current product scope** | Cancel these open experiments to prevent them from competing with PixelOS delivery. |

## Board cancellations and reconciliations

| Action | Tickets | Rationale |
|---|---|---|
| Mark **Done** under the user’s reconciliation rule | FE-19, FE-24, THEME-19 | These are currently In Progress. Their delivered effort remains historical; no follow-on scope depends on the former theme direction. |
| Cancel all open legacy-theme work | THEME-4 through THEME-8, THEME-13 through THEME-18 | All are explicitly XP/98/7 entry, effect, transition, or parity work and conflict with the single PixelOS target. |
| Cancel legacy design/preview work | PIXEL-1 through PIXEL-8, FE-13, TEST-7 | The previous Pixel preview was original-only, optional, and dependent on XP/98 parity. The new provided reference is now the direct target. |
| Cancel retired-app follow-on work | FE-14, FE-15, TEST-5, TEST-10 | These cover the My Portfolio and Visitor Scrapbook frontends that will be removed. API/data work is not deleted, only deferred. |
| Cancel unrelated old visual experiments | 3D-1 through 3D-3, GAME-4 through GAME-8 | The reference has a 2D pixel desktop and Minesweeper, not a 3D/solitaire/pinball roadmap. |
| Replace rather than cancel | GAME-1 through GAME-3, TEST-8 | Retarget the Games shell and Minesweeper backlog to PixelOS and remove Solitaire dependencies. |
| Preserve but deprioritize | BE-6 through BE-9, INFRA-8, TEST-9 | Portfolio API/media work can continue later, but it is no longer connected to a My Portfolio application or current PixelOS launch scope. |

## PixelOS replacement backlog

### Sprint 6 — PixelOS Core Redesign

| Proposed ticket | Points | Dependencies | Scope |
|---|---:|---|---|
| PXOS-1 — Import Reference Assets and Establish PixelOS Visual Contract | 3 | FE-24 | Copy the supplied raster assets without semantic editing, create source-controlled asset map, define exact palette/type/chrome/asset ownership rules, and set PixelOS as the only active visual target. |
| PXOS-2 — Rebuild PixelOS Desktop, Window, Taskbar, and Start Menu Chrome | 8 | PXOS-1, FE-24 | Apply the supplied dark indigo panel, magenta active titlebar, 2px bevels, pixel glyphs, taskbar, Start rail/menu, focus treatment, and wallpaper presentation while retaining current window-manager behavior. |
| PXOS-3 — Retire Legacy Application Surfaces and Reconcile the App Registry | 3 | PXOS-2 | Remove Guestbook/Scrapbook, Contact, Control Panel, and My Portfolio from registry, icons, taskbar, launcher, and direct routes; preserve a safe fallback for stale URLs. |
| PXOS-4 — Rebuild My Computer as the PixelOS My Machine Application | 5 | PXOS-2 | Implement the supplied folder/drive grid, path field, selection state, and status bar while retaining real portfolio-safe content. |
| BE-11 — Retire the Public Guestbook Surface Safely | 3 | PXOS-3 | Remove public client routes and writes, decide data retention explicitly, and verify exposed Worker behavior does not invite new public submissions. |
| PXOS-5 — Implement Exact PixelOS Effects with Accessible Fallbacks | 3 | PXOS-1, PXOS-2 | Recreate supplied scanline/vignette, cursor blink, and pet bob effects; keep static/reduced-motion behavior equivalent and never block interaction. |
| TEST-11 — PixelOS Core Visual and OS-Behavior Regression Gate | 5 | PXOS-2 through PXOS-5 | Compare shell and retained OS behaviors against the reference, covering drag, resize, minimize, maximize, Start, keyboard focus, direct routes, reduced motion, and narrow screens. |

### Sprint 7 — PixelOS Applications

| Proposed ticket | Points | Dependencies | Scope |
|---|---:|---|---|
| PXOS-6 — Build Pixel Gallery from Supplied Asset Collection | 5 | PXOS-1, PXOS-2 | Implement the supplied main image panel, thumbnail rail, title/caption/status treatment, and nearest-neighbor image presentation. |
| PXOS-7 — Build Mittens Desktop Pet from Supplied Asset and Local Interactions | 3 | PXOS-1, PXOS-2 | Implement the supplied cat window, mood hearts, Pet/Feed actions, and brief local feedback. No persistent assistant/chat functionality. |
| PXOS-8 — Build README.TXT Notepad Application | 2 | PXOS-2 | Implement the supplied editable document, menu/status regions, insertion cue, and PixelOS orientation text. |
| PXOS-9 — Build About PixelOS Dialog | 2 | PXOS-1, PXOS-2 | Implement the supplied floppy-mascot dialog, product metadata, and close behavior. |
| GAME-1 — Rebuild PixelOS Application/Game Registry and Launcher Groups | 3 | PXOS-2, PXOS-3 | Replace the old Games hub with the exact PixelOS launch set and menu grouping needed by Minesweeper. |
| GAME-2 — Retain and Validate the PixelOS Minesweeper Rules Engine | 5 | GAME-1 | Keep a UI-independent engine; revise the contract for the supplied board lifecycle. |
| GAME-3 — Build PixelOS Minesweeper UI, Keyboard Support, and Local State | 5 | GAME-2, PXOS-2 | Implement the supplied counter/face/timer/grid/status treatment with accessible keyboard behavior and local-only state. |
| TEST-8 — Replace Game Property Coverage with PixelOS Minesweeper Engine Tests | 3 | GAME-2 | Remove Solitaire assumptions and test mine placement, reveal, flag, win/loss, and reset invariants. |
| PXOS-10 — Restyle the Retained Resume / WordPad Application for PixelOS | 3 | PXOS-2, FE-23 | Preserve approved content and PDF-download clarity while using PixelOS window/editor chrome. |

### Sprint 8 — PixelOS Quality and Deferred Portfolio Work

| Proposed ticket | Points | Dependencies | Scope |
|---|---:|---|---|
| TEST-12 — Add PixelOS Application Journey and Accessibility Coverage | 5 | PXOS-6 through PXOS-10, GAME-3 | Cover all retained/new application launches, keyboard paths, images/alt text, effects modes, and no-stale-route behavior. |
| TEST-13 — Establish PixelOS Screenshot Regression Baselines | 5 | TEST-11, TEST-12 | Replace XP/98 screenshot baselines with reference-aligned PixelOS shell and application baselines. |
| BE-6 through BE-9, INFRA-8, TEST-9 | Existing | Existing dependencies | Remain deferred infrastructure work; revisit only when a new portfolio-data product surface is approved. |

## Reference-required implementation notes

The reference supplies a scanline and vignette overlay, sprite bob, and blinking cursor. These are **required visual behaviors** for the direct PixelOS target, but they must preserve pointer events, honor the user’s reduced-motion preference, and leave keyboard focus/readable content intact. The existing restriction against a global CRT overlay belonged to the previous optional Pixel preview and is superseded by this direct reference requirement.

The reference contains its own simple window manager. The current project has a more mature manager and tests. The intended outcome is therefore **reference-equal visuals and listed app behavior, implemented on the existing OS foundation**, not a wholesale copy of the reference’s lower-level window-manager code.
