import { defineConfig } from "drizzle-kit";
import path from "path";

// Local database fallback provided in config

export default defineConfig({
  schema: [
    "./src/schema/users.ts",
    "./src/schema/records.ts",
    "./src/schema/sessions.ts"
  ],
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL || "file:../../local.db",
  },
});
