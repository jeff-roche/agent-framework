---
name: bug-fix
description: Diagnose and fix a reported bug, regression, or CVE with evidence of the cause and the correction. Use when a defect needs investigation, reproduction, a scoped fix, and regression validation.
license: MIT
metadata:
  author: jeff-roche
  agent-framework-kind: workflow
---

# Bug Fix

Establish what is wrong, fix the supported cause, and show that the correction
works. A disappearing symptom or a clean scanner result alone is not enough.

## Inputs

- Bug report, observed failure, or advisory; expected behavior and known impact.
- Repository or assigned worktree, environment details, logs, and any prior triage.

## Required Guidelines

Load `task-conventions`, `workflow-conventions`, `use-repo-conventions`, and
`write-like-a-human`.

## Execution

- Prefer focused investigation, implementation, validation, and review subagents
  using `workflow-conventions`. Each loads its task and required guidelines.
- Carry the triage record, worktree, agreed behavior, and current evidence through
  the workflow. A finished diagnostic task is not proof that the bug is fixed.
- Reuse applicable prior results and summarize the overall result once at handoff.

## Stages

1. **Confirm scope and workspace.** Read the report and repo guidance. Inspect
   existing changes, then run `use-worktrees` to select a non-primary task worktree
   before reproduction, setup, edits, or checks. Carry its source state forward.
2. **Triage.** Run `triage-bug`. Establish impact, reproduction status, the failure
   boundary, and a supported cause. For a CVE, verify the advisory, affected
   versions, resolved dependency versions, and applicable code or configuration.
3. **Check the evidence.** If the cause is unsupported, gather the specific
   missing evidence or use `phone-a-friend`. Proceed without a local reproduction
   only when other concrete evidence supports the fix, and record that limit.
   Do not close or dismiss a report merely because reproduction failed.
4. **Bound the fix.** Define the corrected behavior and checks that will prove it.
   Run `plan-code-changes` when the fix needs coordinated edits, interface changes,
   or a migration. Keep a straightforward fix plan inline.
5. **Plan regression coverage.** Run `create-test-plan` with the triage evidence
   and fix scope. Include the failing case, nearby supported behavior, and relevant
   boundaries. For a dependency fix, include resolved-version and compatibility checks.
6. **Fix one behavior at a time.** Assign `tdd` to the implementation subagent
   whenever an automated regression can demonstrate the defect. Run it once per
   behavior and verify the failing and passing results. Use `implement-code-changes`
   only for a justified exception under `workflow-conventions` or an explicit
   alternative test approach. A short fix alone does not remove the need for a
   useful regression test.
7. **Update affected docs.** Run `write-docs` when the fix changes documented
   behavior, setup, supported versions, workarounds, or migration steps.
8. **Validate the correction.** Run `validate-implementation` with the triage
   record, regression plan, diff, and prior check results. Repeat the original
   reproduction or equivalent evidence check and verify nearby supported behavior.
   For a CVE, confirm the affected condition is removed as well as compatibility.
9. **Review and check repo fit.** Prefer a separate reviewer for `review-code-changes`
   and, for changed docs, `review-docs-changes`. Then run
   `validate-repo-conventions` using current check
   evidence. Resolve findings through edit tasks, not inside review tasks.

## Recovery And Completion

- Correct code through the selected fix task, test-only gaps through
  `implement-tests`, and docs through `write-docs`. Revalidate and re-review
  affected material after edits. If evidence contradicts the suspected cause,
  return to `triage-bug` rather than adding speculative patches.
- Use `phone-a-friend` when progress needs an unavailable fact or decision, or
  repeated attempts yield no new evidence. Preserve useful work and report the
  blocker; continue only stages that do not depend on it.
- Complete only when the corrected behavior is verified, required checks pass,
  repo checks are conformant, and no blocking or high review finding remains.
  Correct other in-scope findings or record a justified disposition. A self-review
  must be labeled as such; unverified required behavior keeps the workflow unfinished.

## Output

- State the cause and evidence, the fix, changed files, and regression coverage.
- Give before-and-after results, exact check commands, review dispositions, and
  any remaining reproduction or environment limits.
- Return a workflow completion state from `task-conventions`. For unfinished work,
  identify the last completed stage, missing evidence or checks, and next action.
- Leave issue closure, commits, pull requests, and releases to an explicit request.
