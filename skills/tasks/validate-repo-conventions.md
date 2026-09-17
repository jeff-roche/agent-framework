---
name: validate-repo-conventions
description: Produce a conformance report showing whether a change follows repository conventions. Use before handoff, review, or merge.
license: MIT
metadata:
  author: jeff-roche
  agent-framework-kind: task
---

# Validate Repository Conventions

Verify that a change fits the repository before handing it off. This task
reports deviations; it does not silently rewrite the change.

## Inputs

- Change scope and worktree, applicable repository guidance, and known exceptions.
- Any `validate-implementation` report or other relevant check evidence.

## Required Guidelines

Load `task-conventions` and `use-repo-conventions`.

## Procedure

1. Read applicable repository and directory guidance, contribution rules,
   formatting and lint configuration, test configuration, and CI workflows.
2. Inspect the complete change set, including staged, unstaged, and untracked
   files that belong to the task.
3. Compare changed code, tests, documentation, naming, file placement,
   dependencies, commits, and generated output against the most specific
   applicable repository convention.
4. Reuse current check evidence under `task-conventions`. Own the comparison to
   repository rules, not a second behavior-validation pass. Run missing or stale
   checks needed to establish conformance, using check-only modes. When no prior
   report exists, run applicable required checks or report why they are missing.
5. Distinguish mandatory violations from reasonable deviations where the
   repository has no explicit rule. Do not report personal preferences as
   convention failures.
6. Identify the exact guidance or configuration that supports every failure.
   If the source is ambiguous, mark the result as uncertain rather than failing
   the change on assumption.

## Output

- Produce a conformance report with the scope and code state assessed, applicable
  guidance, commands run or reused, and their results.
- For every violation, include the path, violated convention, supporting source,
  and required correction.
- Give a conformance outcome: `conformant` when all applicable mandatory rules
  are verified; `nonconformant` when any is violated; `blocked` when missing
  evidence prevents required checks and no violation is confirmed; `partial`
  when coverage or interpretation is otherwise incomplete.
- Include the separate task completion state from `task-conventions` and any
  needed next action. A finished report can identify a nonconformant change.
