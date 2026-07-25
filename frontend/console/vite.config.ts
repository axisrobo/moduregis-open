import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, ".", "");
  const apiTarget = environment.MODUREGIS_API_PROXY_TARGET ?? "http://localhost:8080";

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/v1/health": apiTarget
      }
    }
  };
});
