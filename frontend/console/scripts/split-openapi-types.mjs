import { readFile, rm, writeFile } from "node:fs/promises";

const temporaryPath = "src/api/.moduregis.v1alpha1.tmp.d.ts";
const source = await readFile(temporaryPath, "utf8");
const pathsStart = source.indexOf("export interface paths");
const componentsStart = source.indexOf("export interface components");
const operationsStart = source.indexOf("export interface operations");

if (pathsStart === -1 || componentsStart === -1 || operationsStart === -1) {
  throw new Error("openapi-typescript output did not contain paths, components, and operations declarations");
}

const header = source.slice(0, pathsStart);
const paths = source.slice(pathsStart, componentsStart);
const components = source.slice(componentsStart, operationsStart);
const operations = source.slice(operationsStart);

await writeFile("src/api/moduregis.v1alpha1.components.d.ts", `${header}${components}`);
await writeFile(
  "src/api/moduregis.v1alpha1.operations.d.ts",
  `${header}import type { components } from "./moduregis.v1alpha1.components";\n\n${paths}${operations}`,
);
await rm(temporaryPath);
