import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	// Compile JSX with the automatic runtime (the email rendering tests).
	oxc: { jsx: { runtime: "automatic" } },
	resolve: {
		alias: { "@": path.resolve(import.meta.dirname, "src") },
	},
	test: {
		include: ["src/**/*.test.{ts,tsx}"],
		environment: "node",
		// Each database test boots an in-memory Postgres and runs every migration.
		testTimeout: 20_000,
		hookTimeout: 20_000,
	},
});
