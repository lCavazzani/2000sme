# Frontend deployment artifact

The deployment workflow validates the frontend in the `quality` job before any Worker deployment can begin. That job runs linting, API security regression tests, the workspace tests, and `pnpm --filter 00sfrontend build`. It then uploads `packages/frontend/dist` as the short-lived `frontend-dist` artifact.

The separate `Deploy Frontend` job downloads that exact artifact back to `packages/frontend/dist`. It verifies that `index.html` exists before invoking Wrangler. This matters because GitHub Actions jobs have isolated workspaces: a file built in `quality` is unavailable to another job unless it is transferred explicitly.

Frontend deployment uses the repository’s installed Wrangler through `pnpm --dir packages/frontend exec wrangler deploy` after Node 24 setup. It does not use the action path that emitted the Node 20 deprecation warning. The Worker configuration stays in `packages/frontend/wrangler.toml`, whose `assets.directory` remains `./dist` relative to that package directory.

After Wrangler succeeds, the workflow waits briefly and requests the public frontend Worker at `https://00sme.cavazzanileonardo.workers.dev/`. The smoke check requires a successful HTTP response containing the application root element. A missing artifact fails before Wrangler; a failed public response causes the frontend deployment job to fail rather than be marked healthy.

Backend deployment remains a separate job. It has its own logs and does not consume or publish the frontend artifact.
