import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const schema = JSON.parse(await readFile(join(root, "contracts", "adapters", "moduregis.adapter.v1alpha1.schema.json"), "utf8"));
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validate = ajv.compile(schema);

async function fixtures(kind) {
  const directory = join(root, "contracts", "adapters", "fixtures", kind);
  return Promise.all((await readdir(directory)).filter((name) => name.endsWith(".json")).map(async (name) => ({
    name,
    data: JSON.parse(await readFile(join(directory, name), "utf8"))
  })));
}

let failures = 0;
for (const fixture of await fixtures("valid")) {
  if (!validate(fixture.data)) {
    failures += 1;
    console.error(`Expected valid: ${fixture.name}`, validate.errors);
  }
}
for (const fixture of await fixtures("invalid")) {
  if (validate(fixture.data)) {
    failures += 1;
    console.error(`Expected invalid: ${fixture.name}`);
  }
}
if (failures > 0) process.exitCode = 1;
else console.log("Adapter Manifest fixtures validated successfully.");
