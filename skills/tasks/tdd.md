---
name: tdd
description: Implement one behavior through a failing test, the smallest passing change, and a refactor. Prefer for code changes whenever a meaningful automated test can be written before implementation.
license: MIT
metadata:
  author: jeff-roche
  agent-framework-kind: task
---

# Test-Driven Development

Complete one red, green, refactor loop for one small, observable behavior.
The caller selects the next behavior and repeats this task when needed.

## Inputs

- One behavior with acceptance criteria or a selected test-plan case.
- Assigned worktree, relevant implementation context, and known test commands.

## Required Guidelines

Load `task-conventions`, `use-repo-conventions`, and `test-conventions`.

## Procedure

1. Select one behavior from the acceptance criteria or test plan. Define its
   observable input, action, and expected result.
2. Write the smallest test that proves the behavior at the appropriate boundary.
   Reuse the repository's established test structure and fixtures.
3. Run the focused test and confirm that it fails for the missing behavior, not
   because of a syntax error, broken setup, or unrelated failure.
   If it already passes, inspect whether the behavior exists or the test misses
   the requirement. Do not weaken correct code to manufacture a failing test.
   If the test cannot run, report the blocker before implementing the behavior.
4. Implement the smallest production change that makes the test pass. Do not
   add speculative features or refactors during the green step.
5. Run the focused test again. Stop and diagnose if it does not pass.
6. Refactor only when it improves clarity or removes duplication. Keep behavior
   unchanged and rerun the focused test after each meaningful refactor.
7. Run relevant regression checks for this change, reusing valid prior evidence
   under `task-conventions`. Return the result for this behavior to the caller.

## Output

- Deliver a passing test and the minimal production change for the selected
  behavior, or evidence that it was already satisfied.
- Report changed files, the expected failing result, the passing result, exact
  check commands and outcomes, and any required checks or work still outstanding.
- Do not claim a red-green cycle when the expected failure was not observed.
