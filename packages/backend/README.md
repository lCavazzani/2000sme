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

## Public Guestbook contract

The public guestbook is immediately published after server-side validation. It accepts **plain-text `name` and `message` fields only**; HTML, CSS, fonts, image URLs, card decoration, rich text, uploads, and other presentation metadata are rejected or ignored by the contract. Clients must render returned fields as text, never as HTML.

`GET /api/guestbook` returns a newest-first page with `entries` and an opaque `page.next_cursor`. Clients may set `limit` from 1 through 50 and must use the returned cursor for continuation rather than guessing offsets. Errors always return a JSON object with an `error` message and machine-readable `code`; a `rate_limited` response also includes `Retry-After` and `retry_after_seconds`.

There is no moderation dashboard in this release. Abuse reports must be escalated to the site owner through the project’s established contact channel. The owner may review and remove an entry through an approved D1 maintenance procedure, then record the action. Do not expose deletion or moderation endpoints publicly without a separate authenticated moderation ticket.

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
