import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In development, /api calls go to Flask so cookies stay same-origin.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { "/api": "http://127.0.0.1:5000" },
  },
});
