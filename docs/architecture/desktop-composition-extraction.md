# FE-21 — Desktop composition extraction scope

## Decision

**Extract `ApplicationContent`, `DirectApplicationRoute`, and the desktop shell into focused modules in a follow-up implementation ticket.** No component is moved in FE-21. The recommendation is justified because `App.tsx` currently combines three different boundaries: application-content resolution, route-mode presentation, and stateful desktop orchestration. Keeping them together makes the root composition file the shared change point for registry, routing, keyboard, window, mobile-fallback, and project-detail work.

The proposed split preserves the existing desktop behavior and does not change the Windows store, application registry, hash-route format, theme system, or window components.

## Current responsibility map

| Current concern in `App.tsx` | State or dependency owner | Recommended destination | Rationale |
|---|---|---|---|
| Resolve an application renderer, project-detail fallback, and generic fallback content | Application registry and `ProjectDetail` | `components/ApplicationContent.tsx` | This is pure content resolution and is reused by window and direct-route presentation. |
| Render a direct application route and return-to-desktop control | Hash route and application registry | `components/DirectApplicationRoute.tsx` | Direct routes have their own semantic main region and need an explicit, testable return action. |
| Read hash changes and determine direct-route versus desktop mode | Browser location | `components/DesktopShell.tsx` | Route-mode state belongs with shell orchestration, not the provider root. |
| Register Alt+1 through Alt+6 application shortcuts | Registry and Windows provider | `components/DesktopShell.tsx` | This is desktop interaction behavior, already covered by TEST-3-style integration tests. |
| Own selected desktop icon state | Desktop shell | `components/DesktopShell.tsx` | Selection is local UI state and should remain close to icon rendering. |
| Render mobile launcher, desktop icons, mapped windows, and taskbar | Registry and Windows provider | `components/DesktopShell.tsx` | These form the desktop composition boundary. |
| Mount the `WindowsProvider` | Root application | `App.tsx` | Keep the provider boundary visibly small and stable. |

## Recommended module map

```text
src/
  App.tsx
  components/
    ApplicationContent.tsx
    DirectApplicationRoute.tsx
    DesktopShell.tsx
```

The target root should remain intentionally small.

```tsx
export default function App() {
  return (
    <WindowsProvider>
      <DesktopShell />
    </WindowsProvider>
  )
}
```

`DesktopShell` should retain the existing route listener, Alt-shortcut listener, selected-icon state, desktop application list, mapped windows, mobile launcher, and taskbar. This keeps all behavior that depends on `useWindows()` in one place. It should choose between `<DirectApplicationRoute />` and the desktop markup without adding a routing library or changing the hash contract.

## Public contracts

| Module | Proposed public contract | Notes |
|---|---|---|
| `ApplicationContent` | `({ windowId, title }: { windowId: string; title: string })` | Keep the project-detail fallback private to this resolver. It must return registered renderers, project details for `project-detail-*`, or the current generic fallback. |
| `DirectApplicationRoute` | `({ applicationId, onOpenDesktop }: { applicationId: ApplicationId; onOpenDesktop: () => void })` | Receives an explicit desktop-return callback instead of relying on a placeholder `href="#"` behavior. It remains responsible for the semantic direct-route main region. |
| `DesktopShell` | No public props in the first extraction | It uses `useWindows()` and browser hash state internally. Avoid adding a global routing abstraction solely for this split. |

## Direct-route return recommendation

The current direct-route control is a placeholder anchor to `#`. A follow-up extraction should replace this with an intentional `onOpenDesktop` action that clears the application hash and restores a meaningful focus target such as `[data-desktop-root]`. The component should not call browser-global code directly when a callback can make the behavior explicit and testable.

## Regression risks and required tests

| Behavior to protect | Test or manual check |
|---|---|
| Direct application routes | Render each registered `#/apps/<id>` route; verify its semantic main region and desktop-return action. |
| Hash changes while the app is mounted | Change `window.location.hash`; verify the shell switches between desktop and direct-route modes without stale content. |
| Alt shortcuts | Fire Alt+1 through Alt+6; verify the registered desktop application opens and unregistered combinations do nothing. |
| Desktop icon selection and keyboard launch | Use accessible desktop button names; verify click/focus selection and Enter/Space opening. |
| Open, minimize, restore, focus, and close windows | Use visible window and taskbar controls; verify focus restoration to the launcher or taskbar control. |
| Project-detail fallback | Render a `project-detail-*` window id and verify the correct project id reaches `ProjectDetail`. |
| Responsive fallback | Verify the mobile launcher remains registry-driven and direct links work without desktop windows. |

## Implementation estimate and boundaries

The follow-up is a **small behavior-preserving refactor**: approximately three focused modules plus import/test updates. It should be a dedicated ticket because it touches root composition, browser hash handling, and focus behavior simultaneously. Do not combine it with visual theme changes, new routes, registry additions, or a routing-library migration.

The extraction is simpler than retaining `App.tsx` because each new registry, route, or desktop interaction change then has one obvious home. It avoids a larger root file while retaining a single stateful desktop orchestration module instead of scattering window state across unrelated components.
