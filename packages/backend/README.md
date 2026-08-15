# Backend Worker

The backend is a Hono application deployed to Cloudflare Workers. Its D1 binding is named `portfolio_db`.

## Local development

```bash
pnpm --filter backend dev
```

## D1 migrations and seed fixtures

`migrations/0002_project_catalog.sql` is a forward-only schema migration and repeatable catalog fixture. It creates normalized `projects`, `project_technologies`, and `project_links` tables, then seeds the `sportifolio`, Project Alpha, and Project Beta records.

Apply all migrations to a disposable local D1 database before local development or Workers-runtime tests:

```bash
pnpm --filter backend exec wrangler d1 migrations apply portfolio-db --local
```

Inspect the API-ready published catalog and its normalized child records:

```bash
pnpm --filter backend exec wrangler d1 execute portfolio-db --local --command "SELECT slug, name, project_year, thumbnail_ref FROM published_projects ORDER BY sort_order"
pnpm --filter backend exec wrangler d1 execute portfolio-db --local --command "SELECT project_id, technology, sort_order FROM project_technologies ORDER BY project_id, sort_order"
pnpm --filter backend exec wrangler d1 execute portfolio-db --local --command "SELECT project_id, label, url, sort_order FROM project_links ORDER BY project_id, sort_order"
```

Apply the same forward-only migrations to the configured remote D1 database only through an approved deployment or maintenance workflow:

```bash
pnpm --filter backend exec wrangler d1 migrations apply portfolio-db --remote
```

Do not store project image bytes in D1. `thumbnail_ref` holds a validated relative media reference or a future storage key; public project APIs must read from `published_projects` so draft records are never returned.

## Worker types

Generate or synchronize types from the Worker configuration with:

```bash
pnpm --filter backend cf-typegen
```

Pass `CloudflareBindings` as the Hono generic:

```ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```

## Deploy

```bash
pnpm --filter backend deploy
```
