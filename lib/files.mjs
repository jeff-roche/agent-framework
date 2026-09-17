import { createHash } from "node:crypto";
import { lstat, readFile, readdir, realpath, stat } from "node:fs/promises";
import { join } from "node:path";

// Hash resolved contents, not link text, so links and portable copies compare equally.
export async function inspectPath(path, ancestors = new Set()) {
  const entry = await lstat(path);
  const resolved = await realpath(path);
  if (ancestors.has(resolved)) throw new Error(`cyclic link in catalog or installation: ${path}`);
  const info = entry.isSymbolicLink() ? await stat(path) : entry;
  const hash = createHash("sha256");
  let hasSymlinks = entry.isSymbolicLink();
  if (info.isFile()) {
    hash.update("file\0");
    hash.update(await readFile(path));
  } else if (info.isDirectory()) {
    hash.update("dir\0");
    const parents = new Set([...ancestors, resolved]);
    for (const name of (await readdir(path)).sort((left, right) => left.localeCompare(right))) {
      const child = await inspectPath(join(path, name), parents);
      hash.update(name);
      hash.update("\0");
      hash.update(child.hash);
      hasSymlinks ||= child.hasSymlinks;
    }
  } else {
    throw new Error(`unsupported catalog or installation file: ${path}`);
  }
  return { hash: hash.digest("hex"), hasSymlinks };
}

export async function hashPath(path) {
  return (await inspectPath(path)).hash;
}
