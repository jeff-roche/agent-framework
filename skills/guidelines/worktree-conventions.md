---
name: worktree-conventions
description: Rules for keeping repository work in task worktrees rather than the primary worktree. Use before implementation, testing, documentation, review, or change preparation, including small tasks.
license: MIT
metadata:
  author: jeff-roche
  agent-framework-kind: guideline
---

# Worktree Conventions

Prefer a dedicated task worktree for repository work, including small edits and
reviews. Keep the primary worktree as the stable reference checkout. Follow
repository tooling and workspace-manager rules when they exist.

## Rules

- Inspect existing worktrees, branches, remotes, and working-tree status before
  creating another worktree. Do not duplicate active work or reuse a branch
  checked out elsewhere.
- Identify the primary worktree from Git's worktree metadata, not its branch
  name. Reuse or create a non-primary task worktree before edits, setup, or checks.
  Initial inspection may read the primary worktree to establish scope and state.
- Do not skip isolation just because the task is small or the primary worktree
  is clean. If isolation is unavailable, report the constraint; use the primary
  worktree only with an explicit user exception.
- Use the repository's worktree command or workspace manager when it provides
  one. Otherwise use `git worktree` rather than copying the repository.
- Load `branch-conventions` to select the base and task branch name. Honor an
  explicit task base, including a release or prerequisite feature branch.
- Give the worktree a descriptive directory name derived from its task branch;
  replace branch-name slashes with hyphens when using a single directory name.
- Place worktrees in the repository's prescribed location. If none exists, put
  them in `.worktrees/` at the repository root. Verify that location is ignored
  before creating a worktree; use the local Git exclude file when needed.
- Reuse a non-primary worktree assigned to the task, including one with unfinished
  task changes. Inspect and preserve those changes; do not require a clean tree
  merely to resume work.
- If needed changes exist only in the primary worktree, preserve the originals
  and transfer a scoped snapshot of source changes into the task worktree. Record
  the source revision and copied paths; include required untracked source files.
  Do not silently substitute committed HEAD for the requested working-tree state.
- Keep generated files, editor settings, credentials, and environment-specific
  configuration out of version control. Recreate local setup through documented
  commands rather than copying opaque state.
- Install dependencies and initialize required tooling inside the new worktree
  when the assigned work requires it. Source-only review can skip execution
  setup. Verify the worktree is on the intended branch before editing.
- Treat every worktree as independent: run commands in the intended directory,
  inspect its status before commits, and never use it to clean up another
  worktree's changes.
- Keep the worktree on its task branch. Do not switch it to a shared branch for
  convenience.
- Remove a worktree only after its branch is merged, explicitly abandoned, or
  no longer needed. Confirm it is clean first; never force-remove a worktree
  containing uncommitted work.

## Final Checks

- Verify the worktree path, branch, base branch, and setup state.
- Leave the worktree intact unless the user asks for cleanup.
