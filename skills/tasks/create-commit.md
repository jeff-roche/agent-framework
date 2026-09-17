---
name: create-commit
description: Create one scoped Git commit from an authorized, validated change. Use when the user or calling workflow explicitly requests a commit; do not push or open a pull request.
license: MIT
compatibility: Requires Git and the repository's configured commit tooling.
metadata:
  author: jeff-roche
  agent-framework-kind: task
---

# Create Commit

Record one coherent change without including unrelated work or rewriting history.

## Inputs

- Explicit request to commit, intended change scope, and selected task worktree.
- Current validation results, commit conventions, and any requested issue reference.

## Required Guidelines

Load `task-conventions`, `use-repo-conventions`, `branch-conventions`,
`commit-conventions`, and `write-like-a-human`.

## Procedure

1. Confirm the selected non-primary worktree and task branch. Inspect `git status`,
   `git diff`, `git diff --cached`, and `git log --oneline -10`. Establish which
   edits belong to the requested commit, including any copied source baseline.
2. Verify that validation evidence applies to the content being committed. Return
   missing or failed required checks to the caller before creating the commit.
3. Stage only the intended files or hunks. Preserve unrelated staged changes;
   use an isolated index when needed, or report the blocker. Inspect the exact
   proposed commit diff, including untracked files, before committing. If no
   intended changes remain, return a no-op before invoking commit hooks.
4. Write an outcome-focused subject and any needed body and trailers using
   `commit-conventions`. Use supplied attribution identities rather than guessing.
5. Create the commit with normal repository hooks. Do not bypass hooks, create
   an empty commit, or amend an existing commit. If a hook fails, report its
   output and any files it changed so the caller can repair and revalidate them.
6. Inspect the new commit and working-tree status. Confirm its content matches
   the intended scope and account for any hook-generated changes. If no intended
   edits remain, report the task change as committed.

## Output

- Return the commit ID, subject, files or behavior included, and validation evidence.
- State whether it was a new commit or a no-op, and identify any remaining task edits.
- On failure, report the failed hook or command and the next action. Do not push.
