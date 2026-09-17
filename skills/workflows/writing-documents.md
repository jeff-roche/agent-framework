---
name: writing-documents
description: Create or update repository documentation through scoped drafting, fact-checking, review, and validation. Use for guides, references, runbooks, migration notes, or substantial documentation fixes; use write-docs alone for a small edit inside another workflow.
license: MIT
metadata:
  author: jeff-roche
  agent-framework-kind: workflow
---

# Writing Documents

Deliver accurate documentation that helps a reader complete a task. Keep drafts,
review findings, and edits distinct so review does not silently expand the scope.

## Inputs

- Reader task, audience, intended documents, and requested outcome or review findings.
- Source-of-truth code or policy, relevant versions, and any implementation results.

## Required Guidelines

Load `task-conventions`, `workflow-conventions`, `use-repo-conventions`, and
`write-like-a-human`.

## Execution

- Prefer a writing subagent and a separate reviewer using `workflow-conventions`.
  Each loads its named task and required guidelines before the stage.
- Pass audience, reader goals, source references, worktree, and current check
  results between stages. Reuse applicable evidence and report once at handoff.
- This workflow edits documentation, copy, and comments. A discovered production
  defect is a separate code-change scope, not permission to change behavior.

## Stages

1. **Define the reader's goal.** Read repo guidance and existing material. Identify
   the audience, document type, source of truth, and what the reader must be able
   to do after reading. Choose the existing document location when it fits.
2. **Select the workspace.** Run `use-worktrees` before drafting, setup, or checks.
   Reuse or create a non-primary task worktree, preserving existing source changes
   and recording any copied baseline for later stages.
3. **Confirm facts and scope.** Check the behavior or policy being described.
   For a larger document, make a short outline tied to reader goals; a small
   update needs no separate plan. Use `phone-a-friend` for an unresolved product
   or policy decision. Distinguish current behavior from explicitly proposed behavior.
4. **Draft and check.** Run `write-docs` with the scope, source references, and
   outline when one exists. Pass implementation evidence for change-related docs.
   Collect command, link, example, formatting, and build results as applicable.
5. **Review.** Run `review-docs-changes` against the full changed material and its
   source of truth. Review accuracy, reader task coverage, and clarity. Return
   findings to `write-docs` for corrections; repeat review only for changed or
   previously unresolved material. Label review by the writing agent as self-review.
6. **Check repo fit.** Run `validate-repo-conventions` with the final documents and
   current checks. Reuse valid results from drafting and review; run missing or
   stale required documentation checks. Correct violations through `write-docs`
   and recheck affected material before handoff.

## Recovery And Completion

- If code and requested documentation disagree, establish which is intended
  before publishing a claim. Do not invent behavior to fill the gap. Record any
  code fix needed separately and block only the dependent documentation scope.
- If a check or review keeps failing without new evidence, use `phone-a-friend`
  with the concrete issue. Continue sections that do not depend on the answer.
- Complete only when the reader goals are met, required claims and examples are
  verified, required checks pass, repo checks are conformant, and no blocking or
  high review finding remains. Correct other in-scope findings or record a
  justified disposition; an unverified required claim keeps the work unfinished.

## Output

- Summarize the reader task addressed and the documents changed.
- Give check results and review dispositions, including any unverified material.
- Return a workflow completion state from `task-conventions`. For unfinished work,
  name the missing source, decision, or check and the next action.
- Leave commits and publication to an explicit request.
