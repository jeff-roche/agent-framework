---
name: improve-test-coverage
description: Close agreed behavior gaps through test planning, test implementation, validation, and review. Use for a focused coverage effort on existing behavior without broad production changes.
license: MIT
metadata:
  author: jeff-roche
  agent-framework-kind: workflow
---

# Improve Test Coverage

Add evidence for important behavior, not tests whose only purpose is a higher
coverage percentage. Return newly found production defects as separate fix work.

## Inputs

- Behaviors, components, or reported coverage gaps to address, with scope and priorities.
- Existing tests, requirements, coverage reports, and any known failures or test plans.

## Required Guidelines

Load `task-conventions`, `workflow-conventions`, `use-repo-conventions`,
`test-conventions`, and `write-like-a-human`.

## Execution

- Prefer focused test-planning, test-writing, validation, and review subagents
  using `workflow-conventions`. Each loads its task and required guidelines.
- Pass behavior priorities, selected cases, worktree, and current check evidence
  forward. This workflow edits tests, fixtures, and helpers, not production behavior.

## Stages

1. **Select the workspace and scope.** Read repo guidance and the requested gaps.
   Run `use-worktrees` to select a non-primary task worktree before setup or checks.
   Establish the behavior contract from requirements, not merely today's output.
2. **Establish the baseline.** Inspect existing tests and reuse current suite or
   coverage results. Run focused baseline checks where evidence is missing. Record
   pre-existing failures so the new work does not hide or absorb them.
3. **Plan useful coverage.** Run `create-test-plan` for the agreed behaviors. Rank
   cases by impact and missing evidence; use coverage reports to find gaps, not to
   replace behavior analysis. Separate required cases from follow-up suggestions.
4. **Implement selected cases.** Run `implement-tests` in coherent groups. Reuse
   fixtures and existing assertions where they already prove the contract. Record
   the behavior each new test proves and any manual check that cannot be automated.
5. **Validate.** Run `validate-implementation` against the test plan and current
   results. Confirm new tests prove the intended behavior and do not introduce
   flaky timing, environment dependence, or misleading assertions.
6. **Review and check repo fit.** Run `review-code-changes` for tests and helpers,
   then `validate-repo-conventions` using current evidence. Route test corrections
   back to `implement-tests`; rerun affected checks and review corrected material.
7. **Update test guidance when needed.** Run `write-docs` for changed test setup
   or manual verification instructions, followed by `review-docs-changes` and
   applicable documentation checks. Refresh conformance evidence for those edits.

## Recovery And Completion

- If a valid test exposes a production defect, preserve the reproduction and
  failing result. Do not weaken the assertion or silently patch production code.
  Return the defect for a separately scoped fix and continue independent cases.
- Use `phone-a-friend` for disputed expected behavior or repeated failures with no
  new evidence. Expand scope only after the caller resolves the decision.
- Complete only when required cases are covered, required checks pass, repo fit
  is conformant, and no blocking/high finding remains. Address other in-scope
  findings or record a justified disposition. Failing regression tests keep the
  coverage change unfinished, even when they provide useful diagnostic evidence.

## Output

- Map completed behavior cases to test files and report commands and results.
- Include remaining cases, manual checks, production defects found, and review
  dispositions. Label self-review and explain any reported coverage metric.
- Return the worktree and completion state from `task-conventions`, with the next
  action when unfinished. Leave commits and publication to an explicit request.
