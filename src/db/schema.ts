import { pgTable, serial, integer, varchar, boolean, timestamp, primaryKey, text, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  login: varchar("login", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 10 }).default("user").notNull(),
  accuracy: integer("accuracy").default(0),
  score: integer("score").default(0).notNull(),
  isBanned: boolean("is_banned").default(false).notNull(),
});

export const roundTasks = pgTable("round_tasks", {
  id: serial("id").primaryKey(),
  targetData: text("target_data").notNull(),
  isActive: boolean("is_active").default(true),
});

export const pixels = pgTable("pixels", {
  x: integer("x").notNull(),
  y: integer("y").notNull(),
  color: varchar("color", { length: 7 }).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.x, table.y, table.userId] }),
  };
});

export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  action: text("action").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const targetPixels = pgTable("target_pixels", {
  id: serial("id").primaryKey(),
  x: integer("x").notNull(),
  y: integer("y").notNull(),
  adminLogin: text("admin_login"),
  color: varchar("color", { length: 7 }).notNull(),
});

export const settings = pgTable("settings", {
  id: integer("id").primaryKey(),
  targetImage: text("target_image"),
  targetMap: jsonb("target_map"),
  gameState: text("game_state"),
  canvasSize: integer("canvas_size").default(32), 
  palette: jsonb("palette").$type<string[]>(), 
  minPlayers: integer("min_players").default(2),
});