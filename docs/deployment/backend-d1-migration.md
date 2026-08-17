# Production D1 migration and backend smoke gate

BUG-4 restores the production Guestbook schema through the deployment workflow. The migration is intentionally separate from local project seed data: `packages/backend/migrations/0001_guestbook.sql` creates only the Guestbook table, while repeatable local catalog fixtures remain in `packages/backend/seeds/projects.sql`. Applying a production migration therefore does not create a sample visitor entry or alter visitor content.

Before the backend Worker deploys, the workflow runs `pnpm --dir packages/backend exec wrangler d1 migrations apply portfolio-db --remote` with the approved Cloudflare token and account ID. Wrangler records applied migrations, so re-running the command is idempotent. The following workflow step queries the configured remote D1 binding and fails if the `guestbook` table is absent. The binding name and database ID remain declared in `packages/backend/wrangler.jsonc`; the rate-limit KV binding remains separately declared there as `RATE_LIMIT`.

After the Worker deployment succeeds, `pnpm --dir packages/backend run smoke:remote` checks `GET /api/health` and `GET /api/guestbook?limit=20` on the public backend. The smoke command requires `ok` from health, an HTTP 200 Guestbook response, the documented `entries` and `page` shape, and no more than the requested number of entries. A migration, schema verification, deploy, or smoke failure marks the backend deployment job as failed.

## Authorized maintainer procedure

Review and merge the BUG-4 workflow change through the normal `development` to `master` promotion process. Before the first production run, an authorized maintainer must confirm that `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are configured with access to the intended D1 database and Worker. The maintainer should then review the deploy logs for the migration result, schema verification, Worker deploy, and smoke output. Do not run the remote migration manually from a local machine unless the owner has explicitly authorized the production data change.
