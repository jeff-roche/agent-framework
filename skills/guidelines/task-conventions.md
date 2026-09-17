---
name: task-conventions
description: Rules for running a bounded task alone or within a workflow. Use for task inputs, guideline loading, evidence reuse, completion states, and handoffs.
license: MIT
metadata:
  author: jeff-roche
  agent-framework-kind: guideline
---

# Task Conventions

Complete the assigned piece of work and return a result the next task can use.
Let the caller own the wider workflow.

## Rules

- Load the task's required guidelines and their named guideline dependencies
  before following its procedure. Reuse guidelines already loaded in the current
  context. Resolve skill names through the installed catalog or shared source
  files; report a missing required guideline as a blocker rather than assuming
  its contents.
- Accept inputs from the user or a prior task result. Check that their scope,
  repository, worktree, and code state still apply before reusing them.
- Infer routine missing details from repository evidence. Ask only when a
  missing input materially affects correctness or scope.
- Before repository edits, setup, or checks, run `use-worktrees` to select a
  non-primary task worktree. Reuse an already verified selection from the caller;
  do not create another worktree for each subtask. The `use-worktrees` setup task
  itself performs this selection and must not call itself recursively.
- Honor the task's edit boundary. Planning and review tasks return artifacts or
  findings; implementation tasks make the scoped changes. Do not commit, push,
  publish, or change issue state unless the caller authorizes that action.
- Run commands in the assigned worktree. Record each check's exact command,
  working directory, relevant code state, result, and material failure evidence.
  A commit ID alone does not identify uncommitted changes.
- Reuse check results only when the relevant files, configuration, dependencies,
  and environment are unchanged. Rerun affected checks when evidence is stale;
  do not repeat valid checks just because another task requested them.
- Keep the result proportional to the work. Return the requested artifact or
  findings, supporting evidence, completion state, and any needed next action.
  Omit empty sections and do not repeat every loaded guideline.
- Return to the caller after the assigned scope is complete. Do not start the
  next workflow stage unless it is part of the request.

## Completion States

- `completed`: The task produced its required output for the full scope. A
  completed review may contain findings; a completed validation may find failures.
- `partial`: Useful output exists, but some assigned scope remains unfinished.
- `blocked`: A missing input, access, tool, or decision prevents completion.
- `failed`: The task itself could not produce a usable result due to an error.

Keep completion separate from the outcome being assessed, such as validation
`passed` or `failed`. For any unfinished task, state what remains and why.
