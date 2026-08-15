# Backend Worker

The backend is a Hono application deployed to Cloudflare Workers. Its D1 binding is named `portfolio_db`.

## Local development

```bash
pnpm --filter backend dev
```

## Schema migrations

`migrations/` is immutable database history. Each numbered SQL file changes the D1 schema exactly once per database; Wrangler records applied filenames in D1’s migration table. Do not edit a migration after it has been applied to a shared environment. Create the next numbered migration for every later schema change.

`0002_project_catalog.sql` contains only the project-catalog schema: normalized tables, constraints, indexes, and the `published_projects` view. It intentionally contains no catalog content.

Apply schema migrations to a local D1 database:

```bash
pnpm --filter backend db:migrate:local
```

Apply schema migrations to the configured remote D1 database only through an approved deployment or maintenance workflow:

```bash
pnpm --filter backend db:migrate:remote
```

## Catalog seed data

`seeds/projects.sql` is repeatable fixture data for `sportifolio`, Project Alpha, and Project Beta. It is deliberately separate from migrations because catalog content can change independently of database schema. Running it upserts the three catalog records and replaces their fixture technologies and links.

Load the fixture into local D1 after migrations:

```bash
pnpm --filter backend db:seed:local
```

Use the remote seed command only when the site owner has reviewed the content and explicitly approved changing remote catalog data:

```bash
pnpm --filter backend db:seed:remote
```

Inspect the API-ready published catalog and its normalized child records:

```bash
pnpm --filter backend exec wrangler d1 execute portfolio-db --local --command "SELECT slug, name, project_year, thumbnail_ref FROM published_projects ORDER BY sort_order"
pnpm --filter backend exec wrangler d1 execute portfolio-db --local --command "SELECT project_id, technology, sort_order FROM project_technologies ORDER BY project_id, sort_order"
pnpm --filter backend exec wrangler d1 execute portfolio-db --local --command "SELECT project_id, label, url, sort_order FROM project_links ORDER BY project_id, sort_order"
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
