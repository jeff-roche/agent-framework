---
name: test-conventions
description: Rules for planning, writing, and validating tests. Use for test-driven development, test plans, test implementation, and regression fixes.
license: MIT
metadata:
  author: jeff-roche
  agent-framework-kind: guideline
---

# Test Conventions

Tests are executable evidence of behavior. Follow the repository's test
framework, structure, and commands when they exist; these rules provide the
default everywhere else.

## Rules

- Read the relevant production code and nearby tests before adding or changing
  tests. Extend the established test style rather than introducing a second
  pattern without need.
- Test observable behavior at the narrowest useful boundary. Prefer public
  outputs, state changes, and error behavior over private implementation
  details.
- Prefer a failing behavior test before code changes. For a defect, demonstrate
  the reported failure before fixing it when automation is feasible. Make the
  test describe the regression, not the implementation. Small targeted edits
  already covered by useful checks do not need duplicate tests.
- Cover the successful path, meaningful boundary conditions, and expected
  failure behavior for the change. Do not add low-value tests merely to raise
  coverage.
- Give tests descriptive names that state the condition and expected result.
  A reader should understand the requirement without reading the implementation.
- Make tests deterministic and isolated. Control time, randomness, filesystem
  state, environment variables, network calls, and external services.
- Use real collaborators when they are cheap and reliable; use fakes or mocks
  only at slow, nondeterministic, costly, or externally owned boundaries.
- Assert the smallest complete behavior. Do not assert incidental ordering,
  internal calls, snapshots, or full object shapes unless they are contractual.
- Keep test setup local and explicit. Share helpers only after repeated use
  makes them clearer than inline setup.
- Run the focused tests after every meaningful test or production change, then
  run the relevant broader suite before handoff.
- Do not weaken, skip, delete, or rewrite a failing test solely to make the
  suite pass. Determine whether the test or the behavior is wrong and record
  the decision.
- Avoid wall-clock timing assertions outside performance tests; prefer
  controlled clocks for time-dependent behavior.

## Final Checks

- Confirm the tests prove the intended behavior and check results apply to the
  current change.
- Identify untested risks, unavailable dependencies, and checks not run for the
  task result.
