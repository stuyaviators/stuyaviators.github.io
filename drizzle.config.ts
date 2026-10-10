import { defineConfig } from "drizzle-kit";

// The Vercel ↔ Neon integration prefixes its variables with the store name.
const url =
	process.env.DATABASE_URL_UNPOOLED ??
	process.env.stuyaviators_DATABASE_URL_UNPOOLED ??
	process.env.DATABASE_URL ??
	process.env.stuyaviators_DATABASE_URL;

export default defineConfig({
	schema: "./src/db/schema.ts",
	out: "./drizzle",
	dialect: "postgresql",
	casing: "snake_case",
	dbCredentials: { url: url ?? "" },
});
