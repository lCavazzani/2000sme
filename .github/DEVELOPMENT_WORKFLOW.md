# Development Promotion Workflow

## Required path

All feature work must first be merged into the official `development` branch. Production changes are promoted only through a pull request whose source branch is the same-repository `development` branch and whose target is `master`.

```text
feature branch → pull request into development → merge and push development → pull request from development into master
```

## Promotion gate

`Require Development Promotion` runs only on pull requests targeting `master`. It rejects a pull request when any of the following conditions is true:

| Condition | Required remediation |
|---|---|
| The source is not the official `development` branch | Merge the feature branch into `development`, then create the promotion pull request from `development`. |
| The promotion pull request does not use the latest pushed `development` commit | Update the pull request to the latest `development` tip. |
| `development` does not include the current `master` tip | Merge or rebase `master` into `development`, resolve and validate the integration, then push `development`. |

## Initial synchronization

Before the first promotion under this policy, reconcile the existing divergence by creating a `master` → `development` pull request. Resolve any conflicts, run the normal verification suite, and merge it into `development`. Do not force-push either protected branch to erase history.

## Repository settings

The workflow reports policy violations, but GitHub blocks merges only when `master` protection or a ruleset requires the **Require development promotion** status check. Configure that setting after the workflow has been promoted to `master`.
