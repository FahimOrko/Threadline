import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  // component tests opt in to a DOM with `// @vitest-environment jsdom`
  test: { include: ["tests/**/*.test.{ts,tsx}"] },
});
