---
name: create-pull-request
description: Push an authorized task branch and create or update its draft pull request. Use when opening or updating a GitHub pull request or GitLab merge request is explicitly requested.
license: MIT
compatibility: Requires Git, access to the hosting service, and gh, glab, or repository-provided PR tooling.
metadata:
  author: jeff-roche
  agent-framework-kind: task
---

# Create Pull Request

Publish the intended commit range with an accurate description and validation
record. Reuse an existing request for the same change rather than duplicating it.

## Inputs

- Explicit request to open or update a PR, selected task worktree, and commit range.
- Source repository and branch, target repository and base branch, and issue context.
- Current validation and review results, and any draft title or description.

## Required Guidelines

Load `task-conventions`, `use-repo-conventions`, `branch-conventions`,
`pull-request-conventions`, and `write-like-a-human`.

## Procedure

1. Confirm the non-primary task worktree, branch, remotes, tracking state, and
   full comparison against the intended base. Inspect every included commit and
   the full diff. Do not omit uncommitted task changes from a supposedly complete PR.
2. Confirm hosting access and the repository template. Use `gh` for GitHub, `glab`
   for GitLab, or the repo's wrapper. Determine the push remote explicitly; when
   using a fork, distinguish the fork's head branch from the upstream base.
3. Check for an existing PR with the same head repository, branch, and base.
   Prepare its title and body using `pull-request-conventions`, including actual
   checks, known limits, and breaking changes. Resolve conflicting PR identity
   before publishing rather than updating an unrelated request. Reuse an open PR.
   A merged PR covering the intended commits is already complete. For a closed,
   unmerged PR, resolve whether reopening or replacement is requested first. If a
   merged PR does not cover new intended commits, prepare a new request for that
   new scope only when publication is authorized; do not edit the merged request.
4. Push only when the request authorizes publishing the intended commits; a
   title/body-only update must not push code. Use a normal push. If the remote
   has diverged or the push is rejected, return the blocker; do not force-push or
   silently change the source or target branch.
5. Create a draft PR when none exists, unless the user explicitly requested a
   ready PR. Otherwise update the matching open request's description and title
   as needed, preserving its review state. Reopen a closed request only when that
   action was explicitly requested. Do not merge or change reviewers, labels,
   base branch, or draft state without a request authorizing those changes.
6. Read back the request. Verify its URL, head commit, base, title, body, and open,
   closed, merged, or draft state as applicable. For a text-only update, verify
   against the existing remote head, not unpublished local commits. Report remote
   CI results separately from checks run in the worktree;
   queued or running CI is pending, not passed.

## Output

- Return the PR URL, source and base branches, head commit, and review state.
- State whether the request was created, updated, or already current, with check
  results and any pending CI or reviewer action.
- If publishing fails after a push, report the pushed branch and exact retry step.
