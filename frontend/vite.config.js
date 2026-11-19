import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The browser only talks to this dev server (same origin), and Vite forwards:
//   /auth/*  -> Auth Server  (http://localhost:4000, "/auth" prefix removed)
//   /api/*   -> Blog Server  (http://localhost:5000)
// Same origin means no CORS setup and the httpOnly refresh-token cookie just works.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/auth": { target: "http://localhost:4000", rewrite: (path) => path.replace(/^\/auth/, "") },
      "/api": { target: "http://localhost:5000" },
    },
  },
});
