# THEME-11 visual review notes

## Local review

Reviewed the local Windows 98 alternate theme at desktop resolution on 2026-08-18.

| Surface | Finding |
|---|---|
| Desktop shell | Teal desktop remains clear; compact grid and icon labels remain legible. |
| Window chrome | My Computer and Visitor Scrapbook use square, beveled frames with navy title bars. |
| Taskbar | Uses compact square buttons and an inset system tray; task buttons show a visible pressed state. |
| Start menu | Opens above the taskbar with an original `2000sme` banner, separate Applications and Profile & settings groups, and visible keyboard-focus-compatible controls. |
| Guestbook | Decorative scrapbook treatment is flattened to square native panels in Windows 98 while preserving note content, tabs, and error/retry affordances. |

The local page reached the expected guestbook unavailable state because the development frontend was reviewed without a matching local API; this was not a visual regression or a change to guestbook behavior.

## Required automated evidence

- `pnpm --filter 00sfrontend test`: passed, 14 files / 48 tests.
- `pnpm --filter 00sfrontend lint`: passed with the three established Fast Refresh warnings only.
- `pnpm --filter 00sfrontend build`: passed after correcting global shell selectors.
- `pnpm --filter 00sfrontend test:theme`: passed, 11 Chromium scenarios.

Before release, also run the project-wide accessibility suite and inspect narrow mobile and direct-route views as required by `docs/quality/theme-compatibility-qa.md`.
