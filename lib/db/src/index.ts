import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema/index";
import path from "path";
import { fileURLToPath } from "url";

const defaultDbPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../local.db");

// Create client connecting to local SQLite file
export const client = createClient({ 
  url: process.env.DATABASE_URL || `file:${defaultDbPath}`
});
export const db = drizzle(client, { schema });

export * from "./schema/index";

