---
name: create-test-plan
description: Produce a test plan for a feature, defect, or change. Use before test-driven development, test implementation, or validation design.
license: MIT
metadata:
  author: jeff-roche
  agent-framework-kind: task
---

# Create Test Plan

Create a test plan that can be implemented or run without rediscovering the
requirements or test boundaries. Do not write test or production code in this task.

## Inputs

- Requested behavior or implementation plan, acceptance criteria, and change scope.
- Relevant repository context and any existing test plan or coverage evidence.

## Required Guidelines

Load `task-conventions`, `use-repo-conventions`, `test-conventions`, and
`write-like-a-human`.

## Procedure

1. Read the requested behavior, applicable repository guidance, relevant code,
   nearby tests, and test configuration.
2. List the observable behaviors that must hold after the change. Include the
   successful path, meaningful boundaries, failures, regressions, and contracts
   with external systems.
   Map each behavior to existing coverage before proposing new tests.
3. Choose the narrowest test level that can prove each behavior. Use unit tests
   for local logic, integration tests for component boundaries, and end-to-end
   tests only for user-critical flows that lower levels cannot prove.
4. Specify each test case with its scenario, test level, required setup or
   fixtures, action, and observable assertion.
5. Identify deterministic control needed for time, randomness, I/O, network
   calls, and external services. Name any existing helper or fixture to reuse.
6. Separate tests that must accompany the change from follow-up coverage that
   is useful but outside the requested scope.
7. Name the focused test command and the broader validation command, using
   repository scripts when available.

## Output

- Produce a numbered test plan grouped by behavior.
- For every planned test, include the target file or suite, scenario, setup,
  action, assertion, test level, and requirement it proves. Share repeated setup
  at the group level rather than copying it into every case.
- Identify reused coverage and manual checks, including why automation is not
  suitable for a manual check.
- End with focused and broader commands and any material assumptions or gaps.
