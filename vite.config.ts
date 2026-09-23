import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Split large / rarely-changing vendor code into stable chunks so route
    // navigations reuse cache and initial parse cost drops on public pages.
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes("node_modules")) return;
          if (id.includes("recharts") || id.includes("d3-")) return "vendor-charts";
          if (id.includes("@supabase")) return "vendor-supabase";
          if (id.includes("@radix-ui")) return "vendor-radix";
          if (id.includes("react-router")) return "vendor-router";
          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("scheduler")
          )
            return "vendor-react";
          if (id.includes("@tanstack")) return "vendor-tanstack";
          if (id.includes("lucide-react")) return "vendor-icons";
        },
      },
    },
    // Silence noisy warnings for known-large vendor chunks (recharts is heavy).
    chunkSizeWarningLimit: 900,
  },
}));
