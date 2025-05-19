import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "okta-vendor": ["@okta/okta-auth-js", "@okta/okta-react"],
          "ui-vendor": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-context-menu",
          ],
          "query-vendor": ["@tanstack/react-query"],
          "pdf-vendor": ["react-pdf"],
        },
      },
    },
  },
});
