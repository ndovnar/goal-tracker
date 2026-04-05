import { fileURLToPath, URL } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

function normalizeBasePath(basePath: string): string {
  if (!basePath) {
    return "/";
  }
  return basePath.endsWith("/") ? basePath : `${basePath}/`;
}

function resolveBasePath(): string {
  const explicitBasePath = process.env.DEPLOY_BASE_PATH;
  if (explicitBasePath) {
    return normalizeBasePath(explicitBasePath);
  }
  const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
  if (process.env.GITHUB_ACTIONS === "true" && repositoryName) {
    return `/${repositoryName}/`;
  }
  return "/";
}

export default defineConfig({
  base: resolveBasePath(),
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
});
