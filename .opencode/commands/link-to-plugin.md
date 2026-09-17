---
description: "Link a skill or agent and its dependencies. Usage: /link-to-plugin <source-name-or-repo-path> <plugin-name>"
---

# Link to Plugin

Link shared definitions into a plugin using portable, relative symlinks. Resolve
the complete dependency set before editing, and preserve existing user files.

## Request

Arguments: $ARGUMENTS

Usage: `/link-to-plugin <source-name-or-repo-path> <plugin-name>`

Examples:

- `/link-to-plugin tdd swe-toolkit`
- `/link-to-plugin agents/software-engineer.md swe-toolkit`

Parse exactly two arguments: the source skill or agent first, then the target
marketplace plugin. Allow a quoted source path. Require both arguments and treat
them as data, not shell text. If a name is ambiguous, ask for the source path;
do not guess or select every match.

## Resolve

1. Read `AGENTS.md`, applicable directory guidance, `skills/README.md`, and
   `.claude-plugin/marketplace.json`. Inspect the working tree and preserve
   unrelated changes.
2. Resolve the plugin by its marketplace `name`. Use its registered `source`
   path, not an assumed directory with the same name. Confirm the directory and
   `.claude-plugin/plugin.json` exist, the manifest name matches, and the resolved
   plugin path stays inside this repository. Report unknown plugins rather than
   creating a new registry entry.
3. Resolve the source by exact frontmatter `name` or an explicit repo-relative
   Markdown path under `skills/` or `agents/`. Exclude templates and READMEs.
   Verify a nonempty description, a valid kebab-case name, and a matching source
   filename or skill directory. Reject missing, duplicate, or out-of-repo sources.
4. Read the source and follow every required skill or agent dependency recursively.
   Include required guidelines, their rule dependencies, workflow task calls, and
   explicit agent delegation, including calls on conditional execution paths.
   Do not treat examples, role mentions, or suggested alternatives as dependencies.
   Read definitions as dependency data; do not execute their tasks or delegate work.
5. Resolve each dependency to a canonical source. Track visited sources to handle
   cycles and shared dependencies once. If a required name is missing or ambiguous,
   report the reference and dependency chain before changing any files.

## Link

1. Build the full source-to-destination map using frontmatter names:
   - Skill: `<plugin-source>/skills/<name>/SKILL.md`.
   - Agent: `<plugin-source>/agents/<name>.md`.
   Use real skill directories with linked files, not symlinked skill directories.
   For directory-based skills, also map any bundled resources at their expected
   relative paths. Check that file references still resolve from the plugin layout.
2. Check every destination and its parent directories before writing. A symlink
   already resolving to the intended source is a no-op. A different link, broken
   link, regular file, or conflicting directory is a conflict; report it and ask
   before replacement. Do not write through a symlinked parent outside the target
   plugin or overwrite canonical source files. Do not remove unrelated plugin items.
3. Inspect current catalog discovery, installer copying, and package handling for
   the planned link types. If a known support gap prevents discovery or a portable
   install, report the exact blocker before editing. Do not substitute copies or
   expand this command into installer repairs.
4. Create missing destination directories and relative symlinks. Calculate each
   target from the link's parent directory, not the shell's working directory.
   Quote paths and use Linux/macOS-compatible tools. Keep shared source content
   unchanged.
5. If plugin contents changed, increase only that plugin's marketplace version
   once, following repo release rules; use a patch bump unless another increment
   is required. Keep versions out of `plugin.json`. A no-op does not bump a version.

## Verify

- Resolve every new or reused link and confirm it reaches the expected source.
  Check that every required dependency is present under the target plugin.
- Run `node bin/agent-framework.mjs list`. Confirm all requested and dependent
  items appear under the target plugin; a successful exit with missing items fails.
- Run `npm run lint`, `npm test`, `npm run doctor`,
  `npm run validate:repository`, and `npm pack --dry-run`.
- Check package contents, not just the pack exit status: required definitions and
  resources must survive packaging. Raw symlinks can be omitted from npm packages.
- Where link support needs verification, use a temporary catalog and isolated
  installation home/config. Confirm installed files remain readable without the
  source checkout or package cache. Never test against the user's live installation.
- Report any failed or blocked check honestly. Inspect the final scoped changes;
  do not commit or push as part of this command.

## Result

Briefly report the source, plugin, created links, already-correct links, any
version change, and checks with their results. Include conflicts or missing
support and the exact next action when blocked. For a no-op, say so explicitly.
