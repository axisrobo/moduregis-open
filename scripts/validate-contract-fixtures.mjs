import { readdir, readFile, stat } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const contractsRoot = join(root, "contracts");

async function schemaDirectories() {
  const entries = await readdir(contractsRoot, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const dir = join(contractsRoot, entry.name);
    const schemaFiles = (await readdir(dir)).filter((f) => f.endsWith(".schema.json"));
    for (const sf of schemaFiles) {
      result.push({ name: entry.name, schemaPath: join(dir, sf), fixturesDir: join(dir, "fixtures") });
    }
  }
  return result;
}

async function validateSchema(schemaDir) {
  const { name, schemaPath, fixturesDir } = schemaDir;
  const schema = JSON.parse(await readFile(schemaPath, "utf8"));
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const validateFn = ajv.compile(schema);

  let failures = 0;
  for (const kind of ["valid", "invalid"]) {
    const dir = join(fixturesDir, kind);
    let fixtureFiles = [];
    try {
      fixtureFiles = (await readdir(dir)).filter((f) => f.endsWith(".json"));
    } catch (e) {
      if (e.code === "ENOENT") continue;
      throw e;
    }
    for (const fileName of fixtureFiles) {
      const data = JSON.parse(await readFile(join(dir, fileName), "utf8"));
      if (kind === "valid") {
        if (!validateFn(data)) {
          failures += 1;
          console.error(`[${name}] Expected valid: ${fileName}`, validateFn.errors);
        }
      } else {
        if (validateFn(data)) {
          failures += 1;
          console.error(`[${name}] Expected invalid: ${fileName}`);
        }
      }
    }
  }
  return failures;
}

let totalFailures = 0;
const schemas = await schemaDirectories();
for (const sd of schemas) {
  totalFailures += await validateSchema(sd);
}

if (totalFailures > 0) {
  process.exitCode = 1;
} else if (schemas.length > 0) {
  console.log(`Contract fixtures validated successfully (${schemas.length} schema(s)).`);
} else {
  console.log("No contract schemas found.");
}
