---
name: prepare-pull-request
description: Prepare a checked change for a pull request, including review evidence, commit scope, and PR text. When explicitly asked to publish, create needed commits and open or update a draft PR.
license: MIT
metadata:
  author: jeff-roche
  agent-framework-kind: workflow
---

# Prepare Pull Request

Turn an existing change into a clear review artifact. Distinguish local preparation
from an explicit request to commit or publish; the workflow name alone is not permission.

## Inputs

- Existing change, intended outcome, issue context, and any validation or review results.
- Requested endpoint: local preparation or opening/updating a PR; any commit request.
- Source branch and repository, intended base, and existing PR URL when available.

## Required Guidelines

Load `task-conventions`, `workflow-conventions`, `use-repo-conventions`,
`branch-conventions`, `commit-conventions`, `pull-request-conventions`, and
`write-like-a-human`.

## Execution

- Prefer scoped validation, review, and Git task subagents under
  `workflow-conventions`. Each loads its task and required guidelines. Pass the
  same source state, worktree, evidence, and exact publication authority to workers.
- A request to publish the change as a PR includes the ordinary commit and push
  steps needed for that scoped change. A request only to prepare text or inspect
  readiness does not. Ask only when the requested endpoint is materially unclear.

## Stages

1. **Establish the endpoint and scope.** Inspect the request, existing diff,
   branch history, and remotes. Identify the full intended commit range and any
   uncommitted task changes. Confirm the base and fork relationship from evidence.
2. **Select the workspace.** Run `use-worktrees` to reuse or create a non-primary
   task worktree containing that change. Preserve the requested PR source branch;
   resolve any branch change needed for isolation before publishing. Record copied
   source changes so later staging does not absorb unrelated baseline files.
3. **Validate readiness.** Run `validate-implementation` for code or test changes,
   and `validate-repo-conventions` for the whole change. Reuse current evidence;
   for docs-only changes, use the prescribed documentation checks.
4. **Review the full change.** Run `review-code-changes` and/or
   `review-docs-changes` as applicable. Reuse a prior review only if it covers the
   current state and full intended range. Label self-review and collect dispositions.
5. **Resolve readiness gaps.** When fixes are within the requested scope, assign
   code corrections to `tdd` by default, test-only gaps to `implement-tests`, and
   docs to `write-docs`. Use `implement-code-changes` only for exceptions under
   `workflow-conventions`. Otherwise return the findings. Revalidate and re-review
   affected content; do not expand into an unrelated feature or refactor.
6. **Prepare the artifact.** Draft the title, description, validation section,
   relevant issue links, and proposed commit scope using the required guidelines.
   For local preparation with no commit request, return these without committing
   or pushing. If only a commit was also requested, complete stage 7 and skip stage 8.
7. **Commit when authorized.** If the request includes committing or publishing
   and task edits remain, run `create-commit` for each coherent unit. Reuse existing
   commits; do not create empty commits or rewrite history. Check hook changes
   and refresh evidence when committed content differs from the reviewed content.
8. **Publish when authorized.** For an explicit PR request, run
   `create-pull-request` with the committed range and current evidence. Reuse an
   existing matching request. An already-current PR is a no-op, not a duplicate.

## Recovery And Completion

- Use `phone-a-friend` for unresolved source/base ownership, scope, or review
  decisions. Report authentication, hook, push, and CI blockers with the next step.
- Publish as ready only when required validation has passed, repo checks are
  conformant, the full review scope is complete, and no blocking/high finding
  remains. Blocked, partial, pending, and unrun checks are not passing evidence.
- An explicitly requested draft of already-committed changes may show incomplete
  work when repo rules permit it, with every known gap stated. Uncommitted work
  must first satisfy `create-commit`; if required checks prevent that commit,
  publication remains blocked. Do not present an incomplete draft as review-ready.
- Completion depends on the requested endpoint: a complete local preparation
  report may identify blockers; a publication request needs a verified PR URL and
  head commit. Report review readiness and remote CI separately from completion.

## Output

- For local preparation, return PR text, proposed or authorized commit results,
  readiness, and remaining actions. For publication, return the PR URL, commits,
  source/base branches, draft state, and current local and remote check results.
- Include the task worktree and completion state from `task-conventions`.
- If only part of publication succeeded, identify exactly what was committed or
  pushed and what remains. Do not merge or change reviewer settings implicitly.
