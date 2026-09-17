# Shared Skills

`guidelines/` holds rules. `tasks/` holds bounded pieces of work. `workflows/`
skills choose and order tasks. See [the workflow guide](workflows/README.md) for
the current workflows and proposed additions.

These files are shared sources. Plugins can expose the same source as
`<plugin>/skills/<name>/SKILL.md` through a symlink. The frontmatter `name`
matches both the source filename and the installed skill directory.

The Node installer resolves links into independent installed files. Its package
hooks also build a plain-file catalog in `.agent-framework-catalog/`, so npm
packages retain linked skills, agents, and resources without a source checkout.

## Composition

- Refer to other skills by their frontmatter name, not a relative source path.
  This keeps references valid when a source is linked into different plugins.
- A plugin that exposes a workflow must also expose its required and conditional
  task dependencies. Each task lists its required guidelines; include those and
  their named rule dependencies as well. Suggested alternatives are not required
  dependencies unless the workflow actually calls them.
- Agents load the guidelines needed for their assigned work. Workflows load
  each task and its required guidelines before that stage runs. Descriptions
  and metadata help discovery; they do not enforce loading.
- Use `task-conventions` for task handoffs and evidence reuse. Pass prior task
  results forward rather than asking each stage to rediscover the same context.
- A workflow owns stage order, repetition, and recovery. A task returns after
  its assigned scope is complete.
- Use `workflow-conventions` to prefer focused subagents, independent review,
  and TDD for code changes. Pass full task context to workers; run writers in
  sequence within a worktree and validate after integrating parallel edit work.
- Prefer `use-worktrees` before repository work, including small edits and reviews.
  Every stage uses the selected non-primary task worktree. Reuse that selection
  instead of creating a worktree per task; keep primary-checkout inspection brief.

## Authoring

Use portable frontmatter: `name`, `description`, `license`, and `metadata`.
Set `metadata.agent-framework-kind` to `guideline`, `task`, or `workflow`.
This is catalog data, not a host-enforced behavior setting. Add `compatibility`
only for specific environment requirements.

Guidelines contain rules and final checks. Tasks contain inputs, required
guidelines, a procedure, and an output. Keep inputs and outputs brief and concrete.
Workflows add stage order, branch conditions, recovery, and completion criteria;
refer to task procedures rather than duplicating them.
Put host-specific tool, model, and invocation settings in target configuration.
