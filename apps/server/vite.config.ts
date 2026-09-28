import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

const fromRoot = (path: string) => fileURLToPath(new URL(`../../${path}`, import.meta.url));

// Bundles the API into the client project's api/ folder, where
// apps/client/api/index.js re-exports it as the Vercel Function. The leading
// underscore keeps Vercel from treating the bundle as a function of its own.
export default defineConfig({
  envDir: "../..",
  ssr: {
    noExternal: true
  },
  resolve: {
    alias: [
      { find: /^@repo\/shared\/http$/, replacement: fromRoot("packages/shared/src/http.ts") },
      { find: /^@repo\/shared$/, replacement: fromRoot("packages/shared/src/index.ts") }
    ]
  },
  build: {
    ssr: "_core/vercel-entry.ts",
    outDir: fromRoot("apps/client/api/_server"),
    emptyOutDir: true,
    target: "node20",
    rollupOptions: {
      output: {
        format: "es",
        entryFileNames: "index.js"
      }
    }
  }
});
