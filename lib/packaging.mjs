import { existsSync } from "node:fs";
import { cp, mkdir, mkdtemp, readFile, rename, rm } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { listPlugins, pluginPath } from "./catalog.mjs";
import { inspectPath } from "./files.mjs";

// npm omits symlinks. Build a disposable, fully resolved catalog for the tarball.
export async function prepareCatalog(root) {
  const output = join(root, ".agent-framework-catalog");
  const registry = join(".claude-plugin", "marketplace.json");
  if (!existsSync(join(root, registry))) {
    // A packaged install already has its portable catalog and no authoring sources.
    await readFile(join(output, registry));
    return;
  }

  const plugins = [];
  for (const name of await listPlugins(root)) {
    const source = await pluginPath(name, root);
    if (source === output || source.startsWith(`${output}/`)) {
      throw new Error(`plugin ${name}: source must not be the generated package catalog`);
    }
    await inspectPath(source); // Fail on broken or cyclic links before copying.
    plugins.push(source);
  }

  const staging = await mkdtemp(join(root, ".agent-framework-catalog-"));
  try {
    await mkdir(join(staging, ".claude-plugin"));
    await cp(join(root, registry), join(staging, registry));
    for (const source of plugins) {
      const destination = join(staging, relative(root, source));
      await mkdir(dirname(destination), { recursive: true });
      await cp(source, destination, { recursive: true, dereference: true });
    }
    await rm(output, { recursive: true, force: true });
    await rename(staging, output);
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
}
