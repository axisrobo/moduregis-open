import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const contractsRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const openAPIPath = resolve(contractsRoot, "../docs/api/moduregis.v1alpha1.openapi.yaml");
const document = parse(await readFile(openAPIPath, "utf8"));
const schema = document.paths["/v1/adapters/{id}/versions/{version}/http-executor"].post.requestBody.content["application/json"].schema;
const expectedRef = "../../contracts/executor/moduregis.http-executor.v1alpha1.schema.json";

assert.equal(schema.$ref, expectedRef, "HTTP executor POST schema must reference the public contract");
await readFile(resolve(dirname(openAPIPath), schema.$ref), "utf8");
