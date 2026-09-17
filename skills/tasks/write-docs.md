---
name: write-docs
description: Write or update documentation, user-facing text, or code comments for a scoped change. Use for guides, references, migration notes, and documentation review fixes.
license: MIT
metadata:
  author: jeff-roche
  agent-framework-kind: task
---

# Write Documentation

Help the intended reader complete a specific task using accurate, concise text.
Edit documentation or comments without changing executable behavior.

## Inputs

- Reader task, audience, document scope, and requested outcome or review findings.
- Source-of-truth code or policy and any implementation or validation results.

## Required Guidelines

Load `task-conventions`, `use-repo-conventions`, and `write-like-a-human`.

## Procedure

1. Read the source of truth and existing material. Identify where the reader
   expects the information and reuse the established document structure.
2. Confirm the behavior being described, including prerequisites, supported
   versions, configuration, and limits. Resolve unsupported claims before writing.
3. Write the smallest useful update. Include copyable examples, expected results,
   and migration steps only when they help the reader complete the task.
4. Update directly affected links and references. Keep names and terminology
   consistent with the implementation and other maintained documentation.
5. Verify claims, links, and examples through source evidence or suitable checks.
   Inspect example commands before running them; use an isolated test setup for
   examples that change state, and report anything that could not be verified.
6. Run applicable documentation formatting, lint, link, or build checks. Review
   the final diff for stale claims, repetition, and changes outside the scope.

## Output

- Deliver the updated documents, copy, or comments.
- Report changed files, the reader task addressed, and check commands and results.
- Identify any claims or examples still unverified and the evidence needed to
  finish them.
