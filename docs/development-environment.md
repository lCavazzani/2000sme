# PixelOS Development Environment

## Purpose

PixelOS has two independently deployed Cloudflare Workers environments. The **development environment** makes the current `development` branch reviewable without changing the public production release. The **production environment** remains the only public-release baseline.

| Environment | Source branch | Frontend | Backend | Data |
|---|---|---|---|---|
| Production | `master` | `https://2000sme.cavazzanileonardo.workers.dev` | `https://00sbackedn.cavazzanileonardo.workers.dev` | `portfolio-db` and `RATE_LIMIT` |
| Development | `development` | `https://2000sme-development.cavazzanileonardo.workers.dev` | `https://00sbackedn-development.cavazzanileonardo.workers.dev` | `portfolio-db-development` and `RATE_LIMIT_DEVELOPMENT` |

## Delivery Flow

A developer opens a feature pull request against `development`. After review and merge, the **Deploy Development** workflow validates quality, applies D1 migrations to the isolated development database, deploys both development Workers, runs smoke checks against the development URLs, and publishes a `development-evidence` artifact.

A promotion to `master` continues to run the existing **Deploy** workflow. That workflow deploys only the production Workers and publishes the production `release-evidence` artifact. A development deployment must never be presented as production proof.

## Developer Notes

The production frontend Worker is named `2000sme`. The development frontend Worker is created through the Wrangler `development` environment and is named `2000sme-development`. The corresponding backend Worker is `00sbackedn-development`.

The backend Wrangler configuration declares all development bindings explicitly. Do not replace those IDs with production IDs or add a fallback to production resources. The development frontend is built with the development backend’s public URL; local Vite development continues to use the local proxy and does not use the deployed development Worker by default.

Development environment evidence is intentionally retained for 30 days. Production release evidence is retained for 90 days.

## Release Verification

Before reporting a review result, identify the environment and check the appropriate evidence artifact.

```text
Development review: development <short SHA> · development evidence <run/date>
Production release: master <short SHA> · release evidence <run/date>
```

Use the project board and `docs/PROJECT_CURRENT.md` in either case. Only the production evidence can update the public release baseline.
