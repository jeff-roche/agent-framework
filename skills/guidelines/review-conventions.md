---
name: review-conventions
description: Rules for evidence-based code and documentation reviews. Use to set review scope, rank findings, and report coverage and limits consistently.
license: MIT
metadata:
  author: jeff-roche
  agent-framework-kind: guideline
---

# Review Conventions

Report actionable problems supported by the reviewed material and its context.

## Rules

- Establish the requested scope and comparison base. Include relevant staged,
  unstaged, and untracked files for local reviews; use the full intended change
  range for branch or pull-request reviews.
- Read the changed material in context. Verify claims through source evidence
  or focused checks when useful; do not report guesses as confirmed defects.
- Tie each finding to a concrete triggering condition and consequence. Avoid
  personal style preferences, duplicate findings, and unsupported future risks.
- Keep the review read-only. Return proposed fixes to the caller for a separate
  edit task. Use check-only commands rather than automatic formatters or fixes.
- Order findings by severity and include a precise file and line reference.
  Always state the scope reviewed, checks performed or reused, and material
  limits. Say explicitly when there are no findings.

## Severity

- `blocking`: The change cannot be accepted or used as intended; a core path
  fails or the change creates an immediate risk of severe harm, such as data loss.
- `high`: A supported, important path is broken or materially misleading and
  should be corrected before acceptance.
- `medium`: A concrete defect affects a narrower case or has a practical
  workaround, but still needs correction.
- `low`: A small, real issue with limited impact; not a personal preference.

Severity describes impact. State uncertainty separately rather than hiding weak
evidence behind a low severity.
