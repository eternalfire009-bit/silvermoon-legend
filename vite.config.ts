import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Project site: https://eternalfire009-bit.github.io/silvermoon-legend/
export default defineConfig({
  base: "/silvermoon-legend/",
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 800,
  },
  resolve: {
    alias: {
      "grok/canvas": fileURLToPath(new URL("./src/shims/grok-canvas.tsx", import.meta.url)),
    },
  },
});
