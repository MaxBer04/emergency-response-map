import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  envDir: resolve(__dirname, ".."),
  server: {
    watch: {
      usePolling: true, // Helps with Docker volume mount hot-reloading
    },
    host: true, // Listen on all addresses
    strictPort: true,
    port: parseInt(process.env.VITE_DEV_SERVER_PORT || "3001"),
    proxy: {
      "/api": {
        target: process.env.VITE_API_BASE_URL || "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
