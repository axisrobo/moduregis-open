import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, ".", "");
  const apiTarget = environment.MODUREGIS_API_PROXY_TARGET ?? "http://localhost:1806";

  return {
    plugins: [react()],
    server: {
      port: 1807,
      proxy: {
        "/v1": apiTarget
      }
    }
  };
});
