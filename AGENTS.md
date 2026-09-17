# Repository Guidance

This repository distributes portable skills and specialized agents through a
Claude Code marketplace and a Node CLI. Keep changes small, portable, and
compatible with the supported targets: Claude Code, OpenCode, Codex, Cursor,
VS Code, and Zed.

## Catalog Structure

- `.claude-plugin/marketplace.json` is the authoritative plugin registry.
- Each marketplace entry requires a unique kebab-case `name`, a local `./`
  `source`, a semantic `version`, and a matching plugin directory.
- Every plugin directory contains `.claude-plugin/plugin.json`; its `name`
  must match the marketplace entry and it must not declare `version`.
- Store portable skills in `<plugin>/skills/<skill-name>/SKILL.md`.
- Store canonical agent definitions in `<plugin>/agents/<agent-name>.md`.
- Skill and agent names must match their containing directory or filename.

## Versioning And Releases

- When changing files beneath a registered plugin source, increase that
  plugin's version in `.claude-plugin/marketplace.json` in the same change.
- Do not change a plugin version for unrelated repository changes.
- Updating `package.json` on `main` triggers the release workflow, which tags
  `v<package-version>` and creates a GitHub Release.

## Installer Changes

- Keep `.claude-plugin/marketplace.json` as the source of installable plugins.
- Preserve non-destructive behavior: never overwrite or remove user-modified
  installed files unless the user explicitly requests `--force`.
- Keep the installer state under `$XDG_CONFIG_HOME/agent-framework/`, falling
  back to `~/.config/agent-framework/`.
- Do not add Windows-specific behavior; this project supports Linux and macOS.

## Validation

Run the relevant checks before completing a change:

```bash
npm run lint
npm test
npm run doctor
npm run validate:repository
```

Use `npm pack --dry-run` when changing package contents, `.npmignore`, or the
GitHub `npx` installation path.
