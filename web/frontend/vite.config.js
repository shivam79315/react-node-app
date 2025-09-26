import { defineConfig, loadEnv } from "vite";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const rootDir = dirname(fileURLToPath(import.meta.url));
  const env = loadEnv(mode, `${rootDir}/../`, "");

  process.env.VITE_SHOPIFY_API_KEY = env.SHOPIFY_API_KEY;

  const proxyOptions = {
    target: `http://127.0.0.1:${env.BACKEND_PORT || 3000}`,
    changeOrigin: false,
    secure: true,
    ws: false,
  };

  console.log("Vite running with env BACKEND_PORT:", env.BACKEND_PORT);

  const host = env.HOST ? env.HOST.replace(/https?:\/\//, "") : "localhost";

  let hmrConfig;
  if (host === "localhost") {
    hmrConfig = {
      protocol: "ws",
      host: "localhost",
      port: 53845,
      clientPort: 53845,
    };
  } else {
    hmrConfig = {
      protocol: "wss",
      host,
      port: env.FRONTEND_PORT,
      clientPort: 443,
    };
  }

  return defineConfig({
    root: rootDir,
    plugins: [react()],
    envDir: "../",
    resolve: {
      preserveSymlinks: true,
      alias: {
        '@': path.resolve(__dirname, 'frontend'),
      },
    },
    server: {
      host: "localhost",
      port: env.FRONTEND_PORT || 3001,
      hmr: hmrConfig,
      proxy: {
        "^/(\\?.*)?$": proxyOptions,
        "^/api(/|(\\?.*)?$)": proxyOptions
      },
    },
  });
});