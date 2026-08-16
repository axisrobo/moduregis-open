import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app";
import { getConsoleBootstrap, type OidcTokenProvider } from "./bootstrap";
import { runtimeConfig } from "./config";
import "./styles.css";

declare global {
  interface Window {
    __MODUREGIS_CONSOLE_OIDC_TOKEN_PROVIDER__?: OidcTokenProvider;
  }
}

const bootstrap = getConsoleBootstrap(runtimeConfig, window.__MODUREGIS_CONSOLE_OIDC_TOKEN_PROVIDER__);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App apiClient={bootstrap.apiClient} configurationError={bootstrap.error} />
  </StrictMode>
);
