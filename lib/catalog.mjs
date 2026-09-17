import { existsSync } from "node:fs";
import { lstat, readdir, readFile, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
export const defaultCatalogRoot = existsSync(join(packageRoot, ".claude-plugin", "marketplace.json"))
  ? packageRoot
  : join(packageRoot, ".agent-framework-catalog");

async function exists(path) {
  try {
    await lstat(path);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function listDirectoriesContaining(root, filename) {
  if (!(await exists(root))) return [];

  const entries = await readdir(root, { withFileTypes: true });
  const names = [];
  for (const entry of entries) {
    const path = join(root, entry.name);
    const info = entry.isSymbolicLink() ? await stat(path) : entry;
    if (!info.isDirectory()) continue;
    const definition = join(path, filename);
    if ((await exists(definition)) && (await stat(definition)).isFile()) names.push(entry.name);
  }
  return names.sort();
}

export async function marketplace(catalogRoot = defaultCatalogRoot) {
  const path = join(catalogRoot, ".claude-plugin", "marketplace.json");
  return (await exists(path)) ? readJson(path) : { plugins: [] };
}

async function marketplaceEntry(name, catalogRoot) {
  const market = await marketplace(catalogRoot);
  const entry = (market.plugins ?? []).find((plugin) => plugin.name === name);
  if (!entry) throw new Error(`plugin ${name} is not declared in .claude-plugin/marketplace.json`);
  return entry;
}

export async function listPlugins(catalogRoot = defaultCatalogRoot) {
  const market = await marketplace(catalogRoot);
  const names = (market.plugins ?? []).map((plugin) => plugin.name).filter(Boolean);
  return [...new Set(names)].sort();
}

export async function pluginPath(name, catalogRoot = defaultCatalogRoot) {
  const entry = await marketplaceEntry(name, catalogRoot);
  if (typeof entry.source !== "string" || !entry.source.startsWith("./")) {
    throw new Error(`plugin ${name} must use a local ./ source in marketplace.json`);
  }

  const root = resolve(catalogRoot);
  const source = resolve(root, entry.source);
  if (!source.startsWith(`${root}/`)) throw new Error(`plugin ${name} source must be inside the catalog`);
  return source;
}

export async function pluginManifestPath(name, catalogRoot = defaultCatalogRoot) {
  return join(await pluginPath(name, catalogRoot), ".claude-plugin", "plugin.json");
}

export async function pluginMetadata(name, catalogRoot = defaultCatalogRoot) {
  const [manifestPath, entry] = await Promise.all([
    pluginManifestPath(name, catalogRoot),
    marketplaceEntry(name, catalogRoot),
  ]);
  return { manifest: await readJson(manifestPath), marketplaceEntry: entry };
}

export async function listSkills(plugin, catalogRoot = defaultCatalogRoot) {
  return listDirectoriesContaining(join(await pluginPath(plugin, catalogRoot), "skills"), "SKILL.md");
}

export async function listAgents(plugin, catalogRoot = defaultCatalogRoot) {
  const root = join(await pluginPath(plugin, catalogRoot), "agents");
  if (!(await exists(root))) return [];

  const entries = await readdir(root, { withFileTypes: true });
  const names = [];
  for (const entry of entries) {
    if (!entry.name.endsWith(".md")) continue;
    const info = entry.isSymbolicLink() ? await stat(join(root, entry.name)) : entry;
    if (info.isFile()) names.push(entry.name.slice(0, -3));
  }
  return names.sort();
}

export async function skillPath(plugin, name, catalogRoot = defaultCatalogRoot) {
  return join(await pluginPath(plugin, catalogRoot), "skills", name);
}

export async function agentPath(plugin, name, catalogRoot = defaultCatalogRoot) {
  return join(await pluginPath(plugin, catalogRoot), "agents", `${name}.md`);
}

export async function readAgent(plugin, name, catalogRoot = defaultCatalogRoot) {
  return readFile(await agentPath(plugin, name, catalogRoot), "utf8");
}
