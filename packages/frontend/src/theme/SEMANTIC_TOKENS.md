# Semantic theme token contract

THEME-10 separates component roles from the Windows 98 or XP values used to render them. Shared shell components must use `--os-*` tokens and must not depend on a historical palette name such as `--w98-silver`.

## Theme modes

`ThemeProvider` continues to select the runtime vendor stylesheet and writes `data-os-theme` to the document root. It also exposes visual capabilities as data attributes:

| Attribute | Windows 98 | Windows XP |
|---|---|---|
| `data-theme-chrome` | `bevel` | `luna` |
| `data-theme-gloss` | `off` | `on` |
| `data-theme-crt` | `off` | `off` |
| `data-theme-effects` | `full` or `reduced`, following `prefers-reduced-motion` | `full` or `reduced`, following `prefers-reduced-motion` |

`/themes/semantic-overrides.css` loads after the selected vendor stylesheet. It defines the theme values and owns global `.window` and `.title-bar` overrides, so the same markup can retain a square bevel grammar in Windows 98 and adopt rounded Luna chrome in Windows XP.

## Token groups

| Group | Tokens | Intended consumers |
|---|---|---|
| Desktop and icon labels | `--os-desktop-surface`, `--os-desktop-fg`, `--os-icon-label-fg`, `--os-icon-label-shadow`, `--os-icon-selected-shadow` | body, desktop icons |
| Window and title bar | `--os-window-*`, `--os-title-active-*`, `--os-title-inactive-*` | shared window and title-bar selectors |
| Taskbar and launcher | `--os-taskbar-*`, `--os-start-menu-*`, `--os-tray-*` | taskbar, Start menu, system tray |
| Interactive controls | `--os-control-*`, `--os-focus-ring`, `--os-focus-offset` | task buttons, Start-menu items, selection states |
| Optional effects | `--os-gloss-overlay`, `--os-crt-opacity`, `--os-motion-duration` | visual treatment and reduced-effects behavior |

## Required state matrix

Every new shared-shell token consumer must preserve these states under both active themes.

| State | Requirement |
|---|---|
| Default | The component uses its semantic surface, foreground, border, radius, and elevation tokens. |
| Hover | Interactive shell items use the intended hover treatment without leaking a Windows 98 hard-coded color into XP. |
| Pressed | Task/control press feedback uses `--os-control-pressed-bg`, border, and inset tokens where applicable. |
| Selected | Active task buttons, selected desktop icons, and Start-menu selections use `--os-control-selected-*` tokens. |
| Focus | Keyboard focus remains visible through `--os-focus-ring` and `--os-focus-offset`. |
| Disabled | Disabled controls use `--os-control-disabled-fg` and remain readable. |
| Inactive window | Non-frontmost windows use `--os-title-inactive-*`; the active window uses `--os-title-active-*`. |
| Reduced effects | `prefers-reduced-motion: reduce` removes nonessential motion, gloss, and CRT opacity. |

## Boundaries

Do not edit the generated `public/themes/98.css` or `public/themes/xp.css` files for semantic shell work. Add or adjust theme-owned overrides in `semantic-overrides.css` instead. Application-specific document content may retain domain styling until a separate ticket moves it into the shared theme contract.
