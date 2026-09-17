---
name: review-changes
description: Review a local change, branch, or pull request across code, tests, and documentation, then return one evidence-based report. Use for a complete review without applying fixes.
license: MIT
metadata:
  author: jeff-roche
  agent-framework-kind: workflow
---

# Review Changes

Review the requested change in an isolated worktree and combine findings into one
clear report. Workspace setup may create a snapshot; review does not edit the change.

## Inputs

- Local change, branch range, or PR to review; intended behavior and comparison base.
- Requested review depth, available test evidence, and any areas needing special attention.

## Required Guidelines

Load `task-conventions`, `workflow-conventions`, `use-repo-conventions`,
`review-conventions`, and `write-like-a-human`.

## Execution

- Prefer focused code, docs, and validation subagents using `workflow-conventions`.
  Each loads its task and required guidelines. Independent read-only reviews may
  run in parallel against the same stable source state.
- Pass the source revision or snapshot, comparison base, worktree, and current
  evidence forward. Label self-review when reviewing the current agent's own edits.

## Stages

1. **Fix the scope.** Identify the requested source state and comparison base.
   For a PR, inspect its full commit range and head revision. For a local review,
   identify relevant staged, unstaged, and untracked files before taking a snapshot.
2. **Select the review worktree.** Run `use-worktrees` with that source state and
   comparison base, including whether this is source-only review or requires
   executable checks. Reuse or create a non-primary worktree that reproduces the
   requested change. Do not silently review committed HEAD instead of local edits.
3. **Choose checks.** Reuse current evidence and determine what the requested
   depth needs. A source-only review need not run the full suite. When broader
   behavior validation is requested, run `validate-implementation`; otherwise let
   the review tasks use focused check-only commands. Record coverage limits.
4. **Review code and tests.** When code, configuration, or tests changed, run
   `review-code-changes` with the scope, intended behavior, and check evidence.
5. **Review documentation.** When docs, comments, or user-facing text changed,
   run `review-docs-changes` against the same source state and intended behavior.
6. **Check repo fit.** Run `validate-repo-conventions` with current evidence and
   the requested review depth. If required checks fall outside a source-only
   review, mark conformance partial rather than silently expanding the request.
7. **Combine findings.** Merge duplicate reports of the same problem, preserving
   the best evidence and precise locations. Resolve contradictory findings from
   source evidence or `phone-a-friend`. Order findings using `review-conventions`.

## Recovery And Completion

- Do not apply fixes, weaken checks, or change PR review state. Return actionable
  corrections for a later edit workflow. Missing tools block only dependent checks.
- If the source changes during review, either refresh affected checks and findings
  or clearly pin the report to the reviewed revision. Do not mix revisions silently.
- A completed review can find blocking defects or failed checks. Complete when
  the agreed review scope is covered; use partial or blocked when it is not.
  Report evidence limits separately from whether any defects were found.

## Output

- Return one findings-first report with severity, path and line, triggering
  condition, impact, and correction. State explicitly when there are no findings.
- Include reviewed revision or snapshot, comparison base, worktree, checks and
  outcomes, review coverage, and whether the review was independent or self-review.
- Return a workflow completion state from `task-conventions` and any next action.
