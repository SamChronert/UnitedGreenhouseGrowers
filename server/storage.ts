import {
  users,
  profiles,
  blogPosts,
  resources,
  favorites,
  analytics_events,
  chatLogs,
  growerChallenges,
  forumPosts,
  forumComments,
  assessmentTrainingData,
  farmAssessments,
  farmProfiles,
  farmRecommendations,
  type User,
  type InsertUser,
  type Profile,
  type InsertProfile,
  type BlogPost,
  type InsertBlogPost,
  type Resource,
  type InsertResource,
  type Favorite,
  type InsertFavorite,
  type AnalyticsEvent,
  type InsertAnalyticsEvent,
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
  type FarmAssessment,
  type InsertFarmAssessment,
  type FarmProfile,
  type InsertFarmProfile,
  type FarmRecommendation,
  type InsertFarmRecommendation,
  type ResourceType,
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
  listResources(params: {
    page?: number;
    pageSize?: number;
    sort?: string;
    q?: string;
    type?: string;
    topics?: string[];
    crop?: string[];
    system_type?: string[];
    region?: string;
    audience?: string;
    cost?: string;
    status?: string;
    eligibility_geo?: string;
    format?: string;
    has_location?: boolean;
  }): Promise<{ items: (Resource & { has_location: boolean })[], total: number }>;
  getResourceById(id: string): Promise<(Resource & { has_location: boolean }) | undefined>;
  createResource(resource: InsertResource): Promise<Resource>;
  updateResource(id: string, updates: Partial<Resource>): Promise<Resource>;
  deleteResource(id: string): Promise<void>;
  importResourcesFromCSV(req: any, isDryRun: boolean): Promise<any>;
  
  // Favorites operations
  toggleFavorite(userId: string, resourceId: string, on: boolean): Promise<void>;
  listFavorites(userId: string, params?: { page?: number; pageSize?: number }): Promise<{ items: (Favorite & { resource: Resource & { has_location: boolean } })[], total: number }>;
  
  // Analytics operations
  recordAnalytics(event: InsertAnalyticsEvent): Promise<void>;
  recordAnalyticsEvents(events: any[], userId?: string | null): Promise<void>;
  getAnalyticsData(filters: {
    startDate?: Date;
    endDate?: Date;
    eventType?: string;
    tab?: string;
  }): Promise<{
    totalEvents: number;
    eventsByType: { eventType: string; count: number }[];
    eventsByTab: { tab: string; count: number }[];
    dailyEvents: { date: string; count: number }[];
  }>;
  
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
      .values({
        id: randomUUID(),
        username: userData.username,
        email: userData.email,
        passwordHash: userData.passwordHash,
        emailVerified: userData.emailVerified || null,
        role: (userData.role as Role) || Role.MEMBER
      })
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
      .values({ 
        ...profileData, 
        userId,
        memberType: (profileData.memberType as "grower" | "general") || "grower"
      })
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

  // New Resource Library functions (simplified for current schema)
  async listResources(params: {
    page?: number;
    pageSize?: number;
    sort?: string;
    q?: string;
    tags?: string[];
  } = {}): Promise<{ items: (Resource & { has_location: boolean })[], total: number }> {
    const { 
      page = 1, 
      pageSize = 24, 
      sort = 'title',
      q = '',
      tags = []
    } = params;

    // Simplified approach: fetch all resources and filter in memory
    const allResources = await db
      .select({
        id: resources.id,
        title: resources.title,
        url: resources.url,
        tags: resources.tags
      })
      .from(resources)
      .orderBy(resources.title);
    
    // Apply search and filtering in memory
    let filteredResources = allResources;
    
    // Search filter
    if (q.trim()) {
      const searchTerm = q.toLowerCase();
      filteredResources = filteredResources.filter((item: any) =>
        item.title.toLowerCase().includes(searchTerm) ||
        (item.tags && item.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm)))
      );
    }
    
    // Tag filters
    if (tags.length > 0) {
      filteredResources = filteredResources.filter((item: any) =>
        item.tags && tags.some(tag => item.tags.includes(tag))
      );
    }
    
    // Calculate pagination
    const total = filteredResources.length;
    const offset = (page - 1) * pageSize;
    const rawItems = filteredResources.slice(offset, offset + pageSize);
    
    // Map to extended interface with default values
    const items = rawItems.map((item: any) => ({
      ...item,
      // Infer type from tags
      type: item.tags?.find?.((tag: string) => 
        ['university', 'organization', 'tool', 'education', 'grant', 'template'].includes(tag)
      ) || 'education',
      // Infer topics from tags
      topics: item.tags?.filter?.((tag: string) => 
        ['management', 'research', 'pest-management', 'automation', 'best-practices', 'climate-control', 'business', 'planning', 'plant-science'].includes(tag)
      ) || [],
      // Infer crops from tags  
      crop: item.tags?.filter?.((tag: string) =>
        ['vegetables', 'tomatoes', 'peppers', 'leafy-greens'].includes(tag)
      ) || [],
      // Infer system type from tags
      system_type: item.tags?.filter?.((tag: string) =>
        ['hydroponics', 'controlled-environment', 'organic'].includes(tag)
      ) || [],
      cost: 'free', // Default assumption
      ugga_verified: false, // Default
      quality_score: 75, // Default
      has_location: false, // No location data in current schema
      region: 'US', // Default
      summary: item.tags?.length > 0 ? `Resource about ${item.tags.slice(0, 3).join(', ')}.` : 'Educational resource for greenhouse growers.',
      // Add grant-specific mock data for grants
      data: item.tags?.includes?.('grant') ? {
        sponsor: item.tags?.includes?.('university') ? 'USDA NIFA' : 'NSF',
        program_name: item.title,
        award_min: 50000,
        award_max: 500000,
        due_date: 'rolling',
        status: 'open',
        eligibility_geo: ['US'],
        link_to_rfp: item.url
      } : item.tags?.includes?.('template') ? {
        version: '1.0',
        version_notes: 'Latest version with updated formatting'
      } : {}
    }));
    
    return { items, total };
  }

  async getResourceById(id: string): Promise<(Resource & { has_location: boolean }) | undefined> {
    const [resource] = await db
      .select({
        id: resources.id,
        title: resources.title,
        url: resources.url,
        tags: resources.tags
      })
      .from(resources)
      .where(eq(resources.id, id));
    
    if (!resource) return undefined;
    
    return {
      ...resource,
      // Map to extended interface with defaults (same as listResources)
      type: (resource.tags?.find((tag: string) => 
        ['universities', 'organizations', 'tools', 'learning', 'grants', 'templates'].includes(tag)
      ) as ResourceType) || 'learning',
      topics: resource.tags?.filter((tag: string) => 
        ['management', 'research', 'pest-management', 'automation', 'best-practices', 'climate-control', 'business', 'planning', 'plant-science'].includes(tag)
      ) || [],
      crop: resource.tags?.filter((tag: string) =>
        ['vegetables', 'tomatoes', 'peppers', 'leafy-greens'].includes(tag)
      ) || [],
      system_type: resource.tags?.filter((tag: string) =>
        ['hydroponics', 'controlled-environment', 'organic'].includes(tag)
      ) || [],
      cost: 'free',
      ugga_verified: false,
      quality_score: 75,
      has_location: false,
      region: 'US',
      summary: resource.tags?.length > 0 ? `Resource about ${resource.tags.slice(0, 3).join(', ')}.` : 'Educational resource for greenhouse growers.',
      last_verified_at: null,
      review_interval_days: null,
      version: null,
      lat: null,
      long: null,
      // Add type-specific mock data
      data: resource.tags?.includes('grant') ? {
        sponsor: resource.tags.includes('university') ? 'USDA NIFA' : 'NSF',
        program_name: resource.title,
        award_min: 50000,
        award_max: 500000,
        due_date: 'rolling',
        status: 'open',
        eligibility_geo: ['US'],
        link_to_rfp: resource.url
      } : resource.tags?.includes('template') ? {
        version: '1.0',
        version_notes: 'Latest version with updated formatting'
      } : {}
    };
  }

  async createResource(resourceData: InsertResource): Promise<Resource> {
    const [resource] = await db
      .insert(resources)
      .values({ 
        ...resourceData,
        id: randomUUID(),
        type: resourceData.type as ResourceType | null
      })
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
    // First delete related analytics events to avoid foreign key constraint violation
    await db.delete(analytics_events).where(eq(analytics_events.resource_id, id));
    
    // Then delete related favorites
    await db.delete(favorites).where(eq(favorites.resource_id, id));
    
    // Finally delete the resource itself
    await db.delete(resources).where(eq(resources.id, id));
  }

  // Favorites operations
  async toggleFavorite(userId: string, resourceId: string, on: boolean): Promise<void> {
    if (on) {
      try {
        await db
          .insert(favorites)
          .values({ user_id: userId, resource_id: resourceId })
          .onConflictDoNothing();
      } catch (error) {
        // Ignore conflict errors (already favorited)
      }
    } else {
      await db
        .delete(favorites)
        .where(and(
          eq(favorites.user_id, userId),
          eq(favorites.resource_id, resourceId)
        ));
    }
  }

  async listFavorites(userId: string, params?: { page?: number; pageSize?: number }): Promise<{ items: (Favorite & { resource: Resource & { has_location: boolean } })[], total: number }> {
    const { page = 1, pageSize = 24 } = params || {};
    const offset = (page - 1) * pageSize;
    
    // Get total count
    const [{ count: total }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(favorites)
      .where(eq(favorites.user_id, userId));
    
    // Get items
    const results = await db
      .select()
      .from(favorites)
      .innerJoin(resources, eq(favorites.resource_id, resources.id))
      .where(eq(favorites.user_id, userId))
      .orderBy(desc(favorites.created_at))
      .offset(offset)
      .limit(pageSize);
    
    const items = results.map((result: any) => ({
      id: result.favorites.id,
      user_id: result.favorites.user_id,
      resource_id: result.favorites.resource_id,
      created_at: result.favorites.created_at,
      resource: {
        ...result.resources,
        has_location: !!(result.resources.lat && result.resources.long)
      }
    }));
    
    return { items, total };
  }

  async importResourcesFromCSV(req: any, isDryRun: boolean): Promise<any> {
    // This is a simplified implementation for the CSV import functionality
    // In a real implementation, you would use multer middleware and proper CSV parsing
    return new Promise((resolve, reject) => {
      const results: any = {
        valid: [],
        invalid: [],
        summary: { total: 0, valid: 0, invalid: 0 }
      };
      
      if (isDryRun) {
        // Mock validation for dry run
        results.summary = { total: 5, valid: 3, invalid: 2 };
        results.valid = [
          { row: 1, data: { title: "Sample Resource 1", url: "https://example.com", type: "university" }, errors: [], valid: true },
          { row: 2, data: { title: "Sample Resource 2", url: "https://example2.com", type: "grant" }, errors: [], valid: true },
          { row: 3, data: { title: "Sample Resource 3", url: "https://example3.com", type: "template" }, errors: [], valid: true }
        ];
        results.invalid = [
          { row: 4, data: { title: "", url: "invalid-url", type: "" }, errors: ["Title is required", "Invalid URL format", "Type is required"], valid: false },
          { row: 5, data: { title: "Resource 5", url: "", type: "unknown" }, errors: ["Invalid resource type"], valid: false }
        ];
        resolve(results);
      } else {
        // Mock import completion
        results.imported = 3;
        resolve(results);
      }
    });
  }

  // Analytics operations
  async recordAnalytics(event: InsertAnalyticsEvent): Promise<void> {
    try {
      await db
        .insert(analytics_events)
        .values(event);
    } catch (error) {
      // Best effort - don't fail if analytics table doesn't exist
      console.warn('Failed to record analytics:', error);
    }
  }

  async recordAnalyticsEvents(events: any[], userId?: string | null): Promise<void> {
    try {
      const analyticsData = events.map(event => ({
        user_id: userId,
        session_id: event.sessionId,
        event_type: event.eventType,
        tab: event.tab || null,
        resource_id: event.resourceId || null,
        payload: event.payload || {},
        created_at: new Date(event.timestamp)
      }));

      await db
        .insert(analytics_events)
        .values(analyticsData);
    } catch (error) {
      // Best effort - don't fail if analytics ingestion fails
      console.warn('Failed to record analytics events:', error);
    }
  }

  async getAnalyticsData(filters: {
    startDate?: Date;
    endDate?: Date;
    eventType?: string;
    tab?: string;
  }): Promise<{
    totalEvents: number;
    eventsByType: { eventType: string; count: number }[];
    eventsByTab: { tab: string; count: number }[];
    dailyEvents: { date: string; count: number }[];
  }> {
    try {
      const whereConditions = [];
      
      if (filters.startDate) {
        whereConditions.push(gte(analytics_events.created_at, filters.startDate));
      }
      if (filters.endDate) {
        whereConditions.push(sql`${analytics_events.created_at} <= ${filters.endDate}`);  
      }
      if (filters.eventType) {
        whereConditions.push(eq(analytics_events.event_type, filters.eventType));
      }
      if (filters.tab) {
        whereConditions.push(eq(analytics_events.tab, filters.tab));
      }

      const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

      // Get total events count
      const totalResult = await db
        .select({ count: sql<number>`count(*)`.as('count') })
        .from(analytics_events)
        .where(whereClause);
      const totalEvents = totalResult[0]?.count || 0;

      // Get events by type
      const eventsByTypeResult = await db
        .select({
          eventType: analytics_events.event_type,
          count: sql<number>`count(*)`.as('count')
        })
        .from(analytics_events)
        .where(whereClause)
        .groupBy(analytics_events.event_type)
        .orderBy(sql`count(*) DESC`);

      // Get events by tab (excluding null tabs)
      const eventsByTabResult = await db
        .select({
          tab: analytics_events.tab,
          count: sql<number>`count(*)`.as('count')
        })
        .from(analytics_events)
        .where(and(whereClause, sql`${analytics_events.tab} IS NOT NULL`))
        .groupBy(analytics_events.tab)
        .orderBy(sql`count(*) DESC`);

      // Get daily events (last 30 days)
      const dailyEventsResult = await db
        .select({
          date: sql<string>`DATE(${analytics_events.created_at})`.as('date'),
          count: sql<number>`count(*)`.as('count')
        })
        .from(analytics_events)
        .where(and(whereClause, gte(analytics_events.created_at, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))))
        .groupBy(sql`DATE(${analytics_events.created_at})`)
        .orderBy(sql`DATE(${analytics_events.created_at})`);

      return {
        totalEvents,
        eventsByType: eventsByTypeResult.map(row => ({ eventType: row.eventType, count: row.count })),
        eventsByTab: eventsByTabResult
          .filter(row => row.tab)
          .map(row => ({ tab: row.tab!, count: row.count })),
        dailyEvents: dailyEventsResult.map(row => ({ date: row.date, count: row.count }))
      };
    } catch (error) {
      console.error('Failed to get analytics data:', error);
      return {
        totalEvents: 0,
        eventsByType: [],
        eventsByTab: [],
        dailyEvents: []
      };
    }
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
    // Build where conditions
    const conditions = [eq(forumPosts.isDeleted, false)];
    
    if (filters?.state) {
      conditions.push(eq(profiles.state, filters.state));
    }
    
    if (filters?.county) {
      conditions.push(eq(profiles.county, filters.county));
    }
    
    if (filters?.category) {
      conditions.push(eq(forumPosts.category, filters.category));
    }

    const query = db
      .select()
      .from(forumPosts)
      .leftJoin(users, eq(forumPosts.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(and(...conditions));

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

  // Farm Roadmap operations
  async createFarmAssessment(data: InsertFarmAssessment): Promise<FarmAssessment> {
    const [assessment] = await db
      .insert(farmAssessments)
      .values({
        id: randomUUID(),
        ...data,
      })
      .returning();
    return assessment;
  }

  async getFarmAssessmentsByUser(userId: string): Promise<FarmAssessment[]> {
    return await db
      .select()
      .from(farmAssessments)
      .where(eq(farmAssessments.userId, userId))
      .orderBy(desc(farmAssessments.completedAt));
  }

  async getLatestFarmAssessment(userId: string): Promise<FarmAssessment | null> {
    const assessments = await db
      .select()
      .from(farmAssessments)
      .where(eq(farmAssessments.userId, userId))
      .orderBy(desc(farmAssessments.completedAt))
      .limit(1);
    return assessments[0] || null;
  }

  async createFarmProfile(data: InsertFarmProfile): Promise<FarmProfile> {
    const [profile] = await db
      .insert(farmProfiles)
      .values({
        id: randomUUID(),
        ...data,
      })
      .returning();
    return profile;
  }

  async getFarmProfileByUser(userId: string): Promise<FarmProfile | null> {
    const profiles = await db
      .select()
      .from(farmProfiles)
      .where(eq(farmProfiles.userId, userId))
      .orderBy(desc(farmProfiles.createdAt))
      .limit(1);
    return profiles[0] || null;
  }

  async getFarmProfileByAssessment(assessmentId: string): Promise<FarmProfile | null> {
    const profiles = await db
      .select()
      .from(farmProfiles)
      .where(eq(farmProfiles.assessmentId, assessmentId))
      .limit(1);
    return profiles[0] || null;
  }

  async updateFarmProfile(id: string, updates: Partial<FarmProfile>): Promise<FarmProfile> {
    const [profile] = await db
      .update(farmProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(farmProfiles.id, id))
      .returning();
    return profile;
  }

  async createFarmRecommendations(recommendations: InsertFarmRecommendation[]): Promise<FarmRecommendation[]> {
    if (recommendations.length === 0) return [];
    
    const recommendationsWithIds = recommendations.map(rec => ({
      id: randomUUID(),
      ...rec,
    }));

    return await db
      .insert(farmRecommendations)
      .values(recommendationsWithIds)
      .returning();
  }

  async getFarmRecommendationsByProfile(profileId: string): Promise<FarmRecommendation[]> {
    return await db
      .select()
      .from(farmRecommendations)
      .where(eq(farmRecommendations.profileId, profileId))
      .orderBy(desc(farmRecommendations.priority), desc(farmRecommendations.createdAt));
  }
}

export const storage = new DatabaseStorage();
