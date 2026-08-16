import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { App } from "./app";

describe("publication view", () => {
  test("renders an accessible server-governed publication form", () => {
    const markup = renderToStaticMarkup(<App configurationError="OIDC is required." />);

    expect(markup).toContain("Publish a capability");
    expect(markup).toContain("Capability document");
    expect(markup).toContain("Register draft");
    expect(markup).toContain("Publish registered version");
    expect(markup).toContain("Publication retry key");
    expect(markup).toContain("OIDC is required.");
  });
});
