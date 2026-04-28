import { defineConfig } from "vite";
// import { visualizer } from "rollup-plugin-visualizer";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: "/pretest_m&s",
  plugins: [
    react(),
    // visualizer({
    //   filename: "dist/stats.html",
    //   open: true,
    //   gzipSize: true,
    //   brotliSize: true,
    // }),
  ],
  server: {
    port: 5178,
  },
});
