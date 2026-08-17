# Release Evidence

## Purpose

A merge confirms code integration; it does **not** confirm a healthy deployed release. This project publishes a machine-readable and human-readable release-evidence bundle after a deployment workflow succeeds. Agents must use it to distinguish source state from production state.

## What CI Publishes

After the quality, backend deployment, and frontend deployment jobs succeed, the deployment workflow creates a **Release Evidence** artifact containing:

| File | Purpose |
|---|---|
| `release-manifest.json` | Machine-readable record of commit, branch, run, workflow, deployment URLs, timestamp, and status. |
| `release-summary.md` | Human-readable summary for PM, design, QA, and development agents. |

The same summary is appended to the workflow run summary so it can be reviewed without downloading the artifact.

## Evidence Contract

A successful evidence bundle means only the following:

- The quality job passed for the recorded commit.
- The backend and frontend deployment jobs completed successfully.
- The recorded branch, commit SHA, run URL, and configured public endpoints are traceable.

It does **not** replace functional smoke checks. If an endpoint is intentionally unavailable, a known production incident exists, or a release needs deeper validation, record that on the relevant board ticket and in `PROJECT_CURRENT.md`.

## Required Agent Preflight

Before giving project-specific advice or changing project work, agents must read `PROJECT_CURRENT.md` and inspect the latest release evidence for the relevant branch/environment.

| Agent role | Required preflight |
|---|---|
| Developer | Compare local branch/commit to `development`; inspect the latest deploy result before claiming production impact. |
| PM | Inspect release evidence, project board execution queue, dependencies, and known release risks before prioritizing or closing work. |
| Designer | Inspect the current brief, deployed/review environment, release state, and corresponding design ticket before offering implementation feedback. |
| QA/reviewer | Inspect acceptance criteria, release evidence, deployed environment, and linked ticket before passing a release gate. |

If release evidence is unavailable, state that production verification is unavailable rather than assuming a merged pull request is live.

## How to Retrieve the Latest Evidence

Use the GitHub Actions run associated with the target branch. The workflow run summary contains the concise evidence. Download the **release-evidence** artifact if the structured files are needed.

```bash
# List the latest deploy run for development or master.
gh run list --workflow deploy.yml --branch <branch> --limit 1

# Download the evidence artifact from a specific successful run.
gh run download <run-id> --name release-evidence --dir .release-evidence

# Read the resulting evidence.
cat .release-evidence/release-summary.md
cat .release-evidence/release-manifest.json
```

The repository’s GitHub Actions page also exposes the run summary and artifact download.

## Release Owner Checklist

| Step | Evidence required |
|---|---|
| Before deployment | Relevant board ticket has PR link, target branch, acceptance criteria, and validation plan. |
| After deployment | Review the release summary and artifact; verify the intended environment and recorded commit. |
| After functional validation | Attach or link validation evidence on the relevant board ticket. |
| If production state or priorities changed | Reconcile `PROJECT_CURRENT.md`; do not rewrite it for routine implementation detail. |
| On incident | Create or update a BUG ticket and add the concise active risk to `PROJECT_CURRENT.md`. |

## Security Rules

The evidence bundle must never include secrets, request bodies containing personal data, Cloudflare credentials, environment values, or raw application logs. It stores only non-sensitive release metadata and public URLs.
