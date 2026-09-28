import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    name: "server",
    environment: "node",
    setupFiles: ["./_test/setup.ts"],
    include: ["_test/infra/**/*.test.ts", "__tests__/**/*.test.ts"],
    pool: "forks",
    testTimeout: 10000
  },
  resolve: {
    // Resolve `@repo/shared` and `@repo/shared/http` to the package source.
    // Mirror packages/shared/package.json "exports" so deep-path imports
    // (`@repo/shared/http`) work without a build step.
    alias: [
      {
        find: /^@repo\/shared\/http$/,
        replacement: path.resolve(__dirname, "../../packages/shared/src/http.ts")
      },
      {
        find: /^@repo\/shared$/,
        replacement: path.resolve(__dirname, "../../packages/shared/src/index.ts")
      }
    ]
  }
});
