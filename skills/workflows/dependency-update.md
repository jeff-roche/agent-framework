---
name: dependency-update
description: Update scoped dependencies and lockfiles with compatibility checks, needed migrations, tests, and review. Use for planned package upgrades; prefer bug-fix when responding to a reported CVE or regression.
license: MIT
metadata:
  author: jeff-roche
  agent-framework-kind: workflow
---

# Dependency Update

Upgrade the requested dependency set while preserving supported behavior. Resolve
actual installed versions and downstream effects rather than editing version text alone.

## Inputs

- Packages or dependency group to update, target versions or constraints, and purpose.
- Package manager, supported runtimes/platforms, affected projects, and existing check evidence.

## Required Guidelines

Load `task-conventions`, `workflow-conventions`, `use-repo-conventions`,
`test-conventions`, and `write-like-a-human`.

## Execution

- Prefer focused planning, implementation, validation, and review subagents under
  `workflow-conventions`. Each loads its task and required guidelines before work.
- Keep a record of requested and resolved versions, affected consumers, migration
  decisions, worktree, and current evidence. Avoid unrelated dependency refreshes.

## Stages

1. **Select the workspace.** Read the request and repo guidance. Run `use-worktrees`
   to select a non-primary task worktree before dependency installation or edits.
   Inspect manifest, lockfile, runtime, package-manager version, and workspace layout.
2. **Assess the upgrade.** Establish current resolved versions and the intended
   target range. Read relevant release notes and migration guidance. Check supported
   runtimes, peer dependencies, affected APIs, transitive changes, and known breaking
   behavior. Use `phone-a-friend` for a material version or compatibility decision.
3. **Plan the change and checks.** Run `plan-code-changes` for manifest, lockfile,
   consumer, and migration changes. Run `create-test-plan` for affected behavior
   and integrations. Reuse current baseline checks; document unrelated failures.
4. **Apply the scoped upgrade.** Use `tdd` for consumer code changes and migrations
   whenever meaningful tests can demonstrate the new contract first. Use
   `implement-code-changes` for package/lockfile operations without a useful failing
   behavior test, or other justified exceptions under `workflow-conventions`.
   Regenerate lockfiles through repo package-manager commands; do not hand-edit
   generated resolution data or duplicate completed implementation work.
5. **Inspect the resolved change.** Verify actual installed versions and explain
   material lockfile churn. Retain related transitive changes required by the
   solver; remove unrelated upgrades through scoped package-manager operations.
   For remaining test-only gaps, run `implement-tests`.
6. **Update guidance.** Run `write-docs` when supported versions, setup commands,
   configuration, or migration steps changed. Describe the actual resolved upgrade.
7. **Validate reproducibility and behavior.** Use the repo's clean/frozen/locked
   install mode when available, within the task worktree or an isolated test setup.
   Run `validate-implementation` with the test plan, installed versions, and current
   evidence. Verify builds and affected runtime/integration paths, not just install
   success. Confirm validation did not silently alter the intended lockfile.
8. **Review and check repo fit.** Run `review-code-changes` for the entire update
   and `review-docs-changes` for affected docs. Run `validate-repo-conventions` with
   current evidence, including lockfile and package-manager requirements.

## Recovery And Completion

- Route scoped consumer fixes through the implementation task, test gaps through
  `implement-tests`, and doc corrections through `write-docs`. Refresh affected
  validation and review after edits.
- If the upgrade requires an unplanned runtime change, migration, or wider package
  update, revise the plan and resolve the scope decision. Do not mask incompatible
  peer requirements or failed checks merely to finish installation.
- Complete only when intended versions resolve reproducibly, supported behavior
  is verified, required checks pass, repo fit is conformant, and no blocking/high
  finding remains. Address other in-scope findings or record their disposition.

## Output

- Report before/after resolved versions, changed manifests and lockfiles, consumer
  migrations, material transitive changes, and validation/review results.
- Return the task worktree and completion state from `task-conventions`. Include
  compatibility limits or the exact next action when unfinished; label self-review.
- Leave commits, publication, and deployment to an explicit request.
