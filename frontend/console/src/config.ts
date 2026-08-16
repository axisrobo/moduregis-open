export type RuntimeConfig = {
  apiBaseUrl: string;
  oidcIssuer: string | undefined;
  oidcClientId: string | undefined;
};

type RuntimeEnvironment = {
  VITE_API_BASE_URL?: string;
  VITE_OIDC_ISSUER?: string;
  VITE_OIDC_CLIENT_ID?: string;
};

export function getRuntimeConfig(environment: RuntimeEnvironment): RuntimeConfig {
  return {
    apiBaseUrl: environment.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "",
    oidcIssuer: environment.VITE_OIDC_ISSUER,
    oidcClientId: environment.VITE_OIDC_CLIENT_ID,
  };
}

export const runtimeConfig = getRuntimeConfig(import.meta.env);
