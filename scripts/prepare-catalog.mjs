import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { prepareCatalog } from "../lib/packaging.mjs";

await prepareCatalog(join(dirname(fileURLToPath(import.meta.url)), ".."));
