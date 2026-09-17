import { readdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ignoredDirectories = new Set([".git", "node_modules"]);

async function collectJavaScript(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && !ignoredDirectories.has(entry.name)) {
      files.push(...await collectJavaScript(join(directory, entry.name)));
    } else if (entry.isFile() && entry.name.endsWith(".mjs")) {
      files.push(join(directory, entry.name));
    }
  }
  return files;
}

const failures = [];
for (const file of await collectJavaScript(root)) {
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (result.status !== 0) failures.push(result.stderr || `syntax check failed: ${file}`);
}

if (failures.length) throw new Error(failures.join("\n"));
console.log("JavaScript syntax is valid.");
