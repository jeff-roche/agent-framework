---
name: implementation
description: Deliver a multi-step feature or refactor through planning, implementation, validation, and review. Use when code changes need design or coordinated edits; prefer bug-fix for reported defects and minimal-implementation for small, well-understood changes.
license: MIT
metadata:
  author: jeff-roche
  agent-framework-kind: workflow
---

# Implementation

Turn an agreed outcome into a tested, reviewed change. Keep planning proportional
to the work and implement one coherent slice at a time.

## Inputs

- Requested outcome, scope, constraints, and any acceptance criteria or issue.
- Repository or assigned worktree, plus any existing plan, test plan, or task results.

## Required Guidelines

Load `task-conventions`, `workflow-conventions`, `use-repo-conventions`, and
`write-like-a-human`.

## Execution

- Prefer a focused subagent for each stage using `workflow-conventions`. Ensure
  it loads the named task and required guidelines in its own context.
- Pass scope, worktree, acceptance criteria, artifacts, and current check results
  between stages. Reuse valid prior work rather than restarting it.
- A task's completion state is separate from its findings or validation outcome.
  Keep stage reports as working context; give the user one final summary.

## Stages

1. **Set the scope.** Read the request and repo guidance. Establish observable
   acceptance criteria, relevant constraints, and explicit exclusions where needed.
   Inspect existing changes. Use `phone-a-friend` for a decision that evidence
   cannot resolve and that materially affects the outcome.
2. **Select the workspace.** Run `use-worktrees` before planning artifacts,
   edits, setup, or checks. Reuse the assigned non-primary task worktree, or create
   one. Pass its path and any copied baseline to every later stage.
3. **Plan the change.** Run `plan-code-changes` with the outcome and repo context.
   Resolve blocking decisions before edits. Proceed without a separate approval
   round unless the user or repo requires one.
4. **Plan the evidence.** Run `create-test-plan` against the acceptance criteria
   and implementation plan. Reuse existing coverage and identify manual checks.
5. **Implement test-first.** Assign `tdd` to an implementation subagent once per
   selected behavior. The workflow owns repetition and verifies red/green evidence.
   Use `implement-code-changes` only for the justified small-edit or test-feasibility
   exceptions in `workflow-conventions`, or an explicit alternative test approach.
6. **Update documentation.** If behavior, interfaces, configuration, or migration
   steps need documentation, run `write-docs` with the implemented behavior and
   check evidence. Keep documentation claims aligned with the actual change.
7. **Validate.** Run `validate-implementation` with the final criteria, diff, test
   plan, and prior check results. Repair failed checks before requesting final
   review; reuse current results and rerun only affected or missing checks.
8. **Review.** Prefer a separate reviewer subagent for `review-code-changes` on
   the full task change. Run `review-docs-changes` when documentation or
   user-facing text changed. Reviews
   return findings; apply corrections in the appropriate edit task below.
9. **Check repo fit.** Run `validate-repo-conventions`, reusing current validation
   and review evidence. Resolve mandatory violations before handoff.

## Recovery And Completion

- Route code corrections back to the selected implementation task, test-only
  gaps to `implement-tests`, and documentation corrections to `write-docs`.
  Revalidate affected behavior and re-review corrected material after edits.
- If a finding changes the design or scope, revise the affected plan first. If
  the same failure recurs without new evidence, use `phone-a-friend` rather than
  repeating the same attempt. Continue independent work while a stage is blocked.
- Complete only when acceptance criteria hold, required validation has passed,
  repo checks are conformant, and no blocking or high review finding remains.
  Correct other in-scope findings or record a justified disposition; do not defer
  required behavior. Label a self-review honestly.

## Output

- Summarize the delivered behavior, changed files, and relevant worktree or branch.
- Give check results and review dispositions, including any reused evidence.
- Return a workflow completion state from `task-conventions`. For unfinished work,
  include the last completed stage, remaining criteria, and exact next action.
- Leave commits, pull requests, and publication to an explicitly requested stage.
