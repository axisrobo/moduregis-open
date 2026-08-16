import { createApiClient, type ApiClient, type TokenProvider } from "./api/client";
import type { RuntimeConfig } from "./config";

export type OidcConfiguration = {
  issuer: string;
  clientId: string;
};

export type OidcTokenProvider = (configuration: OidcConfiguration) => Promise<string | undefined>;

type ConsoleBootstrap = {
  apiClient?: ApiClient;
  error?: string;
};

export function getConsoleBootstrap(config: RuntimeConfig, provider?: OidcTokenProvider): ConsoleBootstrap {
  if (!config.oidcIssuer || !config.oidcClientId) {
    return { error: "VITE_OIDC_ISSUER and VITE_OIDC_CLIENT_ID must be configured before the Console can call protected APIs." };
  }
  if (!provider) {
    return { error: "An OIDC token provider must be injected before the Console can call protected APIs." };
  }

  const getAccessToken: TokenProvider = async () => {
    const token = await provider({ issuer: config.oidcIssuer!, clientId: config.oidcClientId! });
    if (!token) throw new Error("The OIDC token provider did not return an access token.");
    return token;
  };

  return { apiClient: createApiClient({ apiBaseUrl: config.apiBaseUrl, getAccessToken }) };
}
