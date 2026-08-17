# ThemeDemo Harness Decision

> **Decision:** Replace the legacy `ThemeDemo` route with maintained automated coverage, then remove the route and its dedicated stylesheet in a small follow-up change. Do not retain it as a visitor-facing page or a permanent development route.

## Context

`ThemeDemo` was created as an early development harness for runtime stylesheet switching. It renders standalone primitive components, exposes Windows XP and Windows 98 radio controls, and holds a text input plus incrementing counter to demonstrate that React-local state survives a theme switch.

The portfolio now has an in-world **Appearance & Themes** application, a semantic theme-token contract, and browser-level supported-theme coverage. Retaining a parallel page duplicates the visitor-facing theme choice and keeps a separate route that is not part of the desktop OS experience.

## Current Consumer Inventory

| Surface | Current state | Consequence |
|---|---|---|
| `src/routes/ThemeDemo.tsx` | Defines the standalone harness. | It is not imported by the application shell, registry, or direct-route mapping. |
| `src/routes/ThemeDemo.css` | Styles only the standalone harness. | It has no shared-shell consumer. |
| Application registry | No `ThemeDemo` entry or launch surface. | Visitors cannot launch it through desktop, Start, mobile, or a direct hash route. |
| Build entry points | No route import from `main.tsx` or `App.tsx`. | The route is not part of the production experience. |
| Test suite | No direct `ThemeDemo` test. | Its historical proof must be retained through tests that exercise the supported path instead. |

## Exact Behavior Previously Demonstrated

| Historical ThemeDemo proof | Maintained replacement |
|---|---|
| XP and Windows 98 can be selected at runtime. | `ThemeProvider.test.tsx` asserts XP default, Windows 98 switching, active stylesheet ownership, and persisted choice. |
| Theme capabilities reflect the active theme. | `ThemeProvider.test.tsx` asserts `data-os-theme`, chrome, gloss, CRT, and reduced-effects capabilities. |
| One vendor theme link remains active after switching. | `ThemeProvider.test.tsx` and `e2e/theme-compatibility.spec.ts` assert a single active theme link and a correctly ordered semantic override stylesheet. |
| UI state survives a stylesheet switch. | `e2e/theme-compatibility.spec.ts` opens Resume and Appearance windows, switches XP to Windows 98 through the in-world control panel, and asserts both windows remain visible. |
| Visitor-facing theme controls work in both release themes. | `e2e/theme-compatibility.spec.ts` and `e2e/accessibility.spec.ts` cover the supported theme flow through the desktop experience. |

## Decision Analysis

| Option | Assessment | Decision |
|---|---|---|
| Retain as a permanent public route | Duplicates Appearance & Themes and breaks the in-world desktop model. | Rejected. |
| Retain as an undocumented development route | Adds a second manual test path that can drift from production behavior. | Rejected. |
| Move to an isolated Storybook-like fixture | Could be useful in a larger component library, but the project has no Storybook infrastructure and current browser coverage exercises the real shell. | Deferred; not justified now. |
| Replace with supported-path automated coverage and remove | Keeps the exact confidence signals while eliminating unused production code and duplicate theme UI. | **Approved.** |

## Follow-Up Implementation Checklist

The follow-up must be a separate ticket and pull request. It must:

1. Remove `src/routes/ThemeDemo.tsx` and `src/routes/ThemeDemo.css` only after confirming the reference inventory remains empty.
2. Keep the `ThemeProvider` contract tests and supported-theme Playwright coverage described above.
3. Add a lightweight static regression that fails if a stale `ThemeDemo` import or application-registry entry is introduced unintentionally.
4. Run frontend unit tests, Playwright browser checks, lint, production build, and whitespace validation.
5. Verify Windows XP remains the first-visit default, Windows 98 remains the active alternate, and Windows 7 remains unavailable in the primary UI.

## Release Boundary

This decision changes neither runtime theme behavior nor the active release contract. Windows XP remains the default release theme; Windows 98 remains the supported alternate; Windows 7 remains a deferred technical preview.
