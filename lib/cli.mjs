import process from "node:process";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { parseAgent } from "./agents.mjs";
import { agentPath, defaultCatalogRoot, listAgents, listPlugins, listSkills, pluginMetadata, skillPath } from "./catalog.mjs";
import { install, uninstall, update } from "./installer.mjs";
import { targetIds, targetLabel } from "./targets.mjs";
import { inspectPath } from "./files.mjs";

const help = `Usage: agent-framework <command> [options]

Commands:
  install       Install skills and agents into selected environments.
  update        Update previously installed plugins from this catalog.
  uninstall     Remove files previously installed by this CLI.
  list          List discovered plugins and their catalog contents.
  doctor        Validate catalog metadata.

Options:
  --target <ids>       Comma-separated targets: ${targetIds.join(", ")}, all
  --scope <scope>      global or project
  --components <kind>  skills, agents, or all (default)
  --plugins <names>    Comma-separated plugin names, or all
  --skills <names>     Comma-separated skill names, or all
  --agents <names>     Comma-separated agent names, or all
  --yes                Skip interactive prompts
  --force              Replace or remove modified catalog files
  --help               Show this message
`;

function parseArguments(argv) {
  const firstArgumentIsOption = argv[0]?.startsWith("--");
  const options = { command: firstArgumentIsOption ? "help" : (argv[0] ?? "help") };
  for (let index = firstArgumentIsOption ? 0 : 1; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--yes" || argument === "--force" || argument === "--help") {
      options[argument.slice(2)] = true;
      continue;
    }
    if (!argument.startsWith("--")) throw new Error(`unexpected argument: ${argument}`);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`${argument} requires a value`);
    options[argument.slice(2)] = value;
    index += 1;
  }
  return options;
}

function split(value) {
  return value?.split(",").map((item) => item.trim()).filter(Boolean);
}

async function ask(question, choices) {
  process.stdout.write(`${question}\n${choices.map((choice, index) => `  ${index + 1}. ${choice}`).join("\n")}\n> `);
  const response = await new Promise((resolve) => process.stdin.once("data", (data) => resolve(data.toString().trim())));
  const selected = response.split(",").map((value) => Number(value.trim()) - 1);
  if (selected.some((index) => !Number.isInteger(index) || !choices[index])) throw new Error("invalid selection");
  return selected.map((index) => choices[index]);
}

async function interactiveOptions(options, catalogRoot) {
  if (options.yes) return options;
  if (!process.stdin.isTTY) throw new Error("non-interactive installs require --yes, --target, and --scope");

  if (!options.target) {
    const labels = targetIds.map((target) => `${target} (${targetLabel(target)})`);
    const answers = await ask("Select environments (comma-separated numbers):", labels);
    options.target = answers.map((answer) => answer.slice(0, answer.indexOf(" "))).join(",");
  }
  if (!options.scope) {
    const [scope] = await ask("Select installation scope:", ["global", "project"]);
    options.scope = scope;
  }
  if (!options.components) {
    const [components] = await ask("Select catalog components:", ["skills", "agents", "all"]);
    options.components = components;
  }
  if (!options.plugins) {
    const plugins = await listPlugins(catalogRoot);
    if (plugins.length > 1) {
      const answers = await ask("Select plugins (comma-separated numbers):", plugins);
      options.plugins = answers.join(",");
    }
  }
  return options;
}

async function doctor(catalogRoot) {
  const failures = [];
  for (const plugin of await listPlugins(catalogRoot)) {
    const { manifest, marketplaceEntry } = await pluginMetadata(plugin, catalogRoot);
    if (manifest.name !== plugin) failures.push(`plugin ${plugin}: name must match directory`);
    if (manifest.version) failures.push(`plugin ${plugin}: version belongs in marketplace.json`);
    if (!marketplaceEntry?.version) failures.push(`plugin ${plugin}: missing marketplace version`);

    for (const skill of await listSkills(plugin, catalogRoot)) {
      await inspectPath(await skillPath(plugin, skill, catalogRoot));
      const source = await readFile(join(await skillPath(plugin, skill, catalogRoot), "SKILL.md"), "utf8");
      const match = source.match(/^---\n([\s\S]*?)\n---/);
      const frontmatter = match?.[1] ?? "";
      if (!/^name:\s*[^\s]+\s*$/m.test(frontmatter)) failures.push(`plugin ${plugin}, skill ${skill}: missing name`);
      if (!new RegExp(`^name:\\s*${skill}\\s*$`, "m").test(frontmatter)) failures.push(`plugin ${plugin}, skill ${skill}: name must match directory`);
      if (!/^description:\s*\S/m.test(frontmatter)) failures.push(`plugin ${plugin}, skill ${skill}: missing description`);
    }
    for (const agent of await listAgents(plugin, catalogRoot)) {
      try {
        const { frontmatter } = parseAgent(await readFile(await agentPath(plugin, agent, catalogRoot), "utf8"));
        if (frontmatter.name !== agent) failures.push(`plugin ${plugin}, agent ${agent}: name must match filename`);
        if (!frontmatter.description) failures.push(`plugin ${plugin}, agent ${agent}: missing description`);
      } catch (error) {
        failures.push(`plugin ${plugin}, agent ${agent}: ${error.message}`);
      }
    }
  }
  if (failures.length) throw new Error(failures.join("\n"));
  console.log("Catalog metadata is valid.");
}

export async function run(argv, environment = {}) {
  const options = parseArguments(argv);
  const home = environment.home ?? process.env.HOME;
  const cwd = environment.cwd ?? process.cwd();
  if (!home) throw new Error("HOME is required");
  const configDir = environment.configDir ?? process.env.XDG_CONFIG_HOME ?? join(home, ".config");
  const catalogRoot = environment.catalogRoot ?? defaultCatalogRoot;

  if (options.help || options.command === "help") {
    console.log(help);
    return;
  }
  if (options.command === "list") {
    const plugins = await listPlugins(catalogRoot);
    if (plugins.length === 0) console.log("Plugins:\n  (none)");
    for (const plugin of plugins) {
      const { marketplaceEntry } = await pluginMetadata(plugin, catalogRoot);
      console.log(`${plugin}${marketplaceEntry?.version ? ` v${marketplaceEntry.version}` : ""}`);
      console.log(`  Skills: ${(await listSkills(plugin, catalogRoot)).join(", ") || "(none)"}`);
      console.log(`  Agents: ${(await listAgents(plugin, catalogRoot)).join(", ") || "(none)"}`);
    }
    return;
  }
  if (options.command === "doctor") return doctor(catalogRoot);
  if (options.command === "update") {
    if (options.scope && !["global", "project"].includes(options.scope)) throw new Error("--scope must be global or project");
    const paths = await update({
      home,
      cwd,
      configDir,
      catalogRoot,
      scope: options.scope,
      targets: split(options.target),
      plugins: split(options.plugins),
      force: options.force,
    });
    console.log(`Updated ${paths.length} catalog item(s).`);
    return;
  }
  if (options.command === "install" && !options.yes && (!options.target || !options.scope || !options.components)) {
    await interactiveOptions(options, catalogRoot);
  }
  if (!options.scope || !["global", "project"].includes(options.scope)) throw new Error("--scope must be global or project");
  if (!["skills", "agents", "all", undefined].includes(options.components)) throw new Error("--components must be skills, agents, or all");
  const installOptions = {
    home,
    cwd,
    configDir,
    catalogRoot,
    scope: options.scope,
    targets: split(options.target),
    components: options.components,
    plugins: split(options.plugins),
    skills: split(options.skills),
    agents: split(options.agents),
    force: options.force,
  };
  if (options.command === "install") {
    if (!options.target && options.yes) throw new Error("--target is required with --yes");
    const paths = await install(installOptions);
    console.log(`Installed ${paths.length} catalog item(s).`);
    return;
  }
  if (options.command === "uninstall") {
    if (!options.target) throw new Error("--target is required for uninstall");
    const paths = await uninstall(installOptions);
    console.log(`Removed ${paths.length} catalog item(s).`);
    return;
  }
  throw new Error(`unknown command: ${options.command}`);
}
