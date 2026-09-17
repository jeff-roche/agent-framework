# agent-framework

Portable skills and specialized agents for day-to-day software engineering.

## Plugins

- [`swe-toolkit`](toolkits/swe/README.md): plan, build, test, review, and deliver software changes.
- [`docs-toolkit`](toolkits/docs/README.md): write, review, and publish documentation.
- [`quality-toolkit`](toolkits/quality/README.md): investigate bugs, improve test coverage, and validate behavior.
- [`full-agent-framework`](toolkits/everything/README.md): every agent, workflow, task, and guideline.

## Install

Install a released package on macOS or Linux:

```bash
npx https://github.com/jeff-roche/agent-framework/releases/download/v<version>/agent-framework-<version>.tgz install
```

The installer interactively selects environments, global or project scope, and
whether to install skills, agents, or both. For scripting, provide every choice:

```bash
npx https://github.com/jeff-roche/agent-framework/releases/download/v<version>/agent-framework-<version>.tgz install \
  --target claude-code,opencode,codex,cursor,vscode,zed \
  --plugins swe-toolkit \
  --scope global \
  --components all \
  --yes
```

Supported targets are Claude Code, OpenCode, Codex, Cursor, VS Code with
GitHub Copilot, and Zed. Zed receives portable skills. To use specialized
agents inside Zed, run Claude Code, Codex, or OpenCode as a Zed ACP external
agent.

Use the release tarball for repeatable installations:

```bash
npx https://github.com/jeff-roche/agent-framework/releases/download/v<version>/agent-framework-<version>.tgz install
```

### Install with `npx skills ...`

Skills can also be installed without agents through
[skills.sh](https://skills.sh):

```bash
npx skills add jeff-roche/agent-framework
```

### Claude Code Plugin

Claude Code users can install a plugin directly from this repository's
marketplace without using the CLI. Run these commands inside Claude Code:

```text
/plugin marketplace add jeff-roche/agent-framework
/plugin install swe-toolkit@agent-framework
```

To receive a newer plugin version after the marketplace is updated:

```text
/plugin marketplace update agent-framework
/plugin update swe-toolkit@agent-framework
```

## CLI Commands

```bash
# Inspect the catalog.
npx https://github.com/jeff-roche/agent-framework/releases/download/v<version>/agent-framework-<version>.tgz list

# Validate skill and agent metadata.
npx https://github.com/jeff-roche/agent-framework/releases/download/v<version>/agent-framework-<version>.tgz doctor

# Update every installed plugin from the current catalog version.
npx https://github.com/jeff-roche/agent-framework/releases/download/v<version>/agent-framework-<version>.tgz update

# Update one installed plugin only.
npx https://github.com/jeff-roche/agent-framework/releases/download/v<version>/agent-framework-<version>.tgz update --plugins swe-toolkit

# Remove catalog files owned by one target and scope.
npx https://github.com/jeff-roche/agent-framework/releases/download/v<version>/agent-framework-<version>.tgz uninstall \
  --target codex \
  --scope global \
  --yes
```

The installer records every managed path in
`$XDG_CONFIG_HOME/agent-framework/installations.json`, falling back to
`~/.config/agent-framework/installations.json` when `XDG_CONFIG_HOME` is unset.
It will not replace or remove changed files unless `--force` is passed.

## Authoring

The installer reads `.claude-plugin/marketplace.json` to determine which
plugins are available. Skills live in `<plugin>/skills/<name>/SKILL.md` and follow the
[Agent Skills specification](https://agentskills.io/specification). Each skill
must use a lowercase kebab-case folder and matching `name` frontmatter.

Plugin skill files, resource files, and agent definitions may be relative
symlinks to shared sources elsewhere in this repository. The installer follows
those links and writes independent files, so installed content does not depend
on the checkout or npm cache. Broken or cyclic links fail validation.

Plugin agent definitions live in `<plugin>/agents/<name>.md` in
Claude-compatible Markdown. They may link to shared canonical agents in
`agents/`. The installer renders equivalent agent definitions for OpenCode,
Codex, Cursor, and VS Code. Keep canonical agents to the portable subset:
`name`, `description`, `model: inherit`, and read-only intent through
`disallowedTools: Write, Edit`. Specific model IDs are vendor-specific and
should be configured in target-local overrides.

Add every plugin to `.claude-plugin/marketplace.json` with its release version
and local `source` path.
The plugin's own manifest intentionally has no `version`; `npm run doctor`
enforces this convention. Marketplace entries expose those plugins through the
native Claude Code marketplace, while the installer uses the same registry.

For npm package builds, `prepare` and `prepack` build
`.agent-framework-catalog/` from the registered plugins. This ignored directory
contains plain copies of linked content and the marketplace registry. Packages
use that snapshot; local CLI runs use the live repository catalog. Do not edit
the generated snapshot.

## Development

```bash
npm run lint
npm test
npm run doctor
npm run validate:repository
```

## Releases

Push a `vX.Y.Z` tag to start the release workflow. It validates the tagged
source, builds the package tarball, and attaches it to the GitHub Release.
The release-tag commands below only apply the version tag and floating
`latest` tag. GitHub Actions creates the release.

```bash
# Update package.json and commit it on main, then run the release-tag command.
```

In Claude Code, run this after updating `package.json`:

```text
/release-tag
```

In OpenCode, run:

```text
/release-tag
```
