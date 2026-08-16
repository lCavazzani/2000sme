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

`VITE_GUESTBOOK_API_ORIGIN` remains intentionally public browser configuration and contains only the API origin, never a credential.

## Semantic theme contract

THEME-10 keeps the existing runtime stylesheet swap and adds a semantic token layer for shared desktop chrome. Shared shell components use `--os-*` tokens rather than Windows-98-specific palette names, allowing the same markup to render either the sharp Windows 98 bevel grammar or rounded Windows XP/Luna chrome. The complete token, capability, state, and reduced-effects contract is documented in [`src/theme/SEMANTIC_TOKENS.md`](./src/theme/SEMANTIC_TOKENS.md).

## Responsive fallback release validation

FE-12 keeps the desktop metaphor for larger screens while exposing the registry-driven mobile launcher at `640px` and below. Before a release, verify each primary route—Portfolio, Resume, Guestbook, About, Contact, and Themes—at narrow widths with touch simulation and keyboard navigation. Confirm that every launcher card can receive focus and open its hash route, no essential mobile action needs hover, dragging, or double-clicking, and the direct-route return control remains reachable.
