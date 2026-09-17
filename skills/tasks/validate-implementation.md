---
name: validate-implementation
description: Run and report evidence-based validation for code and test changes. Use after implementation or before requesting review.
license: MIT
metadata:
  author: jeff-roche
  agent-framework-kind: task
---

# Validate Implementation

Validate the requested behavior and the changed code, then report the actual
result. Do not treat a green command as proof of behavior it did not exercise.
Report defects to the caller; do not edit the implementation or weaken checks.

## Inputs

- Requested outcome, acceptance criteria, assigned worktree, and change scope.
- Implementation or test-plan results and any prior check evidence.

## Required Guidelines

Load `task-conventions`, `use-repo-conventions`, and `test-conventions`.

## Procedure

1. Read the requested outcome, acceptance criteria, changed files, tests, and
   repository validation guidance.
2. Inspect the diff for unintended changes, incomplete implementation, debug
   artifacts, generated files, credentials, and changes outside the task scope.
3. Map acceptance criteria to checks and review prior results for reuse under
   `task-conventions`. Run missing or stale focused tests first. Confirm they
   cover the changed behavior and interpret failures before proceeding.
4. Run remaining required static checks, formatting checks, type checks, builds,
   integration tests, or end-to-end tests in the prescribed order. Use check-only
   modes rather than automatic fixes.
5. Perform a manual or scripted behavior check when automated tests cannot
   establish a user-visible, operational, or integration requirement.
6. Classify every command as passed, failed, blocked, or not run. Capture the
   exact command and the material result for failures or blockers.
7. Mark the validation outcome as failed if any required check fails. Run
   independent checks when useful, but skip checks whose prerequisites failed.
   Report a concrete next action rather than repairing the change in this task.

## Output

- Produce a report mapping acceptance criteria to evidence, with exact commands,
  results, and the worktree and code state checked. Label reused evidence.
- Give a validation outcome: `passed` when all required checks pass; `failed`
  when any required check fails; `blocked` when a prerequisite prevents required
  checks and none failed; `partial` when coverage is otherwise incomplete.
- Include the separate task completion state from `task-conventions`. A completed
  report with failing checks does not mean the implementation passed.
- For non-passing outcomes, list failed or missing checks and the next action.
