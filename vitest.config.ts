import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    // Only the pure logic under src/lib for now. Component and end-to-end tests
    // need a browser and belong in a separate project.
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
