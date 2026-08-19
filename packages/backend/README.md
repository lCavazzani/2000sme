# Backend Worker

This package is a Hono application deployed to Cloudflare Workers. Its D1 binding is named `portfolio_db` and its public Guestbook rate-limit binding is named `RATE_LIMIT`.

## Development

```bash
pnpm --filter backend dev
pnpm --filter backend test
pnpm --filter backend cf-typegen
```

## Tests

`vitest.config.ts` runs the suite through `@cloudflare/vitest-pool-workers` using `wrangler.jsonc`. `test/setup.ts` applies the D1 migrations to an isolated database before every test and resets worker state afterward. Tests must use these runtime fixtures and never depend on production secrets, D1 data, or KV contents. `test/health.test.ts` is the package smoke test; guestbook tests cover public API behavior.

```bash
pnpm --filter backend test
```

## Structure

The Worker uses a small domain-oriented structure rather than a single large route file.

| Location | Responsibility |
|---|---|
| `src/index.ts` | Worker entry point; exports the composed application. |
| `src/app.ts` | Application composition, global CORS policy, health route, and domain-router mounting. |
| `src/domains/guestbook-retirement/guestbook-retirement.routes.ts` | Intentional public retirement response only; it cannot read, write, or delete Guestbook data. |
| `src/shared/` | Cross-domain HTTP-error helpers. |

Future project-catalog APIs should be added under `src/domains/projects/` using the same route, service, repository, and types boundary. Avoid generic base repositories or dependency-injection frameworks until a real cross-domain need appears.

## Schema migrations

`migrations/` is immutable database history. Each numbered SQL file changes the D1 schema exactly once per database; Wrangler records applied filenames in D1’s migration table. Do not edit a migration after it has been applied to a shared environment. Create the next numbered migration for every later schema change.

`0002_project_catalog.sql` contains only the project-catalog schema: normalized tables, constraints, indexes, and the `published_projects` view. It intentionally contains no catalog content.

Apply schema migrations locally:

```bash
pnpm --filter backend db:migrate:local
```

Apply schema migrations to remote D1 only through an approved deployment or maintenance workflow:

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

## Retired Guestbook boundary

The public Guestbook was retired for the PixelOS transition. Every request under `/api/guestbook` returns the structured `410 Gone` response `guestbook_retired` with `Cache-Control: no-store`. The retirement route does not parse submissions, call Turnstile, consume rate-limit capacity, query D1, create records, or expose deletion behavior.

Guestbook records are intentionally **retained** in the existing D1 table. BE-11 makes no migration, seed, remote D1 command, or record change. Any future archive, export, or deletion decision requires a separately approved maintenance procedure that identifies exact records and documents the owner decision. Do not reintroduce a public read, write, moderation, or deletion endpoint without a new authenticated product and security scope.

## Deploy

```bash
pnpm --filter backend deploy
```

## Public Projects Catalog contract

`GET /api/projects` exposes the published project catalog as compact cards. Cards are ordered by `sort_order` ascending, then `project_year` descending and `slug` ascending as a deterministic tie-breaker. Each card contains only `slug`, `name`, `summary`, `year`, `thumbnail`, and ordered `technologies`; it intentionally omits the longer description and external links.

`GET /api/projects/:slug` returns the same published-card fields plus `description` and ordered `links`. Both endpoints query the `published_projects` view rather than the base table, so draft records cannot enter the public response. Unknown and unpublished slugs return the same structured `404` response with `code: "project_not_found"`; no response reveals whether a private project exists.

Successful catalog responses use `Cache-Control: public, max-age=300, stale-while-revalidate=86400`. The existing global CORS and security-header middleware applies to the catalog unchanged. `test/projects.test.ts` is the BE-7 Workers-runtime baseline; TEST-9 adds the broader fixture and contract-regression suite.

### Projects Catalog contract regressions

`test/project-catalog.contract.test.ts` runs through the configured Workers D1 binding with isolated records. It compares list and detail responses to `test/fixtures/project-catalog.json`, so removing or renaming a public field, changing technology/link order, leaking a draft, changing cache headers, or loosening CORS fails before a frontend adapter consumes the API. The JSON fixture is intentionally production-independent and can be used by future client adapters as a stable response example.
