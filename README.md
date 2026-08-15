# 2000sme

[![Deploy](https://github.com/lCavazzani/2000sme/actions/workflows/deploy.yml/badge.svg)](https://github.com/lCavazzani/2000sme/actions/workflows/deploy.yml)

A personal portfolio project.

## Structure

```
sportifolio/
├── packages/
│   ├── frontend/     # Frontend application
│   └── backend/      # Backend application
├── package.json      # Root workspace config
├── pnpm-workspace.yaml
└── README.md
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/) — `npm install -g pnpm`

### Install

```bash
pnpm install
```

This installs dependencies for all packages from the root.

### Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Run all packages in dev mode (parallel) |
| `pnpm build` | Build all packages |
| `pnpm test` | Run tests across all packages |
| `pnpm lint` | Lint all packages |

To run a script in a single package:

```bash
pnpm --filter @sportifolio/frontend dev
pnpm --filter @sportifolio/backend dev
```

## Packages

### `@sportifolio/frontend`

Frontend application — see [`packages/frontend`](packages/frontend).

## Theme Compatibility Scope

The release compatibility target consists of **Windows 98** and **Windows XP**. The frontend loads exactly one active OS stylesheet at runtime through `ThemeProvider`, while shared components keep semantic markup independent of a specific vendor stylesheet. This makes active theme switching possible without resetting the desktop or its open windows.

Windows 7 remains in the repository as a **dormant technical preview**: its stylesheet is retained for future reference, but it is not selectable from the primary Appearance Control Panel and is outside the release compatibility and visual-fidelity promise. A historic stored Windows 7 preference safely normalizes to Windows 98 on startup.

Theme verification for release work must cover the desktop, taskbar, windows, forms, menus, focus states, scroll regions, responsive behavior, and content paths under both Windows 98 and Windows XP. Do not add Windows 7 parity work without a separate definition-of-ready decision.

### `@sportifolio/backend`

Backend application — see [`packages/backend`](packages/backend).
