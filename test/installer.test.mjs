import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cp, lstat, mkdir, mkdtemp, readFile, readdir, rename, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { run } from "../lib/cli.mjs";
import { listAgents, listPlugins, listSkills } from "../lib/catalog.mjs";
import { install, uninstall, update } from "../lib/installer.mjs";
import { prepareCatalog } from "../lib/packaging.mjs";

const catalogRoot = join(dirname(fileURLToPath(import.meta.url)), "fixtures", "catalog");
const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

async function linkedCatalog(temp) {
  const root = join(temp.root, "catalog");
  await cp(catalogRoot, root, { recursive: true });
  const shared = join(root, "shared");
  await mkdir(shared);
  const skill = join(root, "reviewer-toolkit", "skills", "example-skill", "SKILL.md");
  const agent = join(root, "reviewer-toolkit", "agents", "reviewer.md");
  for (const path of [skill, agent]) {
    const source = join(shared, path === skill ? "skill.md" : "agent.md");
    await rename(path, source);
    await symlink(relative(dirname(path), source), path);
  }
  const resources = join(shared, "references");
  await mkdir(resources);
  await writeFile(join(resources, "guide.md"), "Shared guide.\n");
  const resourceLink = join(dirname(skill), "references");
  await symlink(relative(dirname(resourceLink), resources), resourceLink);
  return { root, shared, skill, agent };
}

async function workspace() {
  const root = await mkdtemp(join(tmpdir(), "agent-framework-"));
  return {
    root,
    home: join(root, "home"),
    configDir: join(root, "xdg-config"),
    cwd: join(root, "project"),
    async cleanup() {
      await rm(root, { recursive: true, force: true });
    },
  };
}

function options(temp, overrides = {}) {
  return {
    home: temp.home,
    configDir: temp.configDir,
    cwd: temp.cwd,
    catalogRoot,
    scope: "global",
    targets: ["all"],
    components: "all",
    ...overrides,
  };
}

test("discovers only plugins declared in the marketplace", async () => {
  assert.deepEqual(await listPlugins(catalogRoot), ["reviewer-toolkit", "second-toolkit"]);
});

test("installs portable skills and adapted agents for every target", async () => {
  const temp = await workspace();
  try {
    const installed = await install(options(temp));
    assert.equal(installed.length, 11);

    await readFile(join(temp.home, ".claude", "skills", "example-skill", "SKILL.md"));
    await readFile(join(temp.home, ".agents", "skills", "example-skill", "SKILL.md"));
    await readFile(join(temp.home, ".claude", "agents", "reviewer.md"));
    await readFile(join(temp.configDir, "opencode", "agents", "reviewer.md"));
    await readFile(join(temp.home, ".codex", "agents", "reviewer.toml"));
    await readFile(join(temp.home, ".cursor", "agents", "reviewer.md"));
    await readFile(join(temp.home, ".copilot", "agents", "reviewer.agent.md"));

    const codexAgent = await readFile(join(temp.home, ".codex", "agents", "reviewer.toml"), "utf8");
    assert.match(codexAgent, /sandbox_mode = "read-only"/);
    const opencodeAgent = await readFile(join(temp.configDir, "opencode", "agents", "reviewer.md"), "utf8");
    assert.match(opencodeAgent, /permission:\n  edit: deny/);
    await readFile(join(temp.configDir, "agent-framework", "installations.json"));
  } finally {
    await temp.cleanup();
  }
});

test("does not overwrite a modified installed item without force", async () => {
  const temp = await workspace();
  try {
    await install(options(temp, { targets: ["claude-code"] }));
    const installedSkill = join(temp.home, ".claude", "skills", "example-skill", "SKILL.md");
    await writeFile(installedSkill, "modified\n");

    await assert.rejects(install(options(temp, { targets: ["claude-code"] })), /differs/);
    await install(options(temp, { targets: ["claude-code"], force: true }));
    assert.match(await readFile(installedSkill, "utf8"), /name: example-skill/);
  } finally {
    await temp.cleanup();
  }
});

test("preserves shared portable skills until every target is uninstalled", async () => {
  const temp = await workspace();
  const sharedSkill = join(temp.home, ".agents", "skills", "example-skill", "SKILL.md");
  try {
    await install(options(temp, { targets: ["codex", "cursor"], components: "skills" }));
    await uninstall(options(temp, { targets: ["codex"] }));
    await readFile(sharedSkill);

    await uninstall(options(temp, { targets: ["cursor"] }));
    await assert.rejects(readFile(sharedSkill));
  } finally {
    await temp.cleanup();
  }
});

test("uninstalls only the selected component", async () => {
  const temp = await workspace();
  try {
    await install(options(temp, { targets: ["claude-code"] }));
    await uninstall(options(temp, { targets: ["claude-code"], components: "agents" }));
    await readFile(join(temp.home, ".claude", "skills", "example-skill", "SKILL.md"));
    await assert.rejects(readFile(join(temp.home, ".claude", "agents", "reviewer.md")));
  } finally {
    await temp.cleanup();
  }
});

test("uses project-specific target locations", async () => {
  const temp = await workspace();
  try {
    await install(options(temp, { scope: "project", targets: ["opencode", "vscode"] }));
    await readFile(join(temp.cwd, ".agents", "skills", "example-skill", "SKILL.md"));
    await readFile(join(temp.cwd, ".opencode", "agents", "reviewer.md"));
    await readFile(join(temp.cwd, ".github", "agents", "reviewer.agent.md"));
  } finally {
    await temp.cleanup();
  }
});

test("updates installed plugins while preserving the selected target", async () => {
  const temp = await workspace();
  const updatedCatalog = join(temp.root, "catalog");
  try {
    await cp(catalogRoot, updatedCatalog, { recursive: true });
    await install(options(temp, { catalogRoot: updatedCatalog, targets: ["claude-code"], plugins: ["reviewer-toolkit"] }));

    const sourceSkill = join(updatedCatalog, "reviewer-toolkit", "skills", "example-skill", "SKILL.md");
    await writeFile(sourceSkill, "---\nname: example-skill\ndescription: Updated fixture skill.\n---\n\nUpdated.\n");
    const newSkill = join(updatedCatalog, "reviewer-toolkit", "skills", "new-skill");
    await mkdir(newSkill, { recursive: true });
    await writeFile(join(newSkill, "SKILL.md"), "---\nname: new-skill\ndescription: New fixture skill.\n---\n\nNew.\n");
    const paths = await update(options(temp, { catalogRoot: updatedCatalog, targets: ["claude-code"] }));

    assert.equal(paths.length, 3);
    const installedSkill = join(temp.home, ".claude", "skills", "example-skill", "SKILL.md");
    assert.match(await readFile(installedSkill, "utf8"), /Updated fixture skill/);
    await readFile(join(temp.home, ".claude", "skills", "new-skill", "SKILL.md"));
  } finally {
    await temp.cleanup();
  }
});

test("accepts help without a command", async () => {
  await run(["--help"]);
});

test("discovers linked agents and installs linked skills and resources as independent files", async () => {
  const temp = await workspace();
  try {
    const source = await linkedCatalog(temp);
    assert.deepEqual(await listAgents("reviewer-toolkit", source.root), ["reviewer"]);
    const installed = await install(options(temp, { catalogRoot: source.root }));
    assert.equal(installed.length, 11);
    await rm(source.root, { recursive: true });

    for (const directory of [join(temp.home, ".claude", "skills"), join(temp.home, ".agents", "skills")]) {
      const skill = join(directory, "example-skill", "SKILL.md");
      assert.equal((await lstat(skill)).isSymbolicLink(), false);
      assert.match(await readFile(skill, "utf8"), /name: example-skill/);
      assert.equal((await lstat(join(dirname(skill), "references"))).isSymbolicLink(), false);
      assert.equal(await readFile(join(dirname(skill), "references", "guide.md"), "utf8"), "Shared guide.\n");
    }
    assert.match(await readFile(join(temp.configDir, "opencode", "agents", "reviewer.md"), "utf8"), /permission:/);
  } finally {
    await temp.cleanup();
  }
});

test("discovers symlinked skill directories and rejects dangling catalog links", async () => {
  const temp = await workspace();
  try {
    const root = join(temp.root, "catalog");
    await cp(catalogRoot, root, { recursive: true });
    const skill = join(root, "reviewer-toolkit", "skills", "example-skill");
    const shared = join(root, "shared-skill");
    await rename(skill, shared);
    await symlink(relative(dirname(skill), shared), skill);
    assert.deepEqual(await listSkills("reviewer-toolkit", root), ["example-skill"]);
    await install(options(temp, { catalogRoot: root, targets: ["claude-code"] }));
    const installed = join(temp.home, ".claude", "skills", "example-skill");
    assert.equal((await lstat(installed)).isSymbolicLink(), false);
    await rm(shared, { recursive: true });
    await readFile(join(installed, "SKILL.md"));
    await assert.rejects(listSkills("reviewer-toolkit", root), /ENOENT|broken|dangling/);

    const agent = join(root, "reviewer-toolkit", "agents", "reviewer.md");
    await rm(agent);
    await symlink("missing.md", agent);
    await assert.rejects(listAgents("reviewer-toolkit", root), /ENOENT|broken|dangling/);
  } finally {
    await temp.cleanup();
  }
});

test("linked source updates do not alter installed files and still protect user changes", async () => {
  const temp = await workspace();
  try {
    const source = await linkedCatalog(temp);
    const settings = options(temp, { catalogRoot: source.root, targets: ["claude-code"] });
    await install(settings);
    const installed = join(temp.home, ".claude", "skills", "example-skill", "SKILL.md");
    const original = await readFile(installed, "utf8");
    const changed = original.replace("description:", "description: Updated");
    await writeFile(join(source.shared, "skill.md"), changed);
    assert.equal(await readFile(installed, "utf8"), original);
    await update(settings);
    assert.equal(await readFile(installed, "utf8"), changed);
    await writeFile(installed, "User change.\n");
    assert.equal(await readFile(join(source.shared, "skill.md"), "utf8"), changed);
    await assert.rejects(update(settings), /differs/);
    await assert.rejects(uninstall(settings), /modified/);
    await update({ ...settings, force: true });
    assert.equal(await readFile(installed, "utf8"), changed);
  } finally {
    await temp.cleanup();
  }
});

test("replaces unchanged legacy installed symlinks without writing through them", async () => {
  const temp = await workspace();
  try {
    const source = await linkedCatalog(temp);
    const settings = options(temp, { catalogRoot: source.root, targets: ["claude-code"] });
    await install(settings);
    const installed = join(temp.home, ".claude", "skills", "example-skill", "SKILL.md");
    await rm(installed);
    await symlink(join(source.shared, "skill.md"), installed);
    await update(settings);
    assert.equal((await lstat(installed)).isSymbolicLink(), false);
    await rm(source.root, { recursive: true });
    assert.match(await readFile(installed, "utf8"), /name: example-skill/);
  } finally {
    await temp.cleanup();
  }
});

test("protects modified legacy links and repairs dangling installed links only with force", async () => {
  const temp = await workspace();
  try {
    const source = await linkedCatalog(temp);
    const settings = options(temp, { catalogRoot: source.root, targets: ["claude-code"] });
    await install(settings);
    const installed = join(temp.home, ".claude", "skills", "example-skill", "SKILL.md");
    const original = await readFile(installed, "utf8");
    await rm(installed);
    await symlink(join(source.shared, "skill.md"), installed);
    // Old installs could edit the shared source through the installed link.
    await writeFile(installed, "Modified through a legacy link.\n");
    await assert.rejects(update(settings), /modified links/);
    assert.equal((await lstat(installed)).isSymbolicLink(), true);
    await writeFile(join(source.shared, "skill.md"), original);
    await rm(installed);
    await symlink(join(temp.root, "removed-cache", "SKILL.md"), installed);
    await assert.rejects(update(settings), /ENOENT/);
    await update({ ...settings, force: true });
    assert.equal((await lstat(installed)).isSymbolicLink(), false);
    assert.equal(await readFile(installed, "utf8"), original);
  } finally {
    await temp.cleanup();
  }
});

test("doctor validates linked agent metadata and rejects broken or cyclic skill resources", async () => {
  const temp = await workspace();
  try {
    const source = await linkedCatalog(temp);
    const agent = await readFile(source.agent, "utf8");
    await writeFile(source.agent, agent.replace("name: reviewer", "name: wrong-name"));
    await assert.rejects(run(["doctor"], { catalogRoot: source.root }), /name must match filename/);
    await writeFile(source.agent, agent);

    const link = join(dirname(source.skill), "bad-resource");
    await symlink("missing", link);
    await assert.rejects(run(["doctor"], { catalogRoot: source.root }), /ENOENT/);
    await assert.rejects(prepareCatalog(source.root), /ENOENT/);
    await rm(link);
    await symlink(".", link);
    await assert.rejects(run(["doctor"], { catalogRoot: source.root }), /cyclic link/);
    await assert.rejects(install(options(temp, { catalogRoot: source.root })), /cyclic link/);
    await assert.rejects(prepareCatalog(source.root), /cyclic link/);
  } finally {
    await temp.cleanup();
  }
});

test("repository validation checks linked agent definitions", async () => {
  const temp = await workspace();
  try {
    const source = await linkedCatalog(temp);
    for (const path of ["lib", "scripts"]) {
      await cp(join(repositoryRoot, path), join(source.root, path), { recursive: true });
    }
    const registryPath = join(source.root, ".claude-plugin", "marketplace.json");
    const registry = JSON.parse(await readFile(registryPath, "utf8"));
    registry.description = "Linked catalog fixture.";
    registry.owner = { name: "Test" };
    await writeFile(registryPath, JSON.stringify(registry));
    await rm(join(source.root, "unlisted-toolkit"), { recursive: true });
    const command = [join(source.root, "scripts", "validate-repository.mjs")];
    const environment = { ...process.env, BASE_SHA: "" };
    execFileSync(process.execPath, command, { env: environment, stdio: "pipe" });
    const original = await readFile(source.agent, "utf8");
    await writeFile(source.agent, original.replace("name: reviewer", "name: wrong-name"));
    assert.throws(() => execFileSync(process.execPath, command, { env: environment, stdio: "pipe" }), /name must match filename/);
  } finally {
    await temp.cleanup();
  }
});

test("packs linked catalog content and installs after the source checkout and package are removed", async () => {
  const temp = await workspace();
  try {
    const source = await linkedCatalog(temp);
    for (const path of ["bin", "lib", "scripts", "package.json", ".npmignore", ".gitignore"]) {
      await cp(join(repositoryRoot, path), join(source.root, path), { recursive: true });
    }
    const output = join(temp.root, "packed");
    await mkdir(output);
    const environment = { ...process.env, HOME: temp.home, XDG_CONFIG_HOME: temp.configDir, npm_config_cache: join(temp.root, "npm-cache") };
    execFileSync("npm", ["run", "prepare"], { cwd: source.root, env: environment, encoding: "utf8" });
    // Prepare must not change the shared sources or their plugin links.
    assert.equal((await lstat(source.skill)).isSymbolicLink(), true);
    assert.equal((await lstat(source.agent)).isSymbolicLink(), true);
    const localListing = execFileSync(process.execPath, [join(source.root, "bin", "agent-framework.mjs"), "list"], { env: environment, encoding: "utf8" });
    assert.match(localListing, /Agents: reviewer/);
    const original = await readFile(source.skill, "utf8");
    await writeFile(source.skill, `${original}\nChanged after prepare.\n`);
    execFileSync("npm", ["pack", "--pack-destination", output, "--silent"], { cwd: source.root, env: environment, encoding: "utf8" });
    const [archive] = (await readdir(output)).filter((name) => name.endsWith(".tgz"));
    assert.ok(archive);
    execFileSync("tar", ["-xzf", join(output, archive), "-C", output]);
    await rm(source.root, { recursive: true });

    const packaged = join(output, "package");
    const cli = join(packaged, "bin", "agent-framework.mjs");
    const listing = execFileSync(process.execPath, [cli, "list"], { env: environment, encoding: "utf8" });
    assert.match(listing, /Skills: example-skill/);
    assert.match(listing, /Agents: reviewer/);
    assert.doesNotMatch(listing, /unlisted-toolkit/);
    execFileSync(process.execPath, [cli, "doctor"], { env: environment });
    execFileSync(process.execPath, [cli, "install", "--target", "claude-code", "--scope", "global", "--yes"], { env: environment });
    await rm(output, { recursive: true });
    await rm(join(temp.root, "npm-cache"), { recursive: true, force: true });
    const installed = join(temp.home, ".claude", "skills", "example-skill");
    assert.match(await readFile(join(installed, "SKILL.md"), "utf8"), /Changed after prepare/);
    assert.equal(await readFile(join(installed, "references", "guide.md"), "utf8"), "Shared guide.\n");
    await readFile(join(temp.home, ".claude", "agents", "reviewer.md"));
  } finally {
    await temp.cleanup();
  }
});

test("includes canonical agent and skill sources in the package build", async () => {
  const temp = await workspace();
  try {
    const output = join(temp.root, "packed");
    await mkdir(output);
    const environment = { ...process.env, npm_config_cache: join(temp.root, "npm-cache") };
    execFileSync("npm", ["pack", "--pack-destination", output, "--silent"], {
      cwd: repositoryRoot,
      env: environment,
      encoding: "utf8",
    });
    const [archive] = (await readdir(output)).filter((name) => name.endsWith(".tgz"));
    assert.ok(archive);

    const listing = execFileSync("tar", ["-tzf", join(output, archive)], { encoding: "utf8" });
    assert.match(listing, /package\/agents\/software-engineer\.md/);
    assert.match(listing, /package\/skills\/workflows\/bug-fix\.md/);
    assert.match(listing, /package\/\.agent-framework-catalog\/toolkits\/swe\/agents\/software-engineer\.md/);
    assert.match(listing, /package\/\.agent-framework-catalog\/toolkits\/swe\/skills\/bug-fix\/SKILL\.md/);
  } finally {
    await temp.cleanup();
  }
});
