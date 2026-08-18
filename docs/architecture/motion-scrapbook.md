# Visitor Scrapbook Motion Architecture

**Ticket:** FE-19  
**Scope:** Visitor Scrapbook only  
**Status:** Implemented as a restrained progressive enhancement

## Purpose

Motion is used only at the Visitor Scrapbook boundary. The feature does not turn the portfolio into an animation-led interface: notes, form state, errors, and keyboard interactions remain ordinary React and HTML behavior. Motion adds a small amount of optional feedback when a card is added, removed after a failed optimistic request, hovered, or focused.

> The rule is simple: **motion may clarify a change, but it must never carry meaning that is absent without motion.**

| Concern | Implementation decision |
|---|---|
| Animation library | `motion` package, imported from `motion/react` |
| Boundary | One `MotionConfig` around `Guestbook` only |
| Animated values | `opacity`, a short card-entry `y` transform, hover `y`, and keyboard-focus scale |
| Excluded features | No drag, layout animation, physics, scroll parallax, repeat loops, GSAP, WebGL, audio, or page turns |
| Accessibility | System reduced motion and persistent manual effects reduction disable transform motion |
| Data ownership | TanStack Query remains the only source of feed/mutation state |

## How the pieces fit together

`ThemeProvider` owns the persistent **effects preference**. It has two values: `system`, which follows the operating system’s `prefers-reduced-motion` setting, and `reduced`, which always removes optional scrapbook physical motion. The resolved result is exposed as `effects` and written to `html[data-theme-effects]`.

`AppearanceThemesWindow` is only the control surface. It calls `setEffectsPreference`; it does not know how cards animate or how guestbook data is fetched. This matches the existing theme pattern, where the control panel changes an application preference while the corresponding component consumes it.

`Guestbook` uses the resolved `effects` value once:

```tsx
<MotionConfig reducedMotion={effects === 'reduced' ? 'always' : 'never'}>
  {/* shared semantic Visitor Scrapbook */}
</MotionConfig>
```

That configuration applies only to descendant `motion.*` elements. In full-effects mode, a newly added note can enter with a brief opacity/vertical transition. In reduced mode, Motion disables transform behavior and keeps non-spatial opacity behavior available. The stylesheet uses the same `data-theme-effects` attribute to hide optional decoration and remove static scrapbook rotations.

| Layer | Responsibility | Does not own |
|---|---|---|
| `ThemeProvider` | Saved preference, system preference, root attribute, resolved effects state | Guestbook card markup or query data |
| `AppearanceThemesWindow` | Accessible radio controls for changing preference | Animation configuration |
| `Guestbook` | Scoped `MotionConfig`, semantic cards, card lifecycle values | Theme persistence or API parsing |
| `useCreateGuestbookEntry` | Optimistic insertion, server reconciliation, rollback on failure | React animation state |
| `Guestbook.module.css` | Shared focus treatment and token-based materials | Structural or data-flow forks |

## Why this is different from GSAP

GSAP is primarily an **imperative animation engine**. A common GSAP flow selects or references a DOM element and tells a timeline what to do:

```ts
// Illustrative GSAP-style imperative thinking
animation.to(cardElement, { y: 0, opacity: 1 })
```

Motion for React is more **declarative**. A component describes its visual state in JSX, and Motion reconciles it with the React lifecycle:

```tsx
<motion.li initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} />
```

Neither model is universally better. GSAP is strong for complex, independently timed art direction and timeline choreography. Motion fits this project because the animations follow React state transitions: a card appears when an entry exists, disappears when rollback removes it, and should never outlive or fight React’s component lifecycle.

| Question | Motion in this feature | Typical GSAP approach |
|---|---|---|
| What starts the effect? | React renders a new keyed card | A handler drives a timeline through a DOM ref |
| What stops it? | Card unmounts or changes state | The timeline must be killed or reversed deliberately |
| How is reduced motion applied? | One scoped `MotionConfig` policy | Developer conditions or alters individual timelines |
| How is reconciliation handled? | React key remains stable | Timeline/ref bookkeeping must follow the changing element |

## Stable visual identity during reconciliation

An optimistic note begins with a temporary API identity such as `optimistic-...`. When the server responds, it replaces that temporary `id` with the real numeric database ID. If the React key changed at that moment, React would remove one card and mount another; that can replay entry animation and change the deterministic decoration.

FE-19 adds a private `visualKey` to the client-side `GuestbookEntry` type. It is created with the optimistic entry and copied to the server-backed replacement. The UI uses `visualKey ?? id` for the React key and the decoration hash. The public API response is unchanged; `visualKey` is never sent to or expected from the backend.

```plain
optimistic entry: id = optimistic-123, visualKey = optimistic-123
server response:  id = 42,             visualKey = optimistic-123
```

Therefore, users see **one stable card**, not an optimistic card followed by a second server card. On failure, TanStack Query restores the prior feed and the composer retains its draft; Motion may fade the removed optimistic card, but the error and retry path remain ordinary semantic content.

## Guardrails

The implementation has automated coverage for the theme preference contract, scrapbook semantics, reduced-effects behavior, cross-theme compatibility, browser accessibility, and a browser scenario that keeps an open scrapbook draft and loaded feed intact while both theme and effects preferences change. The direct objective is to prevent animation from causing refetches, remounts, focus loss, or data loss.

## References

[1] [MotionConfig — Motion for React](https://motion.dev/docs/react-motion-config)  
[2] [Create accessible animations in React — Motion](https://motion.dev/docs/react-accessibility)  
[3] [useReducedMotion — Motion for React](https://motion.dev/docs/react-use-reduced-motion)
