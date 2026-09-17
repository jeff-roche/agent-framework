---
name: commit-conventions
description: Rules for forming, writing, and updating Git commits. Use whenever creating, amending, squashing, or reviewing commits.
license: MIT
metadata:
  author: jeff-roche
  agent-framework-kind: guideline
---

# Commit Conventions

Treat every commit as a durable, reviewable record. Follow repository commit
rules when they exist; these rules provide the default everywhere else.

## Rules

- Inspect `git status`, the staged diff, and recent commit history before
  committing. Stage only files that belong to the change.
- Make each commit one coherent change that can be understood, reviewed, and
  reverted independently.
- Do not mix behavior changes with unrelated formatting, generated files,
  dependency updates, or drive-by cleanup.
- Write the subject in the imperative mood, without a period. Keep it concise;
  prefer 72 characters or fewer.
- Use the repository's required commit format, such as Conventional Commits. If
  it has none, write a plain-language subject that describes the outcome.
- Add a body when the intent, tradeoff, migration, limitation, or validation is
  not clear from the diff and subject. Explain why, not a line-by-line summary.
- Include issue references or breaking-change notices only when
  they are accurate and required by the repository or hosting platform.
- Do not commit credentials, private keys, tokens, local configuration, build
  artifacts, or unrelated generated output.
- Run the relevant validation before committing when practical. Do not claim a
  check passed unless it was run successfully.
- Do not amend, reword, squash, or rewrite an existing commit unless the user
  asks or the change is still clearly private to the current work.
- Credit model-assisted commit content with a `Co-authored-by: Name <email>`
  trailer after a blank line. Use the model-provider identity supplied by the
  environment, user, or repository. Do not invent a name or email; if none is
  available, note the missing attribution in the task result. Do not specify the
  model or model-family in the attribution.

## Final Checks

- Verify the final commit range and working tree are what you intend to share.
- Confirm validation evidence applies to the committed content.
