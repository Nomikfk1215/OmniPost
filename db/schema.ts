import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const contents = sqliteTable("contents", {
  id: text("id").primaryKey(),
  title: text("title"),
  rawText: text("raw_text").notNull(),
  images: text("images", { mode: "json" }).$type<string[]>(),
  userTags: text("user_tags", { mode: "json" }).$type<string[]>(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

export const platformContents = sqliteTable("platform_contents", {
  id: text("id").primaryKey(),
  contentId: text("content_id").notNull(),
  platform: text("platform").notNull(),
  payload: text("payload", { mode: "json" }).notNull(),
  validation: text("validation", { mode: "json" }).notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

export const publishTasks = sqliteTable("publish_tasks", {
  id: text("id").primaryKey(),
  contentId: text("content_id").notNull(),
  title: text("title").notNull(),
  mode: text("mode").notNull(),
  status: text("status").notNull(),
  results: text("results", { mode: "json" }).notNull(),
  createdAt: text("created_at").notNull(),
  finishedAt: text("finished_at")
});
