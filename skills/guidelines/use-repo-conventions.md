---
name: use-repo-conventions
description: Rules for discovering and applying a repository's coding, testing, documentation, and validation conventions. Use before planning or changing a repository.
license: MIT
metadata:
  author: jeff-roche
  agent-framework-kind: guideline
---

# Use Repository Conventions

The repository is the source of truth for how its changes should look and be
validated. Discover its conventions before editing, then follow them
consistently.

## Rules

- Read repository guidance first, including `AGENTS.md`, `CLAUDE.md`,
  `CONTRIBUTING.md`, `README.md`, and directory-specific instructions that
  apply to the files being changed.
- Inspect the package or build manifest, formatter and linter configuration,
  test configuration, CI workflows, relevant scripts, and workflow tooling
  before choosing a command or tool.
- Prefer repository targets from make, just, npm, bun, etc. over
  raw commands.
- Study nearby production code, tests, documentation, and recent changes to
  infer conventions not written down. Prefer the closest maintained example.
- Follow the host agent's instruction priority and the user's requested scope.
  Within project-level conventions, prefer applicable directory guidance over
  repository-wide guidance, then configuration and automation, then maintained
  local patterns. This order does not override higher-priority instructions.
- Preserve the repository's language, formatting, naming, error handling,
  dependency, testing, documentation, and commit conventions.
- Use existing helpers, abstractions, and dependencies when they fit. Do not
  introduce a new pattern or dependency when an established one solves the
  problem.
- Keep the change scoped to the request. Do not use a task as an excuse for
  unrelated cleanup or modernization.
- Treat examples as evidence, not absolute authority. Prefer current
  configuration and maintained code over stale documentation or legacy files.
- If a required convention is unclear or conflicting, make the smallest safe
  choice, explain the uncertainty, and ask only when the decision materially
  changes behavior or scope.
- Reuse prior repository findings when their scope and sources still apply.
  Refresh them when guidance, configuration, or the working context changes.
- Run the repository's prescribed validation. If no documented command exists,
  run the narrowest relevant check and state that it is a best-effort choice.

## Final Checks

- Confirm the change follows the applicable guidance and prescribed validation.
- Identify any convention that could not be followed and why for the task result.
