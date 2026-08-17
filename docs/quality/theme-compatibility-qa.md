# Supported theme compatibility QA

## Release boundary

The release supports **Windows XP** as the first-visit and invalid-preference fallback, and **Windows 98** as the fully supported alternate. Windows 7 remains a dormant stylesheet-only technical preview: it is retained at `/themes/7.css`, is not exposed in the control panel or primary launcher, and receives no release-parity promise.

## Automated matrix

Run `pnpm --filter 00sfrontend test:theme` after changes to shared window markup, semantic tokens, the theme provider, core applications, or mobile routing.

| Surface | Windows XP default | Windows 98 alternate | Evidence |
|---|---|---|---|
| Theme provider | Default root attributes and XP stylesheet | Stored preference restores 98 stylesheet | Browser assertion |
| Desktop core applications | Portfolio, Explorer, Resume, Guestbook, About, and Appearance windows open by their stable shortcuts | Same application IDs, window names, and content paths open | Browser assertion |
| Theme switching | XP to 98 preserves open Resume and Appearance windows | One active vendor stylesheet and one semantic-override stylesheet remain | Browser assertion |
| Responsive fallback | Registry-driven navigation exposes all seven primary routes | Same route count and primary destinations | Browser assertion |
| Accessibility baseline | XP desktop/Start, 98 window, and direct Guestbook scan for serious/critical axe findings | See `test:a11y` | Browser assertion |

## Resolved CSS-conflict findings

| Finding | Resolution |
|---|---|
| File Explorer, WordPad, and Project Detail used `--w98-*`, `--border-dark`, or fixed navy selection values in shared application chrome. | Added `--os-app-*` semantic tokens to the runtime override layer and migrated shared toolbars, dividers, selection, tags, and links. |
| App-level control surfaces could render with 98 bevel grammar while XP was active. | Shared content surfaces now resolve through the active semantic token contract; only intentionally preview-specific control-panel swatches retain literal theme samples. |
| Theme changes could be hard to regress manually. | Added a deterministic Chromium compatibility suite that verifies route parity, open-window persistence, and single-stylesheet isolation. |

## Required manual release review

For both supported themes, inspect desktop launchers, Start menu, My Computer project navigation, Resume scrolling/links, Guestbook form states, About, Control Panel, taskbar restore, focus indicators, direct routes, and the narrow mobile launcher. Confirm that content, keyboard behavior, and paths are identical; visual grammar may differ only through the active semantic token contract.
