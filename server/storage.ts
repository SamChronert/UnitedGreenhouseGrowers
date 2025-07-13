import {
  users,
  profiles,
  blogPosts,
  resources,
  chatLogs,
  growerChallenges,
  forumPosts,
  forumComments,
  assessmentTrainingData,
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
  type GrowerChallenge,
  type InsertGrowerChallenge,
  type ForumPost,
  type InsertForumPost,
  type ForumComment,
  type InsertForumComment,
  type AssessmentTrainingData,
  type InsertAssessmentTrainingData,
  Role
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, like, desc, gte, ilike, sql } from "drizzle-orm";
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
  
  // Grower challenge operations
  createGrowerChallenge(challenge: InsertGrowerChallenge): Promise<GrowerChallenge>;
  getAllGrowerChallenges(): Promise<(GrowerChallenge & { user: User & { profile: Profile } })[]>;
  updateGrowerChallengeFlag(id: string, adminFlag: string): Promise<GrowerChallenge>;
  getGrowerChallengeStats(): Promise<{ totalCount: number; categoryCounts: Record<string, number>; recentCount: number }>;
  
  // Forum operations
  getAllForumPosts(filters?: {
    searchQuery?: string;
    state?: string;
    county?: string;
    category?: string;
  }): Promise<(ForumPost & { user: User & { profile: Profile }; comments: (ForumComment & { user: User & { profile: Profile } })[]; commentCount: number })[]>;
  getForumPost(id: string): Promise<(ForumPost & { user: User & { profile: Profile }; comments: (ForumComment & { user: User & { profile: Profile } })[] }) | undefined>;
  createForumPost(post: InsertForumPost): Promise<ForumPost>;
  updateForumPost(id: string, updates: Partial<ForumPost>): Promise<ForumPost>;
  softDeleteForumPost(id: string): Promise<ForumPost>;
  createForumComment(comment: InsertForumComment): Promise<ForumComment>;
  updateForumComment(id: string, updates: Partial<ForumComment>): Promise<ForumComment>;
  softDeleteForumComment(id: string): Promise<ForumComment>;
  
  // Assessment training data operations
  getAllAssessmentTrainingData(): Promise<AssessmentTrainingData[]>;
  createAssessmentTrainingData(data: InsertAssessmentTrainingData): Promise<AssessmentTrainingData>;
  updateAssessmentTrainingData(id: string, updates: Partial<AssessmentTrainingData>): Promise<AssessmentTrainingData>;
  deleteAssessmentTrainingData(id: string): Promise<void>;
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
    const [user] = await db
      .insert(users)
      .values([{
        id: randomUUID(),
        username: userData.username,
        email: userData.email,
        passwordHash: userData.passwordHash,
        emailVerified: userData.emailVerified || null,
        role: userData.role || Role.MEMBER
      }])
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
    if (!state && !farmType) {
      return await db.select().from(resources);
    }
    
    const conditions = [];
    if (state) {
      conditions.push(sql`${resources.tags} @> ${[state]}`);
    }
    if (farmType) {
      conditions.push(sql`${resources.tags} @> ${[farmType]}`);
    }
    
    return await db
      .select()
      .from(resources)
      .where(sql`${conditions.join(' OR ')}`);
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
    let conditions = [eq(chatLogs.userId, userId)];
    
    if (type) {
      conditions.push(eq(chatLogs.type, type));
    }
    
    return await db
      .select()
      .from(chatLogs)
      .where(and(...conditions))
      .orderBy(desc(chatLogs.createdAt));
  }

  // Member directory
  async searchMembers(query?: string, state?: string, farmType?: string): Promise<(User & { profile: Profile })[]> {
    let conditions: any[] = [];

    if (state) {
      conditions.push(eq(profiles.state, state));
    }

    if (farmType) {
      conditions.push(eq(profiles.farmType, farmType));
    }

    if (query) {
      conditions.push(
        or(
          like(profiles.name, `%${query}%`),
          like(users.email, `%${query}%`),
          like(users.username, `%${query}%`)
        )
      );
    }

    const dbQuery = db
      .select()
      .from(users)
      .innerJoin(profiles, eq(users.id, profiles.userId))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(users.createdAt);

    const results = await dbQuery;
    return results.map((result: any) => ({
      ...result.users,
      profile: result.profiles
    }));
  }

  // Grower challenge operations
  async createGrowerChallenge(challengeData: InsertGrowerChallenge): Promise<GrowerChallenge> {
    const [challenge] = await db
      .insert(growerChallenges)
      .values({
        id: randomUUID(),
        ...challengeData,
      })
      .returning();
    return challenge;
  }

  async getAllGrowerChallenges(): Promise<(GrowerChallenge & { user: User & { profile: Profile } })[]> {
    console.log("Fetching grower challenges from database...");
    const results = await db
      .select()
      .from(growerChallenges)
      .leftJoin(users, eq(growerChallenges.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .orderBy(desc(growerChallenges.createdAt));

    console.log("Raw DB results:", results.length);
    
    return results.map((result: any) => ({
      ...result.grower_challenges,
      user: {
        ...result.users,
        profile: result.profiles || null
      }
    }));
  }

  async updateGrowerChallengeFlag(id: string, adminFlag: string): Promise<GrowerChallenge> {
    const [challenge] = await db
      .update(growerChallenges)
      .set({ adminFlag })
      .where(eq(growerChallenges.id, id))
      .returning();
    return challenge;
  }

  async getGrowerChallengeStats(): Promise<{ totalCount: number; categoryCounts: Record<string, number>; recentCount: number }> {
    console.log("Fetching grower challenge stats...");
    
    // Get total count
    const totalResults = await db.select().from(growerChallenges);
    const totalCount = totalResults.length;
    console.log("Total challenges found:", totalCount);

    // Get category counts
    const categoryCounts: Record<string, number> = {};
    totalResults.forEach(challenge => {
      if (challenge.category) {
        categoryCounts[challenge.category] = (categoryCounts[challenge.category] || 0) + 1;
      }
    });
    console.log("Category counts:", categoryCounts);

    // Get recent count (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentResults = await db
      .select()
      .from(growerChallenges)
      .where(gte(growerChallenges.createdAt, thirtyDaysAgo));
    
    const recentCount = recentResults.length;
    console.log("Recent challenges count:", recentCount);

    const stats = {
      totalCount,
      categoryCounts,
      recentCount
    };
    
    console.log("Final stats:", stats);
    return stats;
  }

  // Forum operations
  async getAllForumPosts(filters?: {
    searchQuery?: string;
    state?: string;
    county?: string;
    category?: string;
  }): Promise<(ForumPost & { user: User & { profile: Profile }; comments: (ForumComment & { user: User & { profile: Profile } })[]; commentCount: number })[]> {
    let query = db
      .select()
      .from(forumPosts)
      .leftJoin(users, eq(forumPosts.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(forumPosts.isDeleted, false));

    // Apply filters
    if (filters?.state) {
      query = query.where(and(
        eq(forumPosts.isDeleted, false),
        eq(profiles.state, filters.state)
      ));
    }
    
    if (filters?.county) {
      query = query.where(and(
        eq(forumPosts.isDeleted, false),
        eq(profiles.county, filters.county)
      ));
    }
    
    if (filters?.category) {
      query = query.where(and(
        eq(forumPosts.isDeleted, false),
        eq(forumPosts.category, filters.category)
      ));
    }

    const posts = await query.orderBy(desc(forumPosts.createdAt));

    const postsWithDetails = await Promise.all(
      posts.map(async (post) => {
        const comments = await db
          .select()
          .from(forumComments)
          .leftJoin(users, eq(forumComments.userId, users.id))
          .leftJoin(profiles, eq(users.id, profiles.userId))
          .where(and(
            eq(forumComments.postId, post.forum_posts.id),
            eq(forumComments.isDeleted, false)
          ))
          .orderBy(forumComments.createdAt);

        return {
          ...post.forum_posts,
          user: { ...post.users!, profile: post.profiles! },
          comments: comments.map(c => ({
            ...c.forum_comments,
            user: { ...c.users!, profile: c.profiles! }
          })),
          commentCount: comments.length
        };
      })
    );

    if (filters?.searchQuery) {
      return postsWithDetails.filter(post => 
        post.title.toLowerCase().includes(filters.searchQuery!.toLowerCase()) ||
        post.content.toLowerCase().includes(filters.searchQuery!.toLowerCase()) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(filters.searchQuery!.toLowerCase())))
      );
    }

    return postsWithDetails;
  }

  async getForumPost(id: string): Promise<(ForumPost & { user: User & { profile: Profile }; comments: (ForumComment & { user: User & { profile: Profile } })[] }) | undefined> {
    const [post] = await db
      .select()
      .from(forumPosts)
      .leftJoin(users, eq(forumPosts.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(forumPosts.id, id));

    if (!post) return undefined;

    const comments = await db
      .select()
      .from(forumComments)
      .leftJoin(users, eq(forumComments.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(forumComments.postId, id))
      .orderBy(forumComments.createdAt);

    return {
      ...post.forum_posts,
      user: { ...post.users!, profile: post.profiles! },
      comments: comments.map(c => ({
        ...c.forum_comments,
        user: { ...c.users!, profile: c.profiles! }
      }))
    };
  }

  async createForumPost(postData: InsertForumPost): Promise<ForumPost> {
    const [post] = await db
      .insert(forumPosts)
      .values({
        id: randomUUID(),
        ...postData,
      })
      .returning();
    return post;
  }

  async updateForumPost(id: string, updates: Partial<ForumPost>): Promise<ForumPost> {
    const [post] = await db
      .update(forumPosts)
      .set({ ...updates, updatedAt: new Date(), editedAt: new Date() })
      .where(eq(forumPosts.id, id))
      .returning();
    return post;
  }

  async softDeleteForumPost(id: string): Promise<ForumPost> {
    const [post] = await db
      .update(forumPosts)
      .set({ 
        isDeleted: true, 
        content: "_message deleted_",
        updatedAt: new Date()
      })
      .where(eq(forumPosts.id, id))
      .returning();
    return post;
  }

  async createForumComment(commentData: InsertForumComment): Promise<ForumComment> {
    const [comment] = await db
      .insert(forumComments)
      .values({
        id: randomUUID(),
        ...commentData,
      })
      .returning();
    return comment;
  }

  async updateForumComment(id: string, updates: Partial<ForumComment>): Promise<ForumComment> {
    const [comment] = await db
      .update(forumComments)
      .set({ ...updates, updatedAt: new Date(), editedAt: new Date() })
      .where(eq(forumComments.id, id))
      .returning();
    return comment;
  }

  async softDeleteForumComment(id: string): Promise<ForumComment> {
    const [comment] = await db
      .update(forumComments)
      .set({ 
        isDeleted: true, 
        content: "_message deleted_",
        updatedAt: new Date()
      })
      .where(eq(forumComments.id, id))
      .returning();
    return comment;
  }

  // Assessment training data operations
  async getAllAssessmentTrainingData(): Promise<AssessmentTrainingData[]> {
    return await db
      .select()
      .from(assessmentTrainingData)
      .orderBy(desc(assessmentTrainingData.createdAt));
  }

  async createAssessmentTrainingData(data: InsertAssessmentTrainingData): Promise<AssessmentTrainingData> {
    const [trainingData] = await db
      .insert(assessmentTrainingData)
      .values({
        id: randomUUID(),
        ...data,
      })
      .returning();
    return trainingData;
  }

  async updateAssessmentTrainingData(id: string, updates: Partial<AssessmentTrainingData>): Promise<AssessmentTrainingData> {
    const [trainingData] = await db
      .update(assessmentTrainingData)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(assessmentTrainingData.id, id))
      .returning();
    return trainingData;
  }

  async deleteAssessmentTrainingData(id: string): Promise<void> {
    await db.delete(assessmentTrainingData).where(eq(assessmentTrainingData.id, id));
  }
}

export const storage = new DatabaseStorage();
