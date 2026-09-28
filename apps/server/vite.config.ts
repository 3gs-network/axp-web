import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

const serverBuildTarget = (["web", "vercel"] as const).find((target) => target === process.env.SERVER_BUILD_TARGET) ?? "fc";
const fromRoot = (path: string) => fileURLToPath(new URL(`../../${path}`, import.meta.url));

const buildEntries = {
  fc: "_core/fc-entry.ts",
  web: "_core/fc-entry.web.ts",
  vercel: "_core/vercel-entry.ts"
};

// The Vercel bundle lands inside the client project's api/ folder; the leading
// underscore keeps Vercel from treating it as a function of its own.
const outDir = serverBuildTarget === "vercel" ? fromRoot("apps/client/api/_server") : "dist";

export default defineConfig({
  envDir: "../..",
  ssr: {
    noExternal: true
  },
  resolve: {
    alias: [
      { find: /^@libsql\/client$/, replacement: "@libsql/client/web" },
      { find: /^@repo\/shared\/http$/, replacement: fromRoot("packages/shared/src/http.ts") },
      { find: /^@repo\/shared$/, replacement: fromRoot("packages/shared/src/index.ts") }
    ]
  },
  build: {
    ssr: buildEntries[serverBuildTarget],
    outDir,
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
