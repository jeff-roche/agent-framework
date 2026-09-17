---
name: implement-code-changes
description: Implement a scoped code change when TDD is unsuitable or explicitly not selected. Use for small targeted edits needing no new tests, changes without a useful automated failing test, or an explicit alternative to test-first work.
license: MIT
metadata:
  author: jeff-roche
  agent-framework-kind: task
---

# Implement Code Changes

Deliver the smallest working change for the assigned scope. Prefer `tdd` when a
meaningful failing test can be written first. Use this task for a justified
exception or an explicitly requested alternative, and record the reason.

## Inputs

- Requested behavior and acceptance criteria, or a scoped implementation plan.
- Assigned worktree and any triage record, review findings, or test plan.

## Required Guidelines

Load `task-conventions`, `use-repo-conventions`, and `test-conventions`.

## Procedure

1. Confirm the assigned scope and inspect the current diff. Preserve existing
   task work and unrelated user changes.
2. Read relevant code, callers, interfaces, and tests. Check that any supplied
   plan still matches the repository; return a blocker if a required decision
   would materially change behavior or scope.
3. Implement the smallest coherent change using established patterns. Include
   required error handling and compatibility or migration work within the scope.
4. Add or update tests when changed behavior needs new evidence. Use an existing
   test plan when available. A small targeted edit already covered by useful
   checks needs no duplicate tests; automated defects still need regression coverage.
5. Run focused checks after meaningful changes and relevant broader checks
   before returning. Diagnose failures; fix issues caused by this work without
   hiding pre-existing failures or broadening the task to unrelated repairs.
6. Inspect the final diff against the acceptance criteria. Remove temporary
   debug code and identify any required documentation or follow-up work.

## Output

- Deliver the code and relevant test changes in the assigned worktree.
- Report changed files, behavior delivered, acceptance criteria met, and check
  commands and results, including any reused evidence.
- State remaining work or blockers. Return to the caller for further validation,
  review, or publication when those are separate stages.
