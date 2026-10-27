import { createInsertSchema } from "drizzle-zod";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { z } from "zod/v4";

export const usersTable = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  healthId: text("health_id").notNull().unique(),
  name: text("name").notNull(),
  aadhaar: text("aadhaar", { length: 12 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["worker", "doctor"] }).notNull().default("worker"),
  age: integer("age"),
  bloodGroup: text("blood_group"),
  allergies: text("allergies"),
  emergencyContact: text("emergency_contact"),
  language: text("language").notNull().default("en"),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()).$onUpdate(() => new Date()),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;