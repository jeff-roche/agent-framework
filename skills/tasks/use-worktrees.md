---
name: use-worktrees
description: Create or select a non-primary Git worktree for a task. Use before repository edits, tests, documentation, reviews, or change preparation, even for small tasks.
license: MIT
compatibility: Requires Git with worktree support and local filesystem access; use the repository workspace manager when required.
metadata:
  author: jeff-roche
  agent-framework-kind: task
---

# Use Worktrees

Create or select a non-primary worktree for one task. Preserve unfinished changes
when resuming an existing task worktree; avoid doing work in the primary checkout.

## Inputs

- Repository path, task identity, and any assigned worktree, branch, or base.
- For review, the exact source revision or working-tree snapshot and comparison base.
- Intended activities: source-only review, executable checks, or editing.
- Repository setup requirements and any existing setup results.

## Required Guidelines

Load `task-conventions`, `use-repo-conventions`, `branch-conventions`, and
`worktree-conventions`.

## Procedure

1. Inspect worktrees, branches, repository guidance, and current status. Identify
   the primary worktree from Git metadata. Do not create a duplicate task worktree
   or check out a branch already in use elsewhere.
2. Determine the intended base and task branch using `branch-conventions`.
   Verify the base revision and whether it is current enough for the task.
3. Select an existing non-primary worktree on the intended task branch when it
   provides isolation. Inspect and preserve dirty task files. A clean primary
   worktree is not a substitute. Ask when unclear ownership blocks safe selection.
4. Otherwise create a worktree using the tooling and location rules in
   `worktree-conventions`. Use an existing task branch when resuming work, or
   create a new task branch from the intended base.
5. Verify the selected path and branch. If the task depends on uncommitted work
   in the primary checkout, transfer only the needed source changes using
   `worktree-conventions`. Record the copied baseline and preserve the originals.
   For review, reproduce the requested source state and retain its comparison base.
   Do not move, discard, or stash another worktree's changes to make setup easier.
6. Run only missing setup required by the assigned activities, such as dependency
   installation for executable checks. Source-only review does not need build or
   dependency setup. Do not copy untracked local configuration, credentials, or
   build output from another worktree.
7. Verify the path, branch, base, status, and tooling needed for the assigned
   activities. State any deferred setup; do not call the worktree test-ready if
   its required test setup was skipped.

## Output

- Provide the ready worktree path, branch, base branch, clean/dirty status, and
  setup commands run. Include any copied source state and its original location.
- Confirm the worktree is non-primary, or state the explicit user exception.
- If setup is blocked, report the exact missing command, access, or dependency.
