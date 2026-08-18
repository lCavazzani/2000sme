# Taskbar, Start-menu, and supplied-icon visual review

## Windows 98 review

The local Windows 98 review confirms that the desktop launchers now use the owner-supplied 16-colour icon set rather than the earlier original SVG placeholders. The taskbar Start control displays the supplied Windows 98 desktop asset, and the opened Start menu is now a single narrow vertical menu with a blue vertical rail, icon-led rows, classic bevels, a separator before supporting entries, and no visible generic two-column headings.

The visual result retains the existing accessible semantic groups and keyboard launch order while presenting them as a traditional menu. The menu is compact, left-anchored above the 98 taskbar, and does not introduce horizontal overflow.

## Validation note

The focused Windows 98 visual review is paired with the browser contract in `e2e/theme-compatibility.spec.ts`, which asserts the intended vertical menu layout and the supplied theme-specific portfolio icon path.

## Windows XP review

The rebased XP review confirms that the taskbar Start control now uses the supplied XP asset and that desktop launchers, Start-menu rows, and active task buttons resolve through the same theme-specific mapping. XP retains the intentional two-pane Start-menu hierarchy because that is its native menu anatomy; however, the former generic row imagery is replaced by the supplied icon set in both the applications and profile/settings panes.

The XP Start menu retains the existing user header, responsive one-column fallback, and keyboard focus order. This keeps the Windows 98 menu deliberately single-column and traditional while preserving an independently recognisable XP/Luna Start-menu composition.
