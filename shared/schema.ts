import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// BTC Bonsai settings and logs
export const bonsaiSettings = pgTable("bonsai_settings", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  positiveThresholds: jsonb("positive_thresholds").notNull().$type<number[]>(),
  negativeThresholds: jsonb("negative_thresholds").notNull().$type<number[]>(),
  anchorPrice: real("anchor_price"),
  useAverageBuyPrice: boolean("use_average_buy_price").notNull().default(true),
  growthFrequency: text("growth_frequency").notNull().default("day"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const bonsaiLogs = pgTable("bonsai_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(), // "water" (buy) or "harvest" (sell)
  price: real("price").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  note: text("note"),
});

// Insert Schemas
export const insertBonsaiSettingsSchema = createInsertSchema(bonsaiSettings).pick({
  userId: true,
  positiveThresholds: true,
  negativeThresholds: true,
  anchorPrice: true,
  useAverageBuyPrice: true,
  growthFrequency: true,
});

export const insertBonsaiLogSchema = createInsertSchema(bonsaiLogs).pick({
  userId: true,
  type: true,
  price: true,
  note: true,
});

// Types
export type InsertBonsaiSettings = z.infer<typeof insertBonsaiSettingsSchema>;
export type BonsaiSettings = typeof bonsaiSettings.$inferSelect;

export type InsertBonsaiLog = z.infer<typeof insertBonsaiLogSchema>;
export type BonsaiLog = typeof bonsaiLogs.$inferSelect;

// For legacy compatibility
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
