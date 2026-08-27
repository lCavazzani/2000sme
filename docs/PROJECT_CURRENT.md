# 2000sme — Current Project Brief

> **Purpose:** This is the human-maintained, current-state briefing for every project agent. Read it with the latest CI release evidence, `development` branch, and relevant project-board ticket before providing project-specific guidance or making a change.
>
> **Last reconciled:** 2026-08-27 MDT against the TEST-22 canonical-release configuration candidate. Live root verification remains pending; do not infer it from a successful Worker deployment alone.

## Product and Release Baseline

| Item | Current state |
|---|---|
| Product | **PixelOS**: an interactive, single-design pixel-art desktop portfolio/application environment. |
| Canonical reference | Owner-supplied `leo-windows` project, including its supplied raster assets, application layout, pixel chrome, scanline/vignette treatment, and bounded bob/blink effects. |
| Active visual target | **PixelOS only.** Windows XP, Windows 98, and Windows 7 are no longer active product directions. Completed legacy work remains historical until migration replaces it. |
| Retained OS capability | Existing window lifecycle, desktop, taskbar, Start menu, registry, direct routes, responsive launcher, accessibility, and test foundations are retained and adapted rather than reimplemented. |
| Retained applications | Resume/WordPad and My Computer, rebuilt as PixelOS Resume and **My Machine**. |
| PixelOS applications to add | Pixel Gallery, Mittens/Desktop Pet, Minesweeper, About PixelOS, and README.TXT Notepad. |
| Applications to retire | Visitor Scrapbook/Guestbook, Contact, Control Panel, and My Portfolio. |
| Integration branch | `development` is the current integration branch. |
| Production frontend | Canonical target: `https://lcavazzani.com` — deployed only from `master`; retain `https://2000sme.cavazzanileonardo.workers.dev` as a technical fallback until TEST-22 verifies the canonical root. |
| Production backend | `https://00sbackedn.cavazzanileonardo.workers.dev` — deployed only from `master`. |
| Development frontend | `https://2000sme-development.cavazzanileonardo.workers.dev` — deployed from `development`; use for integration review, never as production evidence. |
| Development backend | `https://00sbackedn-development.cavazzanileonardo.workers.dev` — isolated D1/KV bindings; used only by the development frontend. |
| Release evidence | The latest successful `Release Evidence` artifact and deployment job summary in GitHub Actions prove production. |
| Development evidence | The latest successful `development-evidence` artifact proves the `development` review deployment only. |

## Current Delivery Focus

The delivery goal is a **reference-faithful, accessible PixelOS built on the retained OS foundation**. Sprint 6 is PixelOS Core: import supplied assets, rebuild desktop/window/taskbar/Start chrome, retire legacy app surfaces, redesign My Machine, reproduce reference effects safely, retire the public guestbook, and add the core regression gate. Sprint 7 delivers the new PixelOS applications. Sprint 8 validates PixelOS and keeps portfolio-data infrastructure deferred.

The board’s **🚦 Execution Queue — Unblock First** view remains the work-order source of truth. Review ticket status, dependencies, priority, sprint, and execution lane before proposing or starting work. The controlled pivot record is `PixelOS-Pivot-Scope.md` in the repository work branch until merged.

## Known Production and Release Risks

| Issue | Tracking | Consequence |
|---|---|---|
| Canonical root is pending live verification | TEST-22 | Do not present `https://lcavazzani.com` as recruiter-facing until it serves the selected production Worker and passes canonical HTTPS, redirect, route, CORS, asset, and mobile/reduced-effects checks. |
| Production release evidence must be read with the canonical smoke result | TEST-22 | A successful Worker deployment alone does not prove the custom-domain path is reachable. |

Do not claim PixelOS is deployed, or the legacy guestbook is retired, until the relevant board work is Done and a subsequent release-evidence artifact proves the production deployment.

## Agent Verification Contract

Before a project-specific recommendation, design critique, implementation plan, ticket update, or code change, an agent must verify the following.

| Check | Required source | Required response behavior |
|---|---|---|
| Current code | `origin/development` SHA and relevant open/merged pull requests | State the short SHA or identify that verification was not possible. |
| Current release | Latest GitHub Actions deployment result and its release-evidence artifact | Do not infer production state from a merge alone. |
| Current work order | Project board ticket(s), dependencies, sprint, and execution lane | Do not introduce duplicate or blocked work. |
| Current decisions | This brief and the relevant decision or design record | Do not repeat superseded XP/Windows 98/7 or optional-Pixel-preview decisions. |

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
| Durable product or architecture decision | Decision owner / PM | Update the decision record and this brief if it changes the active baseline. |
| Pull request opened or merged | Developer | Update the board ticket with the PR and merged SHA; include release impact in the PR. |
| Development deployment succeeds | CI | CI publishes development evidence. Use it for integration review, not as a production claim. |
| Production release succeeds | CI + release owner | CI publishes release evidence; release owner reconciles this brief if the active baseline, known issues, or delivery focus changed. |
| Production incident | PM + developer | Create or update a BUG ticket and add a concise risk row above until verified fixed or deliberately retired. |
| Sprint / priority change | PM | Update the board; update this brief only if it changes the project-wide delivery focus. |

## Links

| Resource | Location |
|---|---|
| Source repository | `https://github.com/lCavazzani/2000sme` |
| Project board | `https://app.notion.com/p/77ff65d59e24431aaabede27228d6016` |
| Release-evidence guide | [`release-evidence.md`](release-evidence.md) |
| Development environment guide | [`development-environment.md`](development-environment.md) |
| PixelOS pivot record | `PixelOS-Pivot-Scope.md` (in the pivot branch until merged) |
| Historical project handoff | Project shared file: `Retro Portfolio — Project Context Handoff.md` |

## Maintenance Boundary

Keep this document current, concise, and decision-oriented. Do **not** copy the full ticket backlog, raw CI logs, implementation details, user-provided binary assets, or secrets into it. Those belong in the board, GitHub Actions, source code, and secure configuration respectively.
