# Pre-Launch Security Review

## Purpose

This checklist is the repository-owned evidence record for **SEC-9 — Pre-Launch Security Review & Secret Rotation Drill**. It supplements, but never replaces, the reviewed production-promotion gate. It must not contain secret values, token identifiers, request bodies with personal data, or raw provider logs.

## Verified baseline

| Scope | Evidence | Result |
|---|---|---|
| Development candidate | `da41a75` with [Deploy Development #32918518479](https://github.com/lCavazzani/2000sme/actions/runs/32918518479) | Successful development build, deploy, smoke, and release evidence for the current final SIGNAL.EXE candidate. |
| Production comparison | `master` `97b77ef` with [Deploy #32542563571](https://github.com/lCavazzani/2000sme/actions/runs/32542563571) | Successful prior production release; intentionally behind the current PixelOS development candidate. |
| Public frontend | `https://2000sme.cavazzanileonardo.workers.dev` | Returned `200` with report-only CSP, permissions policy, referrer policy, MIME protection, and frame denial on 2026-08-25 UTC. |
| Public backend | `https://00sbackedn.cavazzanileonardo.workers.dev` | `/api/health` returned `200`; approved frontend origin received CORS approval and an untrusted origin did not. |
| Retired guestbook | `/api/guestbook` | Returned a sanitized `410 guestbook_retired` response with no-store caching. |
| Project-catalog failure | `/api/projects/__sec9_missing__` | Returned a sanitized `500 service_unavailable` response; no raw D1, SQLite, binding, or stack information appeared. |

> The production observations above describe the older production baseline only. They are not evidence that the PixelOS development candidate has reached production.

## Regression contract

`pnpm --filter backend test:security` now includes `prelaunch-security-review.test.ts` alongside the established security-header and retired-guestbook tests. The SEC-9 regression locks the following code-level guarantees:

- CORS permits only explicitly configured frontend origins and local development, rejects untrusted origins, and keeps preflight to `GET`, `POST`, `OPTIONS`, and `Content-Type`. The separate INFRA-11 preflight adds the inactive canonical root origin without a wildcard policy.
- The retired guestbook remains a stable, sanitized `410` response.
- A failed public project-catalog lookup returns the generic `service_unavailable` envelope without raw storage or runtime diagnostics.
- Existing header tests retain report-only CSP, anti-framing, MIME, referrer, permissions, and Turnstile-source policy coverage.

## GitHub security tooling review

The repository API check on 2026-08-25 UTC found that Dependabot alerts are **disabled**. Secret Scanning and Code Scanning alert endpoints returned `403 Resource not accessible by integration`, so this automation could not verify their alert state. Before public promotion, the release owner must inspect the repository’s GitHub Security tab with an account that has the required permissions, enable the intended services where available, and record any alerts or accepted risk on SEC-9/INFRA-11. Do not infer a clean alert state from unavailable APIs.

## Owner-only credential rotation drill

Secret values must never be committed, pasted into tickets, copied into agent messages, or printed in CI logs. The release owner should perform the drill in an existing non-production environment through the approved provider interfaces:

1. Identify one existing, non-production test credential that is not a production deploy token and whose consumers are documented.
2. Create its replacement value directly in the owning provider, update only the existing approved non-production secret reference, and retain no value outside that provider.
3. Run the documented development validation path; confirm the expected dependent check works.
4. Revoke the old test value, rerun the validation path, and record only the date, owner, environment, affected integration, and success/failure outcome in SEC-9.
5. Restore or investigate only through owner-approved provider controls if the drill fails. Never alter production token scope, Cloudflare resources, DNS, or source code as part of this drill without separate approval.

## Release-owner exit checklist

- [ ] Review GitHub Secret Scanning, Dependabot, Code Scanning, and Actions alerts with suitable repository permissions; document findings.
- [ ] Verify the existing Cloudflare deployment token has least privilege through the owner-controlled provider interface; do not expose token metadata or values here.
- [ ] Complete and record the non-production rotation drill using the procedure above.
- [ ] Run `pnpm --filter backend test:security` and the full quality gate on the proposed production candidate.
- [ ] Complete the separate production-promotion and smoke-validation ticket before merging a promotion pull request to `master`.

## Current accepted risk

CSP intentionally remains **report-only**. Enforcement is a separate rollout decision because it may block legitimate resources; any change must be explicitly reviewed with an updated regression expectation. The production baseline also predates the approved PixelOS development candidate, so production must be validated again after a reviewed promotion rather than treating this review as a release.
