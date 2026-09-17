import { readFile } from "node:fs/promises";

const tag = process.argv[2];
const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const expectedTag = `v${packageJson.version}`;

if (tag !== expectedTag) {
  throw new Error(`release tag ${tag} must match package.json version ${expectedTag}`);
}
