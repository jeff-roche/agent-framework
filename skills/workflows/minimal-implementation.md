---
name: minimal-implementation
description: Make a small, well-understood code or test change with focused validation and review. Use for targeted edits and bounded review feedback when a separate design or test plan would add little value.
license: MIT
metadata:
  author: jeff-roche
  agent-framework-kind: workflow
---

# Minimal Implementation

Make one bounded change without a separate planning phase. Small scope reduces
process, not the evidence needed to show the change works.

## Inputs

- One clear behavior change, test gap, or actionable review finding.
- Repository or assigned worktree, relevant files, and any current check results.

## Required Guidelines

Load `task-conventions`, `workflow-conventions`, `use-repo-conventions`, and
`write-like-a-human`.

## Scope Check

- The intended behavior, edit boundary, and useful check must be clear from
  nearby code and requirements. File count alone does not establish low risk.
- Prefer `implementation` instead when design, new dependencies, compatibility
  changes, or migrations need a plan. Prefer `bug-fix` instead when a reported
  defect still needs its cause established. Use `writing-documents` for docs-only work.

## Stages

Prefer a focused implementation subagent and a separate reviewer under
`workflow-conventions`. Each loads its task and required guidelines. Pass the
scope, worktree, findings, and current check results between stages.

1. **Confirm the edit.** Read repo guidance, the existing diff, target code, and
   nearby tests. State the outcome and how to check it in a few lines. Preserve
   user changes, then run `use-worktrees` before editing or checking. Reuse or
   create a non-primary task worktree; a small change still needs isolation.
2. **Make the change.** Default to `tdd` when the edit needs new behavior evidence.
   Use `implement-code-changes` for a small targeted edit that warrants no new
   tests and is covered by existing checks; state that reason. Other exceptions
   follow `workflow-conventions`. Use `implement-tests` for test-only work. If a
   small docs update is needed, run `write-docs` for that scope.
3. **Validate.** Run `validate-implementation` with the expected behavior and
   current evidence. Reuse valid focused checks and run remaining required checks.
   Do not add a broad test campaign or rerun a valid suite merely for ceremony.
4. **Review and check repo fit.** Run a scoped `review-code-changes`; also run
   `review-docs-changes` for changed docs or user-facing text. Run
   `validate-repo-conventions`, reusing the same current validation evidence.
5. **Close the loop.** Apply in-scope findings through the appropriate edit task
   from stage 2, then rerun affected checks and review the corrections. Summarize
   once when the work is ready or a concrete blocker prevents completion.

## Recovery And Completion

- If scope grows beyond the scope check, stop extending this shortcut. Preserve
  the diff and check results for the more suitable workflow; do not restart work.
- Use `phone-a-friend` for a material unresolved decision or a repeated failure
  with no new evidence. Continue only work independent of that blocker.
- Complete only when the scoped behavior is verified, required checks pass, repo
  checks are conformant, and no blocking or high review finding remains. Correct
  other in-scope findings or record a justified disposition. Label self-review.

## Output

- Briefly report the change, affected files, check results, and review outcome.
- Return a workflow completion state from `task-conventions`; include the next
  action and remaining work when unfinished. Avoid empty plan or risk sections.
- Leave commits, pull requests, and publication to an explicit request.
