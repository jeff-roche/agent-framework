---
name: branch-conventions
description: Rules for creating and maintaining Git branches. Use for any work that creates, switches, rebases, merges, or deletes a branch.
license: MIT
metadata:
  author: jeff-roche
  agent-framework-kind: guideline
---

# Branch Conventions

Treat a branch as one reviewable unit of work. Follow repository branch rules
when they exist; these rules provide the default everywhere else.

## Rules

- Use the base branch specified by the task, including a release branch or a
  prerequisite feature branch. Otherwise identify the current integration
  branch from repository guidance and remotes; do not assume it is `main`.
- Inspect the working tree before switching branches. Do not carry unrelated,
  uncommitted changes into a new branch.
- Give each branch one purpose. Split unrelated fixes, refactors, and features
  into separate branches.
- Use the repository's required branch format. If none exists, use
  `<type>/<short-kebab-case-summary>`, where `<type>` is `feature`, `fix`,
  `docs`, `refactor`, `test`, or `chore`.
- Make the name describe the intended outcome, not an implementation detail or
  a ticket number alone. Add an issue identifier only when the repository uses
  one.
- Do not commit directly to protected or shared integration branches.
- Rebase or merge from the intended base branch only when necessary, and resolve
  conflicts deliberately. Run the relevant checks after resolving conflicts.
- Do not force-push a branch that others may use. Never force-push a shared or
  protected branch.
- Do not delete a branch until its change is merged or explicitly abandoned.
  Confirm that it has no unmerged, useful work first.
- When working through a fork, push the task branch to the user's fork. Confirm
  the destination remote before pushing.

## Final Checks

- Confirm the branch contains only the intended changes.
- Verify the branch name, base branch, and push state for the task result.
