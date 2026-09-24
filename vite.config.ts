import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: true,
    // Headroom over vitest's 5s default: the form tests type long strings and a
    // loaded CI runner can drift past 5s. Real waits are bounded by findBy timeouts.
    testTimeout: 15000,
    coverage: {
      // v8 provider mirrors the backend's pytest-cov: a hard gate at 60%,
      // the threshold required by the course rubric.
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/main.tsx",
        "src/vite-env.d.ts",
        "src/**/*.test.{ts,tsx}",
        "src/test/**",
        "src/**/index.ts",
        "src/theme/**",
        // Vendored shadcn/ui primitives: added by the CLI, not our logic to test.
        "src/components/ui/**",
        "src/lib/utils.ts",
        // Declaration-only: interfaces/types compile to nothing at runtime,
        // so there is no executable code to cover.
        "src/api/types.ts",
      ],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 60,
        statements: 60,
      },
    },
  },
});
