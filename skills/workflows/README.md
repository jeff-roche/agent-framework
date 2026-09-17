# Workflow Guide

Workflows connect tasks into a complete outcome. They own stage order, optional
branches, rework, and handoff. Tasks own the individual procedures.

## Current Workflows

| Workflow | Use when | Main path |
| --- | --- | --- |
| `implementation` | A feature or refactor needs a plan and coordinated edits. | Scope, plan, test plan, implement, document, validate, review. |
| `bug-fix` | A reported defect or CVE needs investigation and a verified correction. | Triage, establish cause, plan regression coverage, fix, validate, review. |
| `minimal-implementation` | A small code or test edit has clear behavior and low risk. | Confirm scope, edit, validate, review. |
| `writing-documents` | Documentation needs a complete drafting and review pass. | Define reader goals, establish facts, draft, review, validate. |
| `review-changes` | A change needs one review across code, tests, and docs. | Select exact source state, review, check repo fit, merge findings. |
| `prepare-pull-request` | An existing change needs PR text, readiness checks, or authorized publication. | Validate, review, prepare text, commit/publish when requested. |
| `improve-test-coverage` | Existing behavior needs focused test coverage. | Baseline, test plan, implement tests, validate, review. |
| `dependency-update` | A dependency upgrade needs compatibility and migration checks. | Assess versions, plan, upgrade, verify resolution, validate, review. |

Use a single task when the request is only to plan, triage, write tests, or review.
Do not start an editing workflow for a review-only request.

## Handoffs And Reuse

- Load tasks and guidelines by skill name. Link all required and conditional
  dependencies into any plugin that exposes the workflow.
- Run `use-worktrees` before repository work, including small edits and reviews.
  Reuse a non-primary task worktree or create one. When local edits are the input,
  preserve and record the exact source snapshot rather than reviewing stale HEAD.
- Follow `workflow-conventions`: prefer focused subagents for each stage and a
  reviewer that did not author the change. Pass exact worktree paths, owned files,
  scope, task/guideline instructions, and evidence to each worker. Do not run
  concurrent writers in one worktree; validate any integrated parallel work.
- Default to TDD for code changes. Small targeted edits needing no new tests may
  use existing focused checks. Document that exception or a genuine test-feasibility
  limit; do not manufacture low-value tests or call unobserved red/green work TDD.
- Pass scope, acceptance criteria, worktree, artifacts, and current check evidence
  forward. A valid result can satisfy a stage without repeating its work.
- A completed review can report defects. A completed validation task can report
  failed checks. The overall workflow is complete only after its own completion
  criteria hold.
- Keep reviews read-only, route corrections through edit tasks, and rerun checks
  affected by those edits. State whether review was independent or self-review.
- Editing workflows end at a checked working-tree change; review ends at a report.
  `prepare-pull-request` can commit and publish when explicitly requested. A local
  preparation or title/body-only request does not authorize a code push.

## Further Candidates

A release workflow could follow once tag, changelog, artifact, and rollback tasks
have clear contracts. A focused refactor already fits `implementation`, and CVE
remediation already fits `bug-fix`. Add a new workflow only when it introduces
useful coordination beyond the existing tasks and workflows.
