import { describe, expect, test, vi } from "vitest";
import { getConsoleBootstrap } from "./bootstrap";

const config = {
  apiBaseUrl: "https://api.example.test",
  oidcIssuer: "https://identity.example.test",
  oidcClientId: "moduregis-console",
};

describe("getConsoleBootstrap", () => {
  test("fails closed when the OIDC runtime settings are incomplete", () => {
    expect(getConsoleBootstrap({ ...config, oidcIssuer: undefined }, async () => "issued-token")).toEqual({
      error: "VITE_OIDC_ISSUER and VITE_OIDC_CLIENT_ID must be configured before the Console can call protected APIs.",
    });
  });

  test("fails closed when no OIDC token provider is injected", () => {
    expect(getConsoleBootstrap(config)).toEqual({
      error: "An OIDC token provider must be injected before the Console can call protected APIs.",
    });
  });

  test("binds injected token acquisition to the configured OIDC client", async () => {
    const getAccessToken = vi.fn().mockResolvedValue("issued-token");
    const bootstrap = getConsoleBootstrap(config, getAccessToken);

    expect(bootstrap.error).toBeUndefined();
    await expect(bootstrap.apiClient?.getAccessToken()).resolves.toBe("issued-token");
    expect(getAccessToken).toHaveBeenCalledWith({
      issuer: "https://identity.example.test",
      clientId: "moduregis-console",
    });
  });

  test("rejects an injected provider that cannot supply a token", async () => {
    const bootstrap = getConsoleBootstrap(config, async () => undefined);

    await expect(bootstrap.apiClient?.getAccessToken()).rejects.toThrow("did not return an access token");
  });
});
