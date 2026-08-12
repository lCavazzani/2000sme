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

### `@sportifolio/backend`

Backend application — see [`packages/backend`](packages/backend).
