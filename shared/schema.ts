import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export enum Role {
  GUEST = "GUEST",
  MEMBER = "MEMBER",
  ADMIN = "ADMIN"
}

export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  username: varchar("username").unique().notNull(),
  email: varchar("email").unique().notNull(),
  emailVerified: timestamp("email_verified"),
  passwordHash: varchar("password_hash").notNull(),
  role: varchar("role").$type<Role>().default(Role.MEMBER).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const profiles = pgTable("profiles", {
  userId: varchar("user_id").primaryKey().notNull(),
  name: varchar("name").notNull(),
  phone: varchar("phone").notNull(),
  state: varchar("state").notNull(),
  employer: varchar("employer"),
  jobTitle: varchar("job_title"),
  farmType: varchar("farm_type"),
}, (table) => ({
  stateIdx: index("profiles_state_idx").on(table.state),
  farmTypeIdx: index("profiles_farm_type_idx").on(table.farmType),
  stateAndFarmTypeIdx: index("profiles_state_farm_type_idx").on(table.state, table.farmType),
}));

export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().notNull(),
  title: varchar("title").notNull(),
  slug: varchar("slug").unique().notNull(),
  contentMd: text("content_md").notNull(),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
});

export const resources = pgTable("resources", {
  id: varchar("id").primaryKey().notNull(),
  title: varchar("title").notNull(),
  url: varchar("url").notNull(),
  tags: text("tags").array().notNull().default([]),
});

export const chatLogs = pgTable("chat_logs", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull(),
  type: varchar("type").notNull(), // FIND_GROWER | ASSESSMENT
  prompt: text("prompt").notNull(),
  response: jsonb("response").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const growerChallenges = pgTable("grower_challenges", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull(),
  category: varchar("category"), // irrigation, disease, labor, economics, policy, etc.
  description: text("description").notNull(),
  adminFlag: varchar("admin_flag"), // reviewed, important, needs_follow_up
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("grower_challenges_user_idx").on(table.userId),
  categoryIdx: index("grower_challenges_category_idx").on(table.category),
  createdAtIdx: index("grower_challenges_created_at_idx").on(table.createdAt),
}));

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  chatLogs: many(chatLogs),
  growerChallenges: many(growerChallenges),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

export const chatLogsRelations = relations(chatLogs, ({ one }) => ({
  user: one(users, {
    fields: [chatLogs.userId],
    references: [users.id],
  }),
}));

export const growerChallengesRelations = relations(growerChallenges, ({ one }) => ({
  user: one(users, {
    fields: [growerChallenges.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  userId: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  publishedAt: true,
});

export const insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
});

export const insertChatLogSchema = createInsertSchema(chatLogs).omit({
  id: true,
  createdAt: true,
});

export const insertGrowerChallengeSchema = createInsertSchema(growerChallenges).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;
export type ChatLog = typeof chatLogs.$inferSelect;
export type InsertChatLog = z.infer<typeof insertChatLogSchema>;
export type GrowerChallenge = typeof growerChallenges.$inferSelect;
export type InsertGrowerChallenge = z.infer<typeof insertGrowerChallengeSchema>;
