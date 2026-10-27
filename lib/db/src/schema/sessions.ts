import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { usersTable } from "./users";

export const sessionsTable = sqliteTable("health_sessions", {
  token: text("token").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: 'timestamp' }).notNull(),
});