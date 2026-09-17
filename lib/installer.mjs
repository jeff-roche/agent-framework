import { cp, lstat, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { renderAgent } from "./agents.mjs";
import { defaultCatalogRoot, listAgents, listPlugins, listSkills, readAgent, skillPath } from "./catalog.mjs";
import { destinationFor, targetIds } from "./targets.mjs";
import { hashPath, inspectPath } from "./files.mjs";

function statePath(configDir) {
  return join(configDir, "agent-framework", "installations.json");
}

function legacyStatePath(home) {
  return join(home, ".agent-framework", "installations.json");
}

async function pathExists(path) {
  try {
    await lstat(path);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

function hashContent(content) {
  return createHash("sha256").update("file\0").update(content).digest("hex");
}

function installationKey(scope, target, plugin) {
  return `${scope}:${target}:${plugin}`;
}

function migrateState(state) {
  if (state.version === 2) return { ...state, entries: state.entries ?? {}, installations: state.installations ?? {} };

  const installations = {};
  for (const entry of Object.values(state.entries ?? {})) {
    entry.plugin = "swe-toolkit";
    entry.owners = (entry.owners ?? []).map((owner) => `${owner}:swe-toolkit`);
    for (const owner of entry.owners) {
      const [scope, target] = owner.split(":");
      const key = installationKey(scope, target, entry.plugin);
      const installation = installations[key] ?? {
        scope,
        target,
        plugin: entry.plugin,
        skills: null,
        agents: null,
      };
      const selection = installation[entry.kind] ?? { all: false, names: [] };
      selection.names = [...new Set([...selection.names, entry.name])].sort();
      installation[entry.kind] = selection;
      installations[key] = installation;
    }
  }
  return { version: 2, entries: state.entries ?? {}, installations };
}

async function loadState(home, configDir = join(home, ".config")) {
  const path = statePath(configDir);
  if (await pathExists(path)) return migrateState(JSON.parse(await readFile(path, "utf8")));

  const legacyPath = legacyStatePath(home);
  if (await pathExists(legacyPath)) return migrateState(JSON.parse(await readFile(legacyPath, "utf8")));
  return { version: 2, entries: {}, installations: {} };
}

async function saveState(home, configDir, state) {
  const path = statePath(configDir ?? join(home, ".config"));
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(state, null, 2)}\n`);
}

function selected(values, available, kind) {
  if (!values || values.length === 0 || values.includes("all")) return available;
  const unknown = values.filter((value) => !available.includes(value));
  if (unknown.length) throw new Error(`unknown ${kind}: ${unknown.join(", ")}`);
  return [...new Set(values)];
}

function selectedTargets(targets) {
  const values = !targets || targets.length === 0 || targets.includes("all") ? targetIds : targets;
  const unknown = values.filter((value) => !targetIds.includes(value));
  if (unknown.length) throw new Error(`unknown target: ${unknown.join(", ")}`);
  return [...new Set(values)];
}

function selection(values, names) {
  return { all: !values || values.length === 0 || values.includes("all"), names };
}

function mergeSelection(current, next) {
  if (!current) return next;
  return {
    all: current.all || next.all,
    names: [...new Set([...current.names, ...next.names])].sort(),
  };
}

function recordInstallation(state, scope, target, plugin, kind, nextSelection) {
  if (nextSelection.names.length === 0) return;
  const key = installationKey(scope, target, plugin);
  const installation = state.installations[key] ?? {
    scope,
    target,
    plugin,
    skills: null,
    agents: null,
  };
  installation[kind] = mergeSelection(installation[kind], nextSelection);
  state.installations[key] = installation;
}

function assertPluginOwnership(existing, plugin, destination) {
  if (existing?.plugin && existing.plugin !== plugin) {
    throw new Error(`${destination} is already provided by plugin ${existing.plugin}`);
  }
}

async function prepareDestination(destination, sourceHash, existing, force, update) {
  if (!(await pathExists(destination))) return;
  if (!force) {
    const current = await inspectPath(destination);
    if (current.hash !== sourceHash) {
      if (!update || current.hash !== existing?.hash) {
        throw new Error(`${destination} already exists and differs; rerun with --force to replace it`);
      }
    } else if (!current.hasSymlinks) {
      return;
    } else if (current.hash !== existing?.hash) {
      throw new Error(`${destination} contains unowned or modified links; rerun with --force to replace it`);
    }
  }
  // Remove links themselves before copying, never write through them into the catalog.
  await rm(destination, { recursive: true, force: true });
}

async function writeOwnedEntry({ source, destination, owner, plugin, kind, name, state, force, update }) {
  const sourceHash = await hashPath(source);
  const existing = state.entries[destination];
  assertPluginOwnership(existing, plugin, destination);
  await prepareDestination(destination, sourceHash, existing, force, update);

  if (!(await pathExists(destination))) {
    await mkdir(dirname(destination), { recursive: true });
    await cp(source, destination, { recursive: true, dereference: true });
  }

  state.entries[destination] = {
    hash: sourceHash,
    plugin,
    kind,
    name,
    owners: [...new Set([...(existing?.owners ?? []), owner])].sort(),
  };
}

async function writeGeneratedEntry({ content, destination, owner, plugin, kind, name, state, force, update }) {
  const hash = hashContent(content);
  const existing = state.entries[destination];
  assertPluginOwnership(existing, plugin, destination);
  await prepareDestination(destination, hash, existing, force, update);

  if (!(await pathExists(destination))) {
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, content);
  }

  state.entries[destination] = {
    hash,
    plugin,
    kind,
    name,
    owners: [...new Set([...(existing?.owners ?? []), owner])].sort(),
  };
}

export async function install(options) {
  const catalogRoot = options.catalogRoot ?? defaultCatalogRoot;
  const components = options.components ?? "all";
  const plugins = selected(options.plugins, await listPlugins(catalogRoot), "plugin");
  const targets = selectedTargets(options.targets);
  const state = await loadState(options.home, options.configDir);
  const installed = [];

  for (const plugin of plugins) {
    const skills = components === "all" || components === "skills" ? selected(options.skills, await listSkills(plugin, catalogRoot), "skill") : [];
    const agents = components === "all" || components === "agents" ? selected(options.agents, await listAgents(plugin, catalogRoot), "agent") : [];
    for (const target of targets) {
      const owner = installationKey(options.scope, target, plugin);
      const destination = destinationFor(target, options.scope, options.home, options.cwd, options.configDir);
      if (components === "all" || components === "skills") {
        for (const skill of skills) {
          const output = join(destination.skills, skill);
          await writeOwnedEntry({ source: await skillPath(plugin, skill, catalogRoot), destination: output, owner, plugin, kind: "skills", name: skill, state, force: options.force, update: options.update });
          installed.push(output);
        }
        recordInstallation(state, options.scope, target, plugin, "skills", selection(options.skills, skills));
      }

      if ((components === "all" || components === "agents") && destination.agents) {
        for (const agent of agents) {
          const rendered = renderAgent(await readAgent(plugin, agent, catalogRoot), target);
          const output = join(destination.agents, `${agent}${rendered.extension}`);
          await writeGeneratedEntry({ content: rendered.content, destination: output, owner, plugin, kind: "agents", name: agent, state, force: options.force, update: options.update });
          installed.push(output);
        }
        recordInstallation(state, options.scope, target, plugin, "agents", selection(options.agents, agents));
      }
    }
  }

  await saveState(options.home, options.configDir, state);
  return installed;
}

function removeSelection(current, names) {
  if (!current) return null;
  if (!names || names.has("all")) return null;
  return { all: false, names: current.names.filter((name) => !names.has(name)) };
}

function removeInstallations(state, options, selectedPlugins, selectedSkills, selectedAgents) {
  for (const [key, installation] of Object.entries(state.installations)) {
    if (options.scope !== installation.scope) continue;
    if (!selectedTargets(options.targets).includes(installation.target)) continue;
    if (selectedPlugins && !selectedPlugins.has(installation.plugin)) continue;
    if (options.components === "all" || options.components === "skills") {
      installation.skills = removeSelection(installation.skills, selectedSkills);
    }
    if (options.components === "all" || options.components === "agents") {
      installation.agents = removeSelection(installation.agents, selectedAgents);
    }
    if (!installation.skills && !installation.agents) delete state.installations[key];
  }
}

export async function uninstall(options) {
  const state = await loadState(options.home, options.configDir);
  const targets = selectedTargets(options.targets);
  const removed = [];
  const components = options.components ?? "all";
  const selectedPlugins = options.plugins ? new Set(options.plugins) : null;
  const selectedSkills = options.skills ? new Set(options.skills) : null;
  const selectedAgents = options.agents ? new Set(options.agents) : null;

  for (const [path, entry] of Object.entries(state.entries)) {
    if (components !== "all" && entry.kind !== components) continue;
    if (selectedPlugins && !selectedPlugins.has("all") && !selectedPlugins.has(entry.plugin)) continue;
    if (entry.kind === "skills" && selectedSkills && !selectedSkills.has("all") && !selectedSkills.has(entry.name)) continue;
    if (entry.kind === "agents" && selectedAgents && !selectedAgents.has("all") && !selectedAgents.has(entry.name)) continue;
    const ownersToRemove = new Set(targets.map((target) => installationKey(options.scope, target, entry.plugin)));
    const remaining = (entry.owners ?? []).filter((owner) => !ownersToRemove.has(owner));
    if (remaining.length === entry.owners.length) continue;
    if (remaining.length) {
      entry.owners = remaining;
      continue;
    }

    if (await pathExists(path)) {
      if (!options.force && (await hashPath(path)) !== entry.hash) {
        throw new Error(`${path} was modified after installation; rerun with --force to remove it`);
      }
      await rm(path, { recursive: true, force: true });
      removed.push(path);
    }
    delete state.entries[path];
  }

  removeInstallations(state, { ...options, components }, selectedPlugins, selectedSkills, selectedAgents);
  await saveState(options.home, options.configDir, state);
  return removed;
}

export async function update(options) {
  const state = await loadState(options.home, options.configDir);
  const targets = options.targets ? new Set(selectedTargets(options.targets)) : null;
  const plugins = options.plugins ? new Set(options.plugins) : null;
  const installations = Object.values(state.installations)
    .filter((installation) => !options.scope || installation.scope === options.scope)
    .filter((installation) => !targets || targets.has(installation.target))
    .filter((installation) => !plugins || plugins.has("all") || plugins.has(installation.plugin));
  const updated = [];

  for (const installation of installations) {
    const components = installation.skills && installation.agents ? "all" : (installation.skills ? "skills" : "agents");
    const paths = await install({
      ...options,
      scope: installation.scope,
      targets: [installation.target],
      plugins: [installation.plugin],
      components,
      skills: installation.skills?.all ? ["all"] : installation.skills?.names,
      agents: installation.agents?.all ? ["all"] : installation.agents?.names,
      update: true,
    });
    updated.push(...paths);
  }
  return updated;
}

export async function installedEntries(home) {
  return loadState(home);
}
