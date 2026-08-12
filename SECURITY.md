# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please **do not open a public GitHub issue**.

Report it privately via one of these channels:

- **GitHub private advisory**: [Security → Report a vulnerability](https://github.com/lCavazzani/2000sme/security/advisories/new)
- **Email**: cavazzanileonardo@gmail.com  — include `[SECURITY]` in the subject line

Please include:
- A description of the vulnerability and its potential impact
- Steps to reproduce or a proof-of-concept
- Any suggested remediation if you have one

You will receive an acknowledgement within **48 hours** and a resolution timeline within **7 days**.

---

## Approved Configuration Locations

Secrets and configuration must be stored in the following locations depending on context.
**Never hardcode credentials in source files, commit `.env` or `.dev.vars`, or log secrets.**

| Context | What goes there | Where |
|---|---|---|
| CI / CD | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | GitHub repo → Settings → Secrets and variables → Actions |
| Worker runtime | Sensitive env vars your Worker reads | `wrangler secret put <NAME>` (stored in Cloudflare, never in files) |
| Local development | Local-only secrets for `wrangler dev` | `packages/backend/.dev.vars` (gitignored — copy from `.dev.vars.example`) |
| Frontend public config | `VITE_*` variables safe to expose in the browser bundle | `packages/frontend/.env` (gitignored) — only put values here that are **intentionally public** |
| Documentation of required vars | Template showing which vars are needed, with no real values | `.dev.vars.example` / `.env.example` files (committed, values are placeholders) |

### `VITE_` variables

Vite inlines any `VITE_*` variable directly into the compiled frontend bundle. Anyone who downloads the site can read them. Only put values here that you are comfortable being fully public (e.g. a public API base URL). Never put tokens, keys, or any secret under a `VITE_` prefix.

### Cloudflare D1 and KV resource IDs

The D1 database ID and KV namespace ID in `wrangler.jsonc` are resource identifiers, not credentials. They are safe to commit. Access to the actual data requires a valid Cloudflare API token with the appropriate permissions.

---

## Dependency Updates

Dependencies are not automatically updated. Run `pnpm audit` periodically and update packages with known CVEs promptly.
