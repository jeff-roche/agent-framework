---
name: review-code-changes
description: Review local, branch, or pull-request code changes for defects, regressions, and missing tests. Use whenever code review is requested.
license: MIT
metadata:
  author: jeff-roche
  agent-framework-kind: task
---

# Review Code Changes

Review for actionable problems, not style preferences. Do not edit the code
under review; return findings for a separate fix task.

## Inputs

- Change scope: local files, a branch range, or a pull request, with its base.
- Intended behavior and any acceptance criteria, test plan, or validation results.

## Required Guidelines

Load `task-conventions`, `use-repo-conventions`, `review-conventions`, and
`test-conventions`.

## Procedure

1. Establish the review scope: changed files, comparison base, user intent,
   related issue, and relevant repository guidance.
2. Read the complete diff, then the changed code in its surrounding execution
   paths. Inspect relevant tests, callers, data contracts, and configuration.
3. Look for behavior regressions, incorrect edge-case handling, invalid state
   transitions, error handling gaps, security exposure, data loss, concurrency
   issues, compatibility breaks, performance hazards, and missing tests.
4. Verify that tests exercise the new or changed behavior and that assertions
   prove the contract rather than implementation details.
5. Verify suspected defects through source evidence or focused check-only
   commands. Reuse applicable validation results and state any evidence gaps.
6. Rank findings using `review-conventions`. Explain the triggering condition,
   consequence, and smallest useful correction.

## Output

- Produce findings first, ordered by severity.
- Format every finding as: `[severity] path:line - problem, triggering
  condition, consequence, and suggested correction.`
- State explicitly when there are no findings.
- Always include the scope and code state reviewed, checks run or reused, and
  material test or review limits.
