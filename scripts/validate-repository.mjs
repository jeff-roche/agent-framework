import { execFileSync } from "node:child_process";
import { access, readFile, readdir, stat } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseAgent } from "../lib/agents.mjs";
import { inspectPath } from "../lib/files.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const marketplacePath = join(root, ".claude-plugin", "marketplace.json");
const pluginName = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const semver = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function sourceDirectory(entry) {
  if (typeof entry.source !== "string" || !entry.source.startsWith("./")) {
    throw new Error(`plugin ${entry.name}: source must be a local ./ path`);
  }
  const directory = resolve(root, entry.source);
  if (relative(root, directory).startsWith("..")) throw new Error(`plugin ${entry.name}: source must stay inside the repository`);
  return directory;
}

function compareVersions(left, right) {
  const leftMatch = left.match(semver);
  const rightMatch = right.match(semver);
  if (!leftMatch || !rightMatch) throw new Error("cannot compare invalid semantic versions");

  for (let index = 1; index <= 3; index += 1) {
    const difference = Number(leftMatch[index]) - Number(rightMatch[index]);
    if (difference !== 0) return Math.sign(difference);
  }
  const leftPreRelease = leftMatch[4];
  const rightPreRelease = rightMatch[4];
  if (!leftPreRelease && !rightPreRelease) return 0;
  if (!leftPreRelease) return 1;
  if (!rightPreRelease) return -1;

  const leftIdentifiers = leftPreRelease.split(".");
  const rightIdentifiers = rightPreRelease.split(".");
  for (let index = 0; index < Math.max(leftIdentifiers.length, rightIdentifiers.length); index += 1) {
    const leftIdentifier = leftIdentifiers[index];
    const rightIdentifier = rightIdentifiers[index];
    if (leftIdentifier === undefined) return -1;
    if (rightIdentifier === undefined) return 1;
    if (leftIdentifier === rightIdentifier) continue;
    const leftNumber = /^\d+$/.test(leftIdentifier);
    const rightNumber = /^\d+$/.test(rightIdentifier);
    if (leftNumber && rightNumber) return Math.sign(Number(leftIdentifier) - Number(rightIdentifier));
    if (leftNumber) return -1;
    if (rightNumber) return 1;
    return leftIdentifier.localeCompare(rightIdentifier);
  }
  return 0;
}

function changedFiles(base) {
  if (!base || /^0+$/.test(base)) return [];
  try {
    return execFileSync("git", ["diff", "--name-only", base, "HEAD"], { cwd: root, encoding: "utf8" })
      .split("\n")
      .filter(Boolean);
  } catch {
    return [];
  }
}

function marketplaceAtRevision(base) {
  if (!base || /^0+$/.test(base)) return null;
  try {
    return JSON.parse(execFileSync("git", ["show", `${base}:.claude-plugin/marketplace.json`], { cwd: root, encoding: "utf8" }));
  } catch {
    return null;
  }
}

async function validatePluginContents(entry, failures) {
  let directory;
  try {
    directory = sourceDirectory(entry);
    await inspectPath(directory);
  } catch (error) {
    failures.push(error.message);
    return;
  }

  const manifestPath = join(directory, ".claude-plugin", "plugin.json");
  if (!(await exists(manifestPath))) {
    failures.push(`plugin ${entry.name}: missing ${relative(root, manifestPath)}`);
    return;
  }

  let manifest;
  try {
    manifest = await readJson(manifestPath);
  } catch (error) {
    failures.push(`plugin ${entry.name}: invalid plugin.json (${error.message})`);
    return;
  }
  if (manifest.name !== entry.name) failures.push(`plugin ${entry.name}: plugin.json name must match marketplace name`);
  if ("version" in manifest) failures.push(`plugin ${entry.name}: version belongs in marketplace.json`);
  if (!manifest.description) failures.push(`plugin ${entry.name}: plugin.json requires a description`);

  const skillsDirectory = join(directory, "skills");
  if (await exists(skillsDirectory)) {
    for (const skill of await readdir(skillsDirectory, { withFileTypes: true })) {
      const info = skill.isSymbolicLink() ? await stat(join(skillsDirectory, skill.name)) : skill;
      if (!info.isDirectory()) continue;
      const skillPath = join(skillsDirectory, skill.name, "SKILL.md");
      if (!(await exists(skillPath))) {
        failures.push(`plugin ${entry.name}, skill ${skill.name}: missing SKILL.md`);
        continue;
      }
      const source = await readFile(skillPath, "utf8");
      const frontmatter = source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
      if (!new RegExp(`^name:\\s*${skill.name}\\s*$`, "m").test(frontmatter)) {
        failures.push(`plugin ${entry.name}, skill ${skill.name}: name must match directory`);
      }
      if (!/^description:\s*\S/m.test(frontmatter)) failures.push(`plugin ${entry.name}, skill ${skill.name}: missing description`);
    }
  }

  const agentsDirectory = join(directory, "agents");
  if (await exists(agentsDirectory)) {
    for (const agent of await readdir(agentsDirectory, { withFileTypes: true })) {
      if (!agent.name.endsWith(".md")) continue;
      const info = agent.isSymbolicLink() ? await stat(join(agentsDirectory, agent.name)) : agent;
      if (!info.isFile()) continue;
      const name = agent.name.slice(0, -3);
      try {
        const { frontmatter } = parseAgent(await readFile(join(agentsDirectory, agent.name), "utf8"));
        if (frontmatter.name !== name) failures.push(`plugin ${entry.name}, agent ${name}: name must match filename`);
        if (!frontmatter.description) failures.push(`plugin ${entry.name}, agent ${name}: missing description`);
      } catch (error) {
        failures.push(`plugin ${entry.name}, agent ${name}: ${error.message}`);
      }
    }
  }
}

const failures = [];
const marketplace = await readJson(marketplacePath);
if (!pluginName.test(marketplace.name ?? "")) failures.push("marketplace: name must be lowercase kebab-case");
if (!marketplace.description) failures.push("marketplace: missing description");
if (!marketplace.owner?.name) failures.push("marketplace: owner.name is required");
if (!Array.isArray(marketplace.plugins) || marketplace.plugins.length === 0) failures.push("marketplace: plugins must be a non-empty array");

const names = new Set();
const sources = new Set();
for (const entry of marketplace.plugins ?? []) {
  if (!pluginName.test(entry.name ?? "")) failures.push(`plugin ${entry.name ?? "(unnamed)"}: name must be lowercase kebab-case`);
  if (names.has(entry.name)) failures.push(`plugin ${entry.name}: duplicate marketplace name`);
  names.add(entry.name);
  if (typeof entry.source === "string" && sources.has(entry.source)) failures.push(`plugin ${entry.name}: duplicate marketplace source`);
  sources.add(entry.source);
  if (!semver.test(entry.version ?? "")) failures.push(`plugin ${entry.name}: version must be valid semantic versioning`);
  await validatePluginContents(entry, failures);
}

for (const entry of await readdir(root, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const manifestPath = join(root, entry.name, ".claude-plugin", "plugin.json");
  if ((await exists(manifestPath)) && !sources.has(`./${entry.name}`)) {
    failures.push(`plugin directory ${entry.name}: missing marketplace.json entry`);
  }
}

const base = process.env.BASE_SHA;
const previousMarketplace = marketplaceAtRevision(base);
for (const entry of marketplace.plugins ?? []) {
  const previousEntry = previousMarketplace?.plugins?.find((plugin) => plugin.name === entry.name);
  if (!previousEntry) continue;
  let directory;
  try {
    directory = relative(root, sourceDirectory(entry));
  } catch {
    continue;
  }
  if (changedFiles(base).some((file) => file === directory || file.startsWith(`${directory}/`))) {
    if (compareVersions(entry.version, previousEntry.version) <= 0) {
      failures.push(`plugin ${entry.name}: source changed without a version bump above ${previousEntry.version}`);
    }
  }
}

if (failures.length) throw new Error(failures.join("\n"));
console.log("Repository structure and marketplace metadata are valid.");
