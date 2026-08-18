# Theme reference integration plan

## Objective

THEME-11 and THEME-12 will be revised in place to deliver more recognizable Windows 98 and Windows XP visual systems while retaining the existing application registry, routes, window reducer, keyboard behavior, accessibility semantics, and responsive launcher.

## Source boundaries

| Source | License/provenance finding | Planned use |
|---|---|---|
| React95 | MIT for its software, but its license explicitly excludes Windows and associated images. | Use its classic component grammar as a source-level design reference: compact spacing, four-edge bevels, pressed-state displacement, classic title bars, and task-button treatment. No React95 Windows artwork or logo will be copied. |
| `faisalAkhtar/windows-xp` | MPL 2.0 repository; its README says Windows XP rights belong to Microsoft. | Use only as a visual reference for chrome proportions, glossy title-bar layering, taskbar hierarchy, and Start-menu composition. No source files, logo, wallpaper, or Windows-brand asset will be copied. |
| User-supplied Windows 98 archive | Its bundled readmes identify the selected main/secondary icon sets as public domain. | Use a limited, theme-scoped set of icons for system-adjacent surfaces, preserve the supplied provenance in project attribution, and keep original portfolio app icons as the primary navigation language. |
| User-supplied Windows XP archive | Its bundled desktop/folder icon readmes identify the selected icon sets as public domain. | Use a limited, theme-scoped set of icons for system-adjacent surfaces, preserve the supplied provenance in project attribution, and do not use the bundled sound schemes or registry files. |

## Visual-system changes

| Surface | Windows 98 revision | Windows XP revision |
|---|---|---|
| Desktop | Flat teal field, strict square icon grid, compact bitmap-like labels, classic system icon treatment. | Original blue-sky and green-horizon CSS backdrop, white-shadowed labels, softer icon spacing, and Luna-scale system icon treatment. |
| Window chrome | Three-dimensional outer and inner bevel, 18px navy/grey title bars, square 16px control buttons, recessed client area. | Layered glossy blue frame, 25px title bar, rounded control capsules, deeper blue active/inactive contrast. |
| Taskbar and Start | 28px silver taskbar, square Start button, narrow vertical brand rail, separators, classic task-button pressed state. | 40px glossy blue taskbar, green rounded Start button, user-style header, XP two-pane Start-menu hierarchy, light-blue tray. |
| Application surfaces | Recessed toolbars, compact controls, black/white bevel grammar, restrained content panels. | Luna blue headers, white client panels, rounded primary controls, side/task-pane contrast, while preserving content and form semantics. |
| Assets | Windows 98 system icons only where an existing system-affordance already exists. | XP system icons only where an existing system-affordance already exists. |

## Non-negotiable safeguards

The revision will not introduce Microsoft logos, the Bliss wallpaper, sound files, registry files, or a new public runtime API. It will not add a dependency that replaces the existing window lifecycle, registry, or accessibility semantics. Every visual state will retain a visible keyboard focus indicator and reduced-effects behavior.

## Validation plan

The existing browser compatibility suite will be expanded to assert each theme’s distinctive taskbar and Start-menu anatomy, and a new visual review record will compare the desktop, Explorer, WordPad, Scrapbook, Control Panel, direct route, and mobile states. The existing unit, accessibility, artifact-origin, lint, build, and hosted Quality gates remain required.
