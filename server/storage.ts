import {
  users,
  profiles,
  blogPosts,
  resources,
  chatLogs,
  type User,
  type InsertUser,
  type Profile,
  type InsertProfile,
  type BlogPost,
  type InsertBlogPost,
  type Resource,
  type InsertResource,
  type ChatLog,
  type InsertChatLog,
  Role
} from "@shared/schema";
import { db } from "./db";
import { eq, and, like, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  
  // Profile operations
  getProfile(userId: string): Promise<Profile | undefined>;
  createProfile(userId: string, profile: InsertProfile): Promise<Profile>;
  updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile>;
  
  // Blog operations
  getAllBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<BlogPost>;
  deleteBlogPost(id: string): Promise<void>;
  
  // Resource operations
  getAllResources(): Promise<Resource[]>;
  getFilteredResources(state?: string, farmType?: string): Promise<Resource[]>;
  createResource(resource: InsertResource): Promise<Resource>;
  updateResource(id: string, updates: Partial<Resource>): Promise<Resource>;
  deleteResource(id: string): Promise<void>;
  
  // Chat log operations
  createChatLog(chatLog: InsertChatLog): Promise<ChatLog>;
  getUserChatLogs(userId: string, type?: string): Promise<ChatLog[]>;
  
  // Member directory
  searchMembers(query?: string, state?: string, farmType?: string): Promise<(User & { profile: Profile })[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = randomUUID();
    const [user] = await db
      .insert(users)
      .values({ ...userData, id })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Profile operations
  async getProfile(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  }

  async createProfile(userId: string, profileData: InsertProfile): Promise<Profile> {
    const [profile] = await db
      .insert(profiles)
      .values({ ...profileData, userId })
      .returning();
    return profile;
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const [profile] = await db
      .update(profiles)
      .set(updates)
      .where(eq(profiles.userId, userId))
      .returning();
    return profile;
  }

  // Blog operations
  async getAllBlogPosts(): Promise<BlogPost[]> {
    return await db.select().from(blogPosts).orderBy(desc(blogPosts.publishedAt));
  }

  async getBlogPost(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post;
  }

  async createBlogPost(postData: InsertBlogPost): Promise<BlogPost> {
    const id = randomUUID();
    const [post] = await db
      .insert(blogPosts)
      .values({ ...postData, id })
      .returning();
    return post;
  }

  async updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<BlogPost> {
    const [post] = await db
      .update(blogPosts)
      .set(updates)
      .where(eq(blogPosts.id, id))
      .returning();
    return post;
  }

  async deleteBlogPost(id: string): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  // Resource operations
  async getAllResources(): Promise<Resource[]> {
    return await db.select().from(resources);
  }

  async getFilteredResources(state?: string, farmType?: string): Promise<Resource[]> {
    let query = db.select().from(resources);
    
    if (state || farmType) {
      const tags = [];
      if (state) tags.push(state);
      if (farmType) tags.push(farmType);
      
      // This is a simplified filter - in production you'd want more sophisticated tag matching
      query = query.where(
        tags.some(tag => 
          resources.tags.includes ? like(resources.tags, `%${tag}%`) : eq(resources.tags, [tag])
        )
      ) as any;
    }
    
    return await query;
  }

  async createResource(resourceData: InsertResource): Promise<Resource> {
    const id = randomUUID();
    const [resource] = await db
      .insert(resources)
      .values({ ...resourceData, id })
      .returning();
    return resource;
  }

  async updateResource(id: string, updates: Partial<Resource>): Promise<Resource> {
    const [resource] = await db
      .update(resources)
      .set(updates)
      .where(eq(resources.id, id))
      .returning();
    return resource;
  }

  async deleteResource(id: string): Promise<void> {
    await db.delete(resources).where(eq(resources.id, id));
  }

  // Chat log operations
  async createChatLog(chatLogData: InsertChatLog): Promise<ChatLog> {
    const id = randomUUID();
    const [chatLog] = await db
      .insert(chatLogs)
      .values({ ...chatLogData, id })
      .returning();
    return chatLog;
  }

  async getUserChatLogs(userId: string, type?: string): Promise<ChatLog[]> {
    let query = db.select().from(chatLogs).where(eq(chatLogs.userId, userId));
    
    if (type) {
      query = query.where(and(eq(chatLogs.userId, userId), eq(chatLogs.type, type)));
    }
    
    return await query.orderBy(desc(chatLogs.createdAt));
  }

  // Member directory
  async searchMembers(query?: string, state?: string, farmType?: string): Promise<(User & { profile: Profile })[]> {
    let dbQuery = db
      .select()
      .from(users)
      .innerJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(users.role, Role.MEMBER));

    if (state) {
      dbQuery = dbQuery.where(and(eq(users.role, Role.MEMBER), eq(profiles.state, state))) as any;
    }

    if (farmType) {
      dbQuery = dbQuery.where(and(eq(users.role, Role.MEMBER), eq(profiles.farmType, farmType))) as any;
    }

    if (query) {
      dbQuery = dbQuery.where(
        and(
          eq(users.role, Role.MEMBER),
          like(profiles.name, `%${query}%`)
        )
      ) as any;
    }

    const results = await dbQuery;
    return results.map((result: any) => ({
      ...result.users,
      profile: result.profiles
    }));
  }
}

export const storage = new DatabaseStorage();
