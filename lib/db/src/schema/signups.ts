import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const signupsTable = pgTable("signups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSignupSchema = createInsertSchema(signupsTable).omit({ id: true, createdAt: true });
export type InsertSignup = z.infer<typeof insertSignupSchema>;
export type Signup = typeof signupsTable.$inferSelect;
