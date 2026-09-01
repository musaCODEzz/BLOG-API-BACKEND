import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./tests/setup.ts"], // runs the beforeAll/afterEach/afterAll hooks automatically
    testTimeout: 15000, // spinning up the in-memory database can take a few seconds on the first run
    hookTimeout: 15000,
  },
});