---
name: implement-tests
description: Add or update automated tests for existing behavior or a supplied test plan. Use for coverage gaps, test maintenance, and regression tests outside a test-first implementation loop.
license: MIT
metadata:
  author: jeff-roche
  agent-framework-kind: task
---

# Implement Tests

Turn agreed behavior into useful automated evidence. Edit tests, fixtures, and
test helpers; return production defects or required production changes to the caller.

## Inputs

- Behaviors to prove, acceptance criteria, or selected cases from a test plan.
- Assigned worktree, target code or suites, and any known failures or coverage.

## Required Guidelines

Load `task-conventions`, `use-repo-conventions`, and `test-conventions`.

## Procedure

1. Read the target code, existing tests, and repository test setup. Confirm the
   expected behavior from requirements rather than treating current output as
   proof of correctness.
2. Map the assigned cases to existing coverage. Reuse or extend a useful test
   instead of adding a duplicate, and choose the narrowest useful test boundary.
3. Write deterministic tests with clear setup, actions, and observable assertions.
   Reuse maintained helpers and control unstable external boundaries.
4. For regression coverage, show that the test detects the reported defect when
   a failing version or fixture is available. Use isolated reproduction without
   overwriting current work, and state when the regression could not be verified.
5. Run focused tests and inspect failures. Correct faulty test setup or assertions;
   if the test exposes a production defect, preserve the evidence and return the
   needed fix rather than changing expected behavior to match the bug.
6. Run relevant broader checks, reusing current evidence when valid. Report any
   planned cases that still need manual verification or cannot be implemented.

## Output

- Deliver the test, fixture, and helper changes for the assigned cases.
- Map covered behaviors to test files and report commands and actual results.
- State uncovered cases, production defects found, and any next action. A failing
  regression test must be identified as failing, not reported as a passing handoff.
