---
name: review-docs-changes
description: Review documentation, user-facing text, and code comments for accuracy, clarity, and maintainability. Use whenever documentation review is requested.
license: MIT
metadata:
  author: jeff-roche
  agent-framework-kind: task
---

# Review Documentation Changes

Review documentation as a user-facing interface. Return findings for a separate
edit task rather than rewriting the material.

## Inputs

- Documents or comments to review, change scope, and intended audience.
- Source-of-truth behavior or policy and any prior validation evidence.

## Required Guidelines

Load `task-conventions`, `use-repo-conventions`, `review-conventions`, and
`write-like-a-human`.

## Procedure

1. Establish the review scope, intended audience, source-of-truth code or
   policy, and repository writing rules.
2. Read the full changed document or comment in context, not only the diff.
3. Verify technical claims, commands, configuration, API names, links,
   prerequisites, expected output, and migration or compatibility guidance
   against the source of truth.
4. Check that the material answers the reader's task in a clear order and uses
   the repository's terminology, structure, and formatting conventions.
5. Identify ambiguous instructions, missing warnings for concrete hazards,
   stale references, unsupported claims, broken examples, and comments that
   duplicate code rather than explain intent.
6. Use check-only documentation tooling where useful. Inspect commands before
   running them; do not execute publishing, deletion, or other state-changing
   examples merely to verify their text.
7. Rank findings using `review-conventions`. Explain the affected reader task,
   consequence, and required correction.

## Output

- Produce findings first, ordered by reader impact.
- Format every finding as: `[severity] path:line - inaccurate, unclear, or
  incomplete content; required correction; reader impact.`
- State explicitly when there are no findings.
- Always include the material reviewed, checks run or reused, and claims or
  examples that could not be verified.
