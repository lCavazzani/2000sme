# Accessibility release checklist

## Automated evidence

Run `pnpm --filter 00sfrontend test:a11y` before release and require it in pull-request validation. The Chromium suite runs `@axe-core/playwright` scans against the Windows XP first-visit desktop, its keyboard-opened Start menu, a Windows 98 desktop window restored from stored preference, and the direct Guestbook route with its verification-status state.

The suite fails on new **serious** or **critical** axe violations. Passing automated checks are necessary evidence, not a claim of complete WCAG conformance.

## Required manual review

| Review area | Check | Supported themes and states |
|---|---|---|
| Keyboard-only operation | Use Tab, Shift+Tab, Enter, Space, and Escape to open a desktop app, operate its controls, minimize it, restore it from the taskbar, and close it. Confirm focus remains visible and returns to a usable launcher or taskbar control. | XP first visit and Windows 98 stored preference |
| Direct routes | Open every registry route directly, then use the desktop-return control. Confirm meaningful headings, reading order, and a reachable return action. | XP and Windows 98 |
| Guestbook validation | With the approved Turnstile configuration available, submit empty, invalid, and valid values. Confirm errors/status are announced and focus is not trapped. | XP and Windows 98 |
| Zoom and reflow | Review core desktop, direct routes, Guestbook, and mobile launcher at 200% and 400% browser zoom or equivalent narrow width. | XP and Windows 98 |
| Reduced effects | Enable `prefers-reduced-motion` or the product’s reduced-effects setting. Confirm no nonessential motion, gloss, or CRT treatment obscures focus, selection, or readable text. | XP and Windows 98 |
| Screen-reader smoke check | Verify landmark names, launcher/button names, window dialog names, Start menu items, form labels, status messages, and error alerts. | XP and Windows 98 |

## Exception policy

Do not waive a serious or critical automated finding without recording the affected state, a written rationale, an owner, and a follow-up ticket on the project board. Automated axe output alone does not prove conformance; the manual review above remains mandatory.
