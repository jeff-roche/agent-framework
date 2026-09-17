---
name: workflow-conventions
description: Rules for worktree-based, subagent-driven workflows and test-first code changes. Use when coordinating task stages, assigning workers, choosing TDD, reviewing results, or recovering from failures.
license: MIT
metadata:
  author: jeff-roche
  agent-framework-kind: guideline
---

# Workflow Conventions

The coordinator owns scope, task order, evidence, and handoff. Prefer focused
subagents for the individual stages and an independent subagent for review.

## Workspace And Delegation

- Run `use-worktrees` before repository work. Select a non-primary task worktree
  and pass its exact path and source state to every worker. Reuse a verified
  selection; do not create a worktree per sequential stage.
- Prefer an available specialist subagent for planning, implementation, testing,
  documentation, validation, and review. Use the host's actual agent names and
  tools; do not assume a particular product, model, or agent is installed.
- Give each worker a bounded task, scope, owned files, acceptance criteria,
  worktree, prior artifacts, check evidence, edit permissions, and expected result.
  Require it to load the task and its required guidelines in its own context.
- Run dependent stages in order. Do not run concurrent writers in one worktree.
  Parallelize independent reading or reviews against a stable source state;
  parallel edit work needs separate worktrees and a named integration owner.
  Revalidate the integrated result before relying on worker check results.
- Prefer a reviewer that did not author the change. If subagents are unavailable
  or disallowed, execute the stage directly and disclose that fallback. Label
  self-review; do not present it as an independent review.
- Verify a worker's returned scope, diff, completion state, and evidence before
  advancing. Preserve useful partial work and give recovery tasks the exact
  unresolved issue rather than restarting the whole workflow.

## Test-First Code Changes

- Default to `tdd` for code changes whenever a meaningful automated test can be
  written first. Assign one behavior per call, observe the expected failure,
  implement the smallest passing change, and keep refactors covered by tests.
- A small, targeted edit may use `implement-code-changes` when new tests would
  add no useful evidence and existing focused checks cover the change. State why
  the exception fits. Small file count alone does not justify skipping regression
  coverage for changed behavior.
- If a useful failing automated test is not feasible, explain the limit and name
  the strongest existing, static, integration, or manual checks before proceeding
  with `implement-code-changes`. Do not fabricate a failure or claim TDD was used.
- Reuse existing tests instead of duplicating them. Test-only work uses
  `implement-tests`; a coverage task must not invoke TDD to expand into a
  production fix without an agreed scope change.
- Honor explicit user or repo requirements for the test approach. Reuse current
  check results and rerun affected checks after edits or integration.

## Final Checks

- Confirm the workflow's own completion criteria hold, not just that its workers
  finished. A completed review can still contain defects or failed checks.
- Report the worktree, delivered scope, validation, review outcomes, and any
  remaining blocker. Summarize material delegation or TDD fallbacks without
  repeating every worker's report.
