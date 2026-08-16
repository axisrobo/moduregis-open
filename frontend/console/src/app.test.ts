import { describe, expect, test } from "vitest";
import { isPublishedCapability } from "./app";

describe("published capability invocation", () => {
  test("permits only published versions to be invoked", () => {
    expect(isPublishedCapability({ id: "incident.create", version: "1.0.0", state: "published", contract_digest: "sha256:abc" })).toBe(true);
    expect(isPublishedCapability({ id: "incident.create", version: "1.1.0", state: "suspended", contract_digest: "sha256:def" })).toBe(false);
  });
});
