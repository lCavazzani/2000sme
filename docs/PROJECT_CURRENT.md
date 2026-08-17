# 2000sme — Current Project Brief

> **Purpose:** This is the human-maintained, current-state briefing for every project agent. It is intentionally short. Read it together with the latest CI release evidence, repository branch, and the relevant project-board ticket before giving project-specific guidance or making a change.
>
> **Last reconciled:** 2026-08-16 MDT against `development` `1f60ffc` and the project board.

## Product and Release Baseline

| Item | Current state |
|---|---|
| Product | An interactive retro portfolio presented as a small desktop operating system. |
| Default theme | **Windows XP** is the default and first-visit/fallback experience. |
| Supported alternate | Windows 98 is an active alternate. |
| Deferred theme | Windows 7 is deferred until explicitly re-approved. |
| Integration branch | `development` is the current integration branch. |
| Production frontend | `https://2000sme.cavazzanileonardo.workers.dev` |
| Production backend | `https://00sbackedn.cavazzanileonardo.workers.dev` |
| Release evidence | The latest successful `Release Evidence` artifact and deployment job summary in GitHub Actions. |

## Current Delivery Focus

The primary delivery goal is a **reliable, accessible, polished OS experience**. Portfolio projects are valuable but should progress incrementally and must not displace desktop-shell, production safety, API reliability, accessibility, or release quality work.

The board’s **🚦 Execution Queue — Unblock First** view is the work-order source of truth. Review ticket status, dependencies, priority, sprint, and execution lane before proposing or starting work.

## Known Production and Release Risks

| Issue | Tracking | Consequence |
|---|---|---|
| Deployed guestbook API origin can fall back to `localhost` | BUG-3 | A public visitor can receive an inappropriate local-device/network permission request. |
| Production D1 guestbook migration is missing | BUG-4 | The public guestbook endpoint returns an unavailable response. |
| Frontend deployment does not receive a built `dist` artifact | BUG-5 | The frontend deploy job fails before Wrangler can publish assets. |
| Cloudflare CI access setup is incomplete | INFRA-7 | Blocks the deployment and production-remediation path. |

Do not claim the frontend or guestbook is healthy until the latest release evidence reports successful frontend and backend smoke checks.

## Agent Verification Contract

Before a project-specific recommendation, design critique, implementation plan, ticket update, or code change, an agent must verify the following.

| Check | Required source | Required response behavior |
|---|---|---|
| Current code | `origin/development` SHA and relevant open/merged pull requests | State the short SHA or identify that verification was not possible. |
| Current release | Latest GitHub Actions deployment result and its release-evidence artifact | Do not infer production state from a merge alone. |
| Current work order | Project board ticket(s), dependencies, sprint, and execution lane | Do not introduce duplicate or blocked work. |
| Current decisions | This brief and the relevant decision or design record | Do not repeat superseded decisions, especially theme defaults. |

Use this verification stamp in the first substantive project response:

```text
Verified against: development <short SHA> · release evidence <run/date or unavailable> · board <timestamp>
Relevant work: <ticket IDs>
Known release risk: <none or ticket ID>
```

If a source cannot be checked, clearly label the response as a **proposal based on unverified state**.

## Update Rules

| Event | Owner | Required update |
|---|---|---|
| Durable product or architecture decision | Decision owner / PM | Update the relevant decision record and this brief if it changes the active baseline. |
| Pull request opened or merged | Developer | Update the board ticket with the PR and merged SHA; include release impact in the PR. |
| Production release succeeds | CI + release owner | CI publishes release evidence; release owner reconciles this brief if the active baseline, known issues, or delivery focus changed. |
| Production incident | PM + developer | Create or update a BUG ticket and add a concise risk row above until verified fixed. |
| Sprint / priority change | PM | Update the board; update this brief only if it changes the project-wide delivery focus. |

## Links

| Resource | Location |
|---|---|
| Source repository | `https://github.com/lCavazzani/2000sme` |
| Project board | `https://app.notion.com/p/77ff65d59e24431aaabede27228d6016` |
| Project hub | `https://app.notion.com/p/3b963e3db70f818cbf6ee310d271cb85` |
| Release-evidence guide | [`release-evidence.md`](release-evidence.md) |
| Historical project handoff | Project shared file: `Retro Portfolio — Project Context Handoff.md` |

## Maintenance Boundary

Keep this document current, concise, and decision-oriented. Do **not** copy the full ticket backlog, raw CI logs, implementation details, or secrets into it. Those belong in the board, GitHub Actions, source code, and secure configuration respectively.
