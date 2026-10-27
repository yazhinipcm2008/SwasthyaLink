import { createInsertSchema } from "drizzle-zod";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const recordsTable = sqliteTable("medical_records", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  title: text("title").notNull(),
  providerName: text("provider_name"),
  details: text("details"),
  recordedAt: integer("recorded_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const insertRecordSchema = createInsertSchema(recordsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertRecord = z.infer<typeof insertRecordSchema>;
export type MedicalRecord = typeof recordsTable.$inferSelect;