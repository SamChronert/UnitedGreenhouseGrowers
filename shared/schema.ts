import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, index, doublePrecision, unique, sql } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export enum Role {
  GUEST = "GUEST",
  MEMBER = "MEMBER",
  ADMIN = "ADMIN"
}

export enum ForumCategory {
  BULK_ORDERING = "Bulk Ordering",
  PLANT_HEALTH_MANAGEMENT = "Plant Health Management", 
  GREENHOUSE_SYSTEMS_MANAGEMENT = "Greenhouse Systems Management",
  OPERATIONS = "Operations",
  OTHER = "Other"
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
  // Member type and grower-specific fields
  memberType: varchar("member_type").$type<"grower" | "general">().default("grower").notNull(),
  county: varchar("county"),
  greenhouseRole: varchar("greenhouse_role"),
  cropTypes: text("crop_types").array().default([]),
  otherCrop: varchar("other_crop"),
  ghSize: varchar("gh_size"),
  productionMethod: varchar("production_method"),
  suppLighting: varchar("supp_lighting"),
  climateControl: text("climate_control").array().default([]),
  otherFarmType: varchar("other_farm_type"),
}, (table) => ({
  stateIdx: index("profiles_state_idx").on(table.state),
  farmTypeIdx: index("profiles_farm_type_idx").on(table.farmType),
  stateAndFarmTypeIdx: index("profiles_state_farm_type_idx").on(table.state, table.farmType),
  memberTypeIdx: index("profiles_member_type_idx").on(table.memberType),
}));

export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().notNull(),
  title: varchar("title").notNull(),
  slug: varchar("slug").unique().notNull(),
  contentMd: text("content_md").notNull(),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
});

// Resource type enum
export type ResourceType = 'universities' | 'organizations' | 'grants' | 'tools' | 'templates' | 'learning' | 'bulletins' | 'industry_news';

export const resources = pgTable("resources", {
  id: varchar("id").primaryKey().notNull(),
  title: varchar("title").notNull(),
  url: varchar("url").notNull(),
  tags: text("tags").array().notNull().default([]),
  // Extended fields for Resource Library
  type: varchar("type").$type<ResourceType>(),
  summary: text("summary"),
  topics: text("topics").array().default([]),
  crop: text("crop").array().default([]),
  system_type: text("system_type").array().default([]),
  region: varchar("region"),
  cost: varchar("cost"),
  last_verified_at: timestamp("last_verified_at"),
  review_interval_days: integer("review_interval_days"),
  ugga_verified: boolean("ugga_verified").default(false),
  quality_score: integer("quality_score").default(0),
  version: varchar("version"),
  data: jsonb("data").default('{}'),
  lat: doublePrecision("lat"),
  long: doublePrecision("long"),
}, (table) => ({
  typeIdx: index("resources_type_idx").on(table.type),
  uggaVerifiedIdx: index("resources_ugga_verified_idx").on(table.ugga_verified),
  lastVerifiedIdx: index("resources_last_verified_idx").on(table.last_verified_at),
  qualityScoreIdx: index("resources_quality_score_idx").on(table.quality_score),
  // JSON path indices will be created manually for better control
}));

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

export const forumPosts = pgTable("forum_posts", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull(),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  category: varchar("category").notNull(), // Bulk Ordering, Plant Health Management, etc.
  tags: text("tags").array().default([]), // AI-generated topic tags
  attachments: text("attachments").array().default([]), // file URLs for images/documents
  editedAt: timestamp("edited_at"), // Track when post was edited
  isDeleted: boolean("is_deleted").default(false).notNull(), // Soft deletion
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("forum_posts_user_idx").on(table.userId),
  createdAtIdx: index("forum_posts_created_at_idx").on(table.createdAt),
  categoryIdx: index("forum_posts_category_idx").on(table.category),
}));

export const forumComments = pgTable("forum_comments", {
  id: varchar("id").primaryKey().notNull(),
  postId: varchar("post_id").notNull(),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  attachments: text("attachments").array().default([]), // file URLs for images/documents
  editedAt: timestamp("edited_at"), // Track when comment was edited
  isDeleted: boolean("is_deleted").default(false).notNull(), // Soft deletion
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  postIdx: index("forum_comments_post_idx").on(table.postId),
  userIdx: index("forum_comments_user_idx").on(table.userId),
  createdAtIdx: index("forum_comments_created_at_idx").on(table.createdAt),
}));

export const assessmentTrainingData = pgTable("assessment_training_data", {
  id: varchar("id").primaryKey().notNull(),
  adminId: varchar("admin_id").notNull(),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  attachments: text("attachments").array().default([]), // file URLs for reference materials
  tags: text("tags").array().default([]), // categorization tags
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  adminIdx: index("assessment_training_admin_idx").on(table.adminId),
  createdAtIdx: index("assessment_training_created_at_idx").on(table.createdAt),
}));

export const buyersDistributors = pgTable("buyers_distributors", {
  id: varchar("id").primaryKey().notNull(),
  name: varchar("name").notNull(),
  state: varchar("state").notNull(), // 2-letter code
  county: varchar("county"),
  categories: text("categories").array().notNull().default([]), // ["wholesale","CSA","retail"]
  contactEmail: varchar("contact_email").notNull(),
  phone: varchar("phone"),
  websiteUrl: varchar("website_url"),
}, (table) => ({
  stateIdx: index("buyers_distributors_state_idx").on(table.state),
  categoriesIdx: index("buyers_distributors_categories_idx").on(table.categories),
}));

export const products = pgTable("products", {
  id: varchar("id").primaryKey().notNull(),
  productName: varchar("product_name").notNull(),
  category: varchar("category").notNull(),
  vendorName: varchar("vendor_name").notNull(),
  vendorEmail: varchar("vendor_email").notNull(),
  description: text("description").notNull(),
  testimonials: jsonb("testimonials").notNull().default([]), // Array of {growerName, growerEmail, quote}
}, (table) => ({
  categoryIdx: index("products_category_idx").on(table.category),
  vendorIdx: index("products_vendor_idx").on(table.vendorName),
}));

// New tables for Resource Library
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey().notNull(),
  user_id: varchar("user_id").notNull(),
  resource_id: varchar("resource_id").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userResourceUnique: unique("favorites_user_resource_unique").on(table.user_id, table.resource_id),
}));

export const analytics_events = pgTable("analytics_events", {
  id: serial("id").primaryKey().notNull(),
  user_id: varchar("user_id"),
  session_id: varchar("session_id"),
  event_type: varchar("event_type", { length: 50 }).notNull(),
  tab: varchar("tab", { length: 50 }),
  resource_id: varchar("resource_id"),
  payload: jsonb("payload").notNull().default('{}'),
  created_at: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  eventTypeIdx: index("analytics_event_type_idx").on(table.event_type),
  tabIdx: index("analytics_tab_idx").on(table.tab),
  createdAtIdx: index("analytics_created_at_idx").on(table.created_at),
  sessionIdx: index("analytics_session_idx").on(table.session_id),
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

export const forumPostsRelations = relations(forumPosts, ({ one, many }) => ({
  user: one(users, {
    fields: [forumPosts.userId],
    references: [users.id],
  }),
  comments: many(forumComments),
}));

export const forumCommentsRelations = relations(forumComments, ({ one }) => ({
  post: one(forumPosts, {
    fields: [forumComments.postId],
    references: [forumPosts.id],
  }),
  user: one(users, {
    fields: [forumComments.userId],
    references: [users.id],
  }),
}));

export const assessmentTrainingDataRelations = relations(assessmentTrainingData, ({ one }) => ({
  admin: one(users, {
    fields: [assessmentTrainingData.adminId],
    references: [users.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.user_id],
    references: [users.id],
  }),
  resource: one(resources, {
    fields: [favorites.resource_id],
    references: [resources.id],
  }),
}));

export const resourcesRelations = relations(resources, ({ many }) => ({
  favorites: many(favorites),
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

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  created_at: true,
});

export const insertAnalyticsEventSchema = createInsertSchema(analytics_events).omit({
  id: true,
  created_at: true,
});

export const insertChatLogSchema = createInsertSchema(chatLogs).omit({
  id: true,
  createdAt: true,
});

export const insertGrowerChallengeSchema = createInsertSchema(growerChallenges).omit({
  id: true,
  createdAt: true,
});

export const insertForumPostSchema = createInsertSchema(forumPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  editedAt: true,
  isDeleted: true,
});

export const insertForumCommentSchema = createInsertSchema(forumComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  editedAt: true,
  isDeleted: true,
});

export const insertAssessmentTrainingDataSchema = createInsertSchema(assessmentTrainingData).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBuyersDistributorsSchema = createInsertSchema(buyersDistributors).omit({
  id: true,
});

export const insertProductsSchema = createInsertSchema(products).omit({
  id: true,
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
export type ForumPost = typeof forumPosts.$inferSelect;
export type InsertForumPost = z.infer<typeof insertForumPostSchema>;
export type ForumComment = typeof forumComments.$inferSelect;
export type InsertForumComment = z.infer<typeof insertForumCommentSchema>;
export type AssessmentTrainingData = typeof assessmentTrainingData.$inferSelect;
export type InsertAssessmentTrainingData = z.infer<typeof insertAssessmentTrainingDataSchema>;
export type BuyersDistributors = typeof buyersDistributors.$inferSelect;
export type InsertBuyersDistributors = z.infer<typeof insertBuyersDistributorsSchema>;
export type Products = typeof products.$inferSelect;
export type InsertProducts = z.infer<typeof insertProductsSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type AnalyticsEvent = typeof analytics_events.$inferSelect;
export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;
