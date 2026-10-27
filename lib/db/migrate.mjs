import { createClient } from "@libsql/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const client = createClient({ url: `file:${path.resolve(__dirname, "../../local.db")}` });
  const sql = fs.readFileSync(path.resolve(__dirname, "./drizzle/0000_illegal_mulholland_black.sql"), "utf-8");
  const statements = sql.split("--> statement-breakpoint");
  for (const stmt of statements) {
    if (stmt.trim()) {
      await client.execute(stmt.trim());
    }
  }
  console.log("Migration successful");
}

run().catch(console.error);
