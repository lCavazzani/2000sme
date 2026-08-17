# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## Guestbook Turnstile configuration

`VITE_TURNSTILE_SITE_KEY` is intentionally public browser configuration. Vite includes every `VITE_*` value in the compiled client bundle, and Cloudflare Turnstile site keys are designed to be exposed to the browser so its widget can render. Configure this value in the approved frontend build environment only; it must never contain a credential.

The matching `TURNSTILE_SECRET_KEY` is a backend Worker secret and must never be passed to Vite, placed in frontend source, or committed to the repository. The guestbook submission form remains disabled until the public site key is configured, while the backend independently verifies each submitted token.

## Tests

Vitest reads the `test` configuration from `vite.config.ts`, runs frontend tests in jsdom, and loads `src/test/setup.ts`. The setup file enables `@testing-library/jest-dom` matchers and performs React Testing Library cleanup after every test. Use `@testing-library/react` and `@testing-library/user-event` for behavior-focused component tests; assert user-visible output and interactions rather than component internals.

```bash
pnpm --filter 00sfrontend test
```

## Server-state data access

FE-16 uses `@tanstack/react-query` only for remote API data. The shared `src/api/client.ts` boundary owns URL requests, JSON parsing, client-side response validation, and normalized `ApiError` values. Domain modules such as `src/api/guestbook.ts` define their request and response types, query keys, services, and hooks.

Use `useQuery` for remote reads and `useMutation` for remote writes. New catalog queries should define keys under their own domain module, receive the `AbortSignal` supplied by TanStack Query, set an intentional `staleTime` and retry policy, and invalidate or safely reconcile affected queries after a mutation. Do not place form inputs, theme selection, desktop windows, drag state, or other UI-only state in the query cache; those remain local React state or in the existing window/theme providers.

`VITE_GUESTBOOK_API_ORIGIN` remains intentionally public browser configuration and contains only the API origin, never a credential. Production defaults to the same-origin `/api/guestbook` path when this variable is absent; a configured production origin must be public HTTPS and cannot be localhost, loopback, or a private-network address. Vite development may deliberately use `http://localhost:8787`. After `pnpm --filter 00sfrontend build`, run `pnpm --filter 00sfrontend assert:production-api-origin` to prove that the shipped artifact contains no localhost or private-network API endpoint.

## Semantic theme contract

THEME-10 keeps the existing runtime stylesheet swap and adds a semantic token layer for shared desktop chrome. Shared shell components use `--os-*` tokens rather than Windows-98-specific palette names, allowing the same markup to render either the sharp Windows 98 bevel grammar or rounded Windows XP/Luna chrome. THEME-3 extends this contract to core application toolbars, dividers, selections, tags, and links through `--os-app-*` tokens, so shared content does not leak Windows 98 chrome while XP is active.

Windows XP is the first-visit and invalid-preference fallback release theme; Windows 98 is the fully supported alternate. The `/themes/7.css` asset remains a dormant technical preview only: it is not selectable in the release UI and carries no compatibility or visual-parity promise. Run `pnpm --filter 00sfrontend test:theme` for the supported-theme browser matrix. The detailed evidence, CSS-conflict record, and manual release review are in [`../../docs/quality/theme-compatibility-qa.md`](../../docs/quality/theme-compatibility-qa.md). The complete token, capability, state, and reduced-effects contract is documented in [`src/theme/SEMANTIC_TOKENS.md`](./src/theme/SEMANTIC_TOKENS.md).

## Responsive fallback release validation

FE-12 keeps the desktop metaphor for larger screens while exposing the registry-driven mobile launcher at `640px` and below. Before a release, verify each primary route—Portfolio, Resume, Guestbook, About, Contact, and Themes—at narrow widths with touch simulation and keyboard navigation. Confirm that every launcher card can receive focus and open its hash route, no essential mobile action needs hover, dragging, or double-clicking, and the direct-route return control remains reachable.

## Browser accessibility regression checks

Run `pnpm --filter 00sfrontend test:a11y` to execute the Chromium Playwright suite with `@axe-core/playwright`. It scans the Windows XP first-visit desktop and Start menu, a Windows 98 stored-preference window, and the direct Guestbook route. The suite blocks new serious or critical automated findings; pair it with the required manual review in [`../../docs/quality/accessibility-release-checklist.md`](../../docs/quality/accessibility-release-checklist.md).


## Visitor Scrapbook

FE-17 presents the Guestbook application as **Visitor Scrapbook** while preserving the `guestbook` application ID and `#/apps/guestbook` route. It consumes only `useGuestbookEntries` and `useCreateGuestbookEntry` from `src/api/guestbook.ts`; presentation components must not call `fetch`, construct API URLs, or parse raw response data. The interface uses Read notes and Leave a note tabs, an ordered feed with article, heading, message, and time semantics, typed-query loading/error/retry states, inline client validation, Turnstile-gated duplicate-submit prevention, and an effects-independent live/status contract.

Keep the direct route readable at narrow widths and preserve the larger desktop window bounds in the registry. `src/components/Guestbook.test.tsx` and `e2e/visitor-scrapbook.spec.ts` cover the semantic feed, composer focus/validation, typed error retry, active theme compatibility, and mobile layout.

## Resume PDF action

FE-23 treats WordPad as a read-only presentation of the approved resume content. `Download resume (PDF)` is its single working document command and opens a print dialog for saving that rendered resume as PDF. The legacy WordPad menus, document buttons, and format controls remain intentionally visible for the OS metaphor but are semantically disabled; do not make a new toolbar command interactive unless it performs the indicated behavior. The primary action must remain visible, keyboard-focusable, and readable on both active themes and narrow direct routes. `src/components/WordPad.test.tsx` and `e2e/wordpad-resume.spec.ts` protect this contract.
