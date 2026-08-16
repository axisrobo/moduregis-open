import { describe, expect, test } from "vitest";
import { getRuntimeConfig } from "./config";

describe("getRuntimeConfig", () => {
  test("reads the API and OIDC settings from Vite runtime variables", () => {
    expect(getRuntimeConfig({
      VITE_API_BASE_URL: "https://api.example.test/",
      VITE_OIDC_ISSUER: "https://identity.example.test",
      VITE_OIDC_CLIENT_ID: "moduregis-console",
    })).toEqual({
      apiBaseUrl: "https://api.example.test",
      oidcIssuer: "https://identity.example.test",
      oidcClientId: "moduregis-console",
    });
  });
});
