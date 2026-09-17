function parseScalar(value) {
  const trimmed = value.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if ((trimmed.startsWith("\"") && trimmed.endsWith("\"")) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function parseAgent(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error("agent must begin with YAML frontmatter");

  const frontmatter = {};
  for (const line of match[1].split("\n")) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1);
    if (key) frontmatter[key] = parseScalar(value);
  }

  return { frontmatter, body: match[2] };
}

function isReadOnly(frontmatter) {
  if (frontmatter.readonly === true) return true;
  const disallowed = String(frontmatter.disallowedTools ?? "").toLowerCase();
  return /\b(write|edit)\b/.test(disallowed);
}

function yamlQuote(value) {
  return JSON.stringify(String(value));
}

function tomlQuote(value) {
  return JSON.stringify(String(value));
}

export function renderAgent(source, target) {
  const { frontmatter, body } = parseAgent(source);
  const name = frontmatter.name;
  const description = frontmatter.description;
  if (!name || !description) throw new Error("agent frontmatter requires name and description");

  const readonly = isReadOnly(frontmatter);
  if (target === "claude-code") return { content: source, extension: ".md" };

  if (target === "cursor") {
    const lines = ["---", `name: ${name}`, `description: ${yamlQuote(description)}`];
    if (frontmatter.model === "inherit") lines.push("model: inherit");
    if (readonly) lines.push("readonly: true");
    lines.push("---", body);
    return { content: lines.join("\n"), extension: ".md" };
  }

  if (target === "vscode") {
    const lines = ["---", `name: ${yamlQuote(name)}`, `description: ${yamlQuote(description)}`];
    if (readonly) lines.push("tools: ['search', 'web/fetch']");
    lines.push("---", body);
    return { content: lines.join("\n"), extension: ".agent.md" };
  }

  if (target === "opencode") {
    const lines = ["---", `description: ${yamlQuote(description)}`, `mode: ${frontmatter.mode ?? "subagent"}`];
    if (frontmatter.model && frontmatter.model !== "inherit") lines.push(`model: ${frontmatter.model}`);
    if (readonly) lines.push("permission:", "  edit: deny", "  bash: deny");
    lines.push("---", body);
    return { content: lines.join("\n"), extension: ".md" };
  }

  if (target === "codex") {
    const lines = [
      `name = ${tomlQuote(name)}`,
      `description = ${tomlQuote(description)}`,
    ];
    if (readonly) lines.push('sandbox_mode = "read-only"');
    lines.push(`developer_instructions = ${tomlQuote(body.trim())}`, "");
    return { content: lines.join("\n"), extension: ".toml" };
  }

  throw new Error(`unsupported agent target: ${target}`);
}
