import { join } from "node:path";

export const targetIds = ["claude-code", "opencode", "codex", "cursor", "vscode", "zed"];

export function destinationFor(target, scope, home, cwd, configDir = join(home, ".config")) {
  const root = scope === "global" ? home : cwd;
  const global = scope === "global";

  switch (target) {
    case "claude-code":
      return { skills: join(root, ".claude", "skills"), agents: join(root, ".claude", "agents") };
    case "opencode":
      return {
        skills: join(root, ".agents", "skills"),
        agents: global ? join(configDir, "opencode", "agents") : join(root, ".opencode", "agents"),
      };
    case "codex":
      return { skills: join(root, ".agents", "skills"), agents: join(root, ".codex", "agents") };
    case "cursor":
      return { skills: join(root, ".agents", "skills"), agents: join(root, ".cursor", "agents") };
    case "vscode":
      return {
        skills: join(root, global ? ".agents" : ".agents", "skills"),
        agents: join(root, global ? ".copilot" : ".github", "agents"),
      };
    case "zed":
      return { skills: join(root, ".agents", "skills"), agents: null };
    default:
      throw new Error(`unknown target: ${target}`);
  }
}

export function targetLabel(target) {
  return {
    "claude-code": "Claude Code",
    opencode: "OpenCode",
    codex: "Codex",
    cursor: "Cursor",
    vscode: "VS Code",
    zed: "Zed",
  }[target];
}
