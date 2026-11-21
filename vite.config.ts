import { defineConfig, loadEnv } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import path from "path";

import { nitro } from "nitro/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    define: {
      "import.meta.env.VITE_NEON_AUTH_URL": JSON.stringify(
        env.VITE_NEON_AUTH_URL || env.NEON_AUTH_BASE_URL || "",
      ),
    },
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [dyadComponentTagger(), react(), nitro()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
