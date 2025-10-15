import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";
import { storage } from "./storage";
import { 
  authenticate, 
  requireMember, 
  requireAdmin, 
  hashPassword, 
  verifyPassword, 
  generateToken, 
  verifyToken,
  setAuthCookie, 
  clearAuthCookie,
  type AuthRequest 
} from "./auth";
import { sendUserEmail } from "./email/userEmail";
import { findGrowerAI, assessmentAI } from "./openai";
import { notifyAllAdmins, formatExpertRequestEmail, formatChallengeEmail, formatFeedbackEmail, formatContactFormEmail } from "./emailNotifications";
import { calculateFarmProfile, generateRecommendations } from "./farmRoadmapLogic";
import { 
  insertUserSchema, 
  insertProfileSchema, 
  insertBlogPostSchema, 
  insertResourceSchema,
  insertGrowerChallengeSchema,
  insertExpertRequestSchema,
  Role,
  resources
} from "@shared/schema";
import { randomUUID } from "crypto";
import { sql, eq, and, or, like, desc, asc, count } from "drizzle-orm";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { db } from "./db";

// Rate limiting for AI endpoints
const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: "Too many AI requests, please try again later",
});

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime', 'video/webm'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, MP4, MOV, and WEBM files are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(cookieParser());
  
  // Health check endpoint for deployment monitoring
  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      version: "1.0.0"
    });
  });
  
  // Serve uploaded files statically
  app.use("/uploads", express.static(uploadDir));

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { password, memberType = "grower", ...userData } = req.body;
      
      // Validate password strength
      if (password.length < 12) {
        return res.status(400).json({ message: "Password must be at least 12 characters long" });
      }

      // Check if user exists
      const existingUser = await storage.getUserByEmail(userData.email) || 
                          await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      // Validate member type specific requirements
      if (memberType === "grower") {
        const { cropTypes, otherCrop, county, climateControl, farmType, otherFarmType } = req.body;
        
        if (!county) {
          return res.status(400).json({ message: "County is required for grower members" });
        }
        
        if (cropTypes && cropTypes.includes("Other") && !otherCrop) {
          return res.status(400).json({ message: "Please specify other crop type" });
        }
        
        if (climateControl && climateControl.length === 0) {
          return res.status(400).json({ message: "Please select at least one climate control type" });
        }
        

        
        if (farmType === "Other" && !otherFarmType) {
          return res.status(400).json({ message: "Please specify other farm type" });
        }
      }

      // Create user
      const passwordHash = await hashPassword(password);
      const user = await storage.createUser({
        username: userData.username,
        email: userData.email,
        passwordHash,
        role: Role.MEMBER,
      });

      // Create profile with member type specific fields
      const { 
        name, phone, state, employer, jobTitle, farmType,
        county, greenhouseRole, cropTypes, otherCrop, 
        ghSize, productionMethod, suppLighting, climateControl,
        otherFarmType
      } = req.body;
      
      await storage.createProfile(user.id, {
        name,
        phone,
        state,
        employer,
        jobTitle,
        farmType,
        memberType,
        // Grower-specific fields (will be null for general members)
        county: memberType === "grower" ? county : null,
        greenhouseRole: memberType === "grower" ? greenhouseRole : null,
        cropTypes: memberType === "grower" ? (cropTypes || []) : [],
        otherCrop: memberType === "grower" ? otherCrop : null,
        ghSize: memberType === "grower" ? ghSize : null,
        productionMethod: memberType === "grower" ? productionMethod : null,
        suppLighting: memberType === "grower" ? suppLighting : null,
        climateControl: memberType === "grower" ? (climateControl || []) : [],
        otherFarmType: memberType === "grower" ? otherFarmType : null,
      });

      // Generate token and set cookie for automatic login
      const token = generateToken(user);
      setAuthCookie(res, token);

      // Send welcome email via Brevo SMTP
      await sendUserEmail({
        to: user.email,
        subject: "Welcome to UGGA",
        html: `
          <h1>Welcome to United Greenhouse Growers Association!</h1>
          <p>Thank you for joining our community. Your account has been created successfully.</p>
          <p>You can now log in and access all member features.</p>
        `,
        text: `
Welcome to United Greenhouse Growers Association!

Thank you for joining our community. Your account has been created successfully.

You can now log in and access all member features.
        `,
      });

      res.status(201).json({ message: "Registration successful" });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { identifier, password } = req.body;

      // Find user by email or username
      const user = await storage.getUserByEmail(identifier) || 
                   await storage.getUserByUsername(identifier);

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate token and set cookie
      const token = generateToken({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role as Role,
      });

      setAuthCookie(res, token);

      res.json({ message: "Login successful" });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    clearAuthCookie(res);
    res.json({ message: "Logout successful" });
  });

  app.get("/api/auth/me", authenticate, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      const profile = await storage.getProfile(req.user!.id);
      
      res.json({
        ...user,
        profile,
        passwordHash: undefined, // Don't send password hash
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user data" });
    }
  });

  // Password reset routes
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      
      // Always return success to prevent email enumeration
      if (!user) {
        return res.json({ message: "If an account with that email exists, a password reset link has been sent." });
      }

      // Generate reset token (valid for 1 hour)
      const resetToken = generateToken({
        id: user.id,
        email: user.email,
        type: 'password-reset'
      }, '1h');

      // Send reset email via Brevo SMTP
      const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}`;
      
      await sendUserEmail({
        to: user.email,
        subject: "Reset Your UGGA Password",
        html: `
          <h1>Reset Your Password</h1>
          <p>You requested a password reset for your UGGA account.</p>
          <p>Click the link below to reset your password (link expires in 1 hour):</p>
          <p><a href="${resetUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a></p>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p>${resetUrl}</p>
          <p>If you didn't request this reset, you can safely ignore this email.</p>
        `,
        text: `
Reset Your Password

You requested a password reset for your UGGA account.

Click this link to reset your password (link expires in 1 hour):
${resetUrl}

If you didn't request this reset, you can safely ignore this email.
        `
      });

      res.json({ message: "If an account with that email exists, a password reset link has been sent." });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to process password reset request" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ message: "Token and password are required" });
      }

      // Validate password strength
      if (password.length < 12) {
        return res.status(400).json({ message: "Password must be at least 12 characters long" });
      }

      // Verify reset token
      const decoded = verifyToken(token);
      if (!decoded || decoded.type !== 'password-reset') {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      // Find user
      const user = await storage.getUserByEmail(decoded.email);
      if (!user) {
        return res.status(400).json({ message: "Invalid reset token" });
      }

      // Update password
      const passwordHash = await hashPassword(password);
      await storage.updateUserPassword(user.id, passwordHash);

      res.json({ message: "Password reset successful" });
    } catch (error) {
      console.error("Reset password error:", error);
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        return res.status(400).json({ message: "Reset token has expired" });
      }
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Contact form
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Send notification to all admins
      const emailData = formatContactFormEmail({
        name,
        email,
        subject,
        message,
      });
      
      const emailSent = await notifyAllAdmins(emailData);

      if (!emailSent) {
        return res.status(500).json({ message: "Failed to send email" });
      }

      res.json({ message: "Message sent successfully" });
    } catch (error) {
      console.error("Contact form error:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Member feedback form
  app.post("/api/feedback", authenticate, requireMember, async (req: AuthRequest, res) => {
    try {
      const { subject, message, type } = req.body;
      
      if (!subject || !message || !type) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const user = await storage.getUser(req.user!.id);
      const profile = await storage.getProfile(req.user!.id);
      
      // Send notification to all admins
      const emailData = formatFeedbackEmail({
        userName: profile?.name || user?.username || 'Unknown User',
        userEmail: user?.email || 'Unknown Email',
        memberSince: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown',
        organization: profile?.employer || 'Not specified',
        state: profile?.state || 'Not specified',
        type,
        subject,
        message,
      });
      
      const emailSent = await notifyAllAdmins(emailData);

      if (!emailSent) {
        return res.status(500).json({ message: "Failed to send email" });
      }

      res.json({ message: "Feedback sent successfully" });
    } catch (error) {
      console.error("Feedback error:", error);
      res.status(500).json({ message: "Failed to send feedback" });
    }
  });

  // Blog routes
  app.get("/api/blog", async (req, res) => {
    try {
      const posts = await storage.getAllBlogPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/:slug", async (req, res) => {
    try {
      const post = await storage.getBlogPost(req.params.slug);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  // Resource filter validation schemas
  const ResourceFiltersSchema = z.object({
    state: z.string().optional(),
    country: z.string().optional(),
    programName: z.string().optional(),
    rfpDueDate: z.string().optional(),
    eligibility: z.string().optional(),
    // Grants-specific filters
    agency: z.string().optional(),
    amountMin: z.string().optional(),
    amountMax: z.string().optional(),
    focusAreas: z.string().optional(),
    orgTypes: z.string().optional(),
    regions: z.string().optional(),
    hideExpired: z.string().optional(),
    eligibilityType: z.string().optional(),
    // Organization-specific filters
    functions: z.string().optional(),
    // Learning-specific filters
    category: z.string().optional(),
    costType: z.string().optional(),
    level: z.string().optional(),
    format: z.string().optional(),
    language: z.string().optional()
  }).passthrough();
  
  const ResourceQuerySchema = z.object({
    type: z.enum(['universities', 'organizations', 'grants', 'tools', 'templates', 'learning', 'bulletins', 'industry_news']).optional(),
    q: z.string().optional(),
    filters: z.string().optional(),
    sort: z.enum(['relevance', 'title', 'newest', 'quality', 'dueDate', 'agency', 'amount', 'provider', 'cost']).default('relevance'),
    cursor: z.string().optional(),
    limit: z.coerce.number().min(1).max(10000).default(20)
  });

  // Resources routes - New type-aware API
  app.get("/api/resources", async (req, res) => {
    try {
      // Validate query parameters
      const queryResult = ResourceQuerySchema.safeParse(req.query);
      if (!queryResult.success) {
        return res.status(400).json({ 
          message: "Invalid query parameters", 
          errors: queryResult.error.errors 
        });
      }
      
      const { type, q, filters: filtersStr, sort, cursor, limit } = queryResult.data;
      
      // Parse and validate filters JSON
      let filters = {};
      if (filtersStr) {
        try {
          const parsedFilters = JSON.parse(filtersStr);
          const filterResult = ResourceFiltersSchema.safeParse(parsedFilters);
          if (!filterResult.success) {
            return res.status(400).json({ 
              message: "Invalid filters format", 
              errors: filterResult.error.errors 
            });
          }
          filters = filterResult.data;
        } catch {
          return res.status(400).json({ message: "Invalid JSON in filters parameter" });
        }
      }
      
      // Build WHERE conditions - separate cursor from other filters
      const filterConditions = [];
      const params: any[] = [];
      let paramIndex = 1;
      let cursorCondition: string | null = null;
      
      // Type filter
      if (type) {
        filterConditions.push(`type = '${type.replace(/'/g, "''")}'`);
      }
      
      // Text search
      if (q) {
        const searchTerm = q.replace(/'/g, "''").substring(0, 200);
        filterConditions.push(`(title ILIKE '%${searchTerm}%' OR summary ILIKE '%${searchTerm}%' OR array_to_string(tags, ' ') ILIKE '%${searchTerm}%')`);
      }
      
      // JSON path filters - skip type-specific keys that will be handled later
      const typeSpecificKeys = new Set(['amountMin', 'amountMax', 'focusAreas', 'orgTypes', 'regions', 'hideExpired', 'functions', 'country']);
      for (const [key, value] of Object.entries(filters)) {
        if (value && typeof value === 'string' && !typeSpecificKeys.has(key)) {
          filterConditions.push(`data->>'${key}' = '${value.replace(/'/g, "''")}'`);
        }
      }
      
      // Cursor-based pagination - store separately
      if (cursor) {
        try {
          const [id, timestamp] = Buffer.from(cursor, 'base64').toString().split('|');
          cursorCondition = `(id, COALESCE(data->>'createdAt', '1970-01-01')) > ('${id.replace(/'/g, "''").substring(0, 100)}', '${timestamp.replace(/'/g, "''").substring(0, 50)}')`;
        } catch {
          return res.status(400).json({ message: "Invalid cursor format" });
        }
      }
      
      // Build ORDER BY clause
      let orderBy = 'id';
      switch (sort) {
        case 'title':
          orderBy = 'title, id';
          break;
        case 'newest':
          orderBy = "COALESCE(data->>'createdAt', '1970-01-01') DESC, id";
          break;
        case 'quality':
          orderBy = "COALESCE((data->>'qualityScore')::int, 0) DESC, id";
          break;
        case 'dueDate':
          orderBy = "COALESCE(data->>'applicationDeadline', data->>'rfpDueDate', '9999-12-31') ASC, id";
          break;
        case 'agency':
          orderBy = "COALESCE(data->>'agency', 'ZZZ') ASC, id";
          break;
        case 'amount':
          orderBy = "COALESCE((data->>'grantAmountMax')::int, (data->>'grantAmountMin')::int, 0) DESC, id";
          break;
        case 'provider':
          orderBy = "COALESCE(data->>'provider', 'ZZZ') ASC, id";
          break;
        case 'cost':
          orderBy = "COALESCE(data->>'costType', 'ZZZ') ASC, id";
          break;
        default:
          orderBy = 'id';
      }
      
      // Handle grants-specific filters
      if (type === 'grants') {
        const processedKeys = new Set();
        for (const [key, value] of Object.entries(filters)) {
          if (key === 'amountMin' && value && typeof value === 'string') {
            // Show grants where the max award is at least the user's minimum
            filterConditions.push(`COALESCE((data->>'award_max')::int, 0) >= ${parseInt(value)}`);
            processedKeys.add(key);
          } else if (key === 'amountMax' && value && typeof value === 'string') {
            // Show grants where the min award is at most the user's maximum
            filterConditions.push(`COALESCE((data->>'award_min')::int, 0) <= ${parseInt(value)}`);
            processedKeys.add(key);
          } else if (key === 'focusAreas' && value && typeof value === 'string') {
            const areas = value.split(',').map(area => `'${area.replace(/'/g, "''")}'`);
            const areaConditions = areas.map(area => `data->'focusAreas' ? ${area}`);
            filterConditions.push(`(${areaConditions.join(' OR ')})`);
          } else if (key === 'orgTypes' && value && typeof value === 'string') {
            const types = value.split(',').map(type => `'${type.replace(/'/g, "''")}'`);
            const typeConditions = types.map(type => `data->'eligibility'->'orgTypes' ? ${type}`);
            filterConditions.push(`(${typeConditions.join(' OR ')})`);
          } else if (key === 'regions' && value && typeof value === 'string') {
            const regions = value.split(',').map(region => `'${region.replace(/'/g, "''")}'`);
            const regionConditions = regions.map(region => `(data->'eligibility'->'regions' ? ${region} OR data->'eligibility'->'regions' ? 'All US States')`);
            filterConditions.push(`(${regionConditions.join(' OR ')})`);
          } else if (key === 'hideExpired' && value === 'true') {
            const today = new Date().toISOString().split('T')[0];
            filterConditions.push(`(data->>'due_date' >= '${today}' OR data->>'status' = 'Rolling' OR data->>'status' = 'recurring')`);
          }
        }
      }
      
      // Handle organization function filters  
      if (type === 'organizations') {
        for (const [key, value] of Object.entries(filters)) {
          if (key === 'functions' && value && typeof value === 'string') {
            filterConditions.push(`data->'functions' ? '${value.replace(/'/g, "''")}'`);
          } else if (key === 'country' && value && typeof value === 'string') {
            filterConditions.push(`data->'hq'->>'country' = '${value.replace(/'/g, "''")}'`);
          }
        }
      }
      
      // Build final SQL query - combine filter conditions with cursor condition for main query
      const allConditions = [...filterConditions];
      if (cursorCondition) {
        allConditions.push(cursorCondition);
      }
      const whereClause = allConditions.length > 0 ? `WHERE ${allConditions.join(' AND ')}` : '';
      
      const baseQuery = `
        SELECT id, title, url, type, summary, data, tags, lat, long, ugga_verified, quality_score, image_url 
        FROM resources 
        ${whereClause}
        ORDER BY ${orderBy}
        LIMIT ${limit + 1}
      `;
      
      // Execute query
      const result = await db.execute(sql.raw(baseQuery));
      const items = result.rows as any[];
      
      // Prepare response
      const hasNext = items.length > limit;
      if (hasNext) {
        items.pop(); // Remove the extra item
      }
      
      // Generate next cursor
      let nextCursor: string | null = null;
      if (hasNext && items.length > 0) {
        const lastItem = items[items.length - 1] as any;
        const timestamp = lastItem.data?.createdAt || '1970-01-01';
        nextCursor = Buffer.from(`${lastItem.id}|${timestamp}`).toString('base64');
      }
      
      // Get total count using ONLY filter conditions (exclude cursor)
      const countWhereClause = filterConditions.length > 0 ? 
        `WHERE ${filterConditions.join(' AND ')}` : '';
      
      const countQuery = `
        SELECT COUNT(*) as count 
        FROM resources 
        ${countWhereClause}
      `;
      
      const countResult = await db.execute(sql.raw(countQuery));
      const total = Number(countResult.rows[0]?.count) || 0;
      
      res.json({
        items,
        nextCursor,
        total
      });
      
    } catch (error) {
      console.error("Resources API error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin resource counts endpoint
  app.get("/api/admin/resources/counts", authenticate, requireAdmin, async (req, res) => {
    try {
      const resourceTypes = ['universities', 'organizations', 'grants', 'tools', 'templates', 'learning', 'bulletins', 'industry_news'];
      
      const counts = await Promise.all(
        resourceTypes.map(async (type) => {
          const countQuery = `SELECT COUNT(*) as count FROM resources WHERE type = '${type.replace(/'/g, "''")}'`;
          const result = await db.execute(sql.raw(countQuery));
          const count = parseInt((result.rows[0]?.count || '0') as string);
          return { type, total: count };
        })
      );

      res.json(counts);
    } catch (error) {
      console.error("Resource counts error:", error);
      res.status(500).json({ message: "Failed to fetch resource counts" });
    }
  });
  
  // Get resource by ID
  app.get("/api/resources/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await db.execute(
        sql`SELECT * FROM resources WHERE id = ${id}`
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      res.json(result.rows[0]);
      
    } catch (error) {
      console.error("Resource detail API error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Legacy resources route for backward compatibility
  app.get("/api/resources/legacy", async (req, res) => {
    try {
      // Use simplified Resource Library format
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 24;
      const sort = req.query.sort as string;
      const q = req.query.q as string;
      
      // Collect all filter values as tags for simplified filtering
      const tags: string[] = [];
      const filterFields = ['type', 'topics', 'crop', 'system_type', 'region', 'audience', 'cost', 'status', 'eligibility_geo', 'format'];
      for (const field of filterFields) {
        const values = req.query[field];
        if (values) {
          if (Array.isArray(values)) {
            tags.push(...(values as string[]));
          } else {
            tags.push(values as string);
          }
        }
      }
        
      const result = await storage.listResources({
        page,
        pageSize,
        sort,
        q,
        tags
      });
      res.json(result);
    } catch (error) {
      console.error("Resources error:", error);
      res.status(500).json({ message: "Failed to fetch resources" });
    }
  });

  app.get("/api/resources/:id", async (req, res) => {
    try {
      const resource = await storage.getResourceById(req.params.id);
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      res.json(resource);
    } catch (error) {
      console.error("Get resource error:", error);
      res.status(500).json({ message: "Failed to fetch resource" });
    }
  });


  // Add feedback endpoint for resource update requests and suggestions
  app.post("/api/feedback", authenticate, async (req: AuthRequest, res) => {
    try {
      const { type, resource_id, message, title, resourceType, url, note } = req.body;
      
      // Save feedback to database
      const feedbackId = randomUUID();
      const feedback = {
        id: feedbackId,
        user_id: req.user!.id,
        type,
        title,
        resource_id,
        resource_type: resourceType,
        url,
        note: note || message,
        status: 'pending'
      };
      
      await db.execute(sql`
        INSERT INTO feedback (id, user_id, type, title, resource_id, resource_type, url, note, status)
        VALUES (${feedbackId}, ${req.user!.id}, ${type}, ${title || ''}, ${resource_id || ''}, ${resourceType || ''}, ${url || ''}, ${note || message || ''}, 'pending')
      `);
      
      console.log(`${type} received from user ${req.user!.username}:`, feedback);
      
      res.json({ 
        message: "Feedback received successfully",
        id: feedbackId
      });
    } catch (error) {
      console.error("Feedback error:", error);
      res.status(500).json({ message: "Failed to submit feedback" });
    }
  });

  // Favorites routes (member-only)
  app.post("/api/favorites/:id", authenticate, requireMember, async (req: AuthRequest, res) => {
    try {
      await storage.toggleFavorite(req.user!.id, req.params.id, true);
      res.json({ message: "Resource added to favorites" });
    } catch (error) {
      console.error("Add favorite error:", error);
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  app.delete("/api/favorites/:id", authenticate, requireMember, async (req: AuthRequest, res) => {
    try {
      await storage.toggleFavorite(req.user!.id, req.params.id, false);
      res.json({ message: "Resource removed from favorites" });
    } catch (error) {
      console.error("Remove favorite error:", error);
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  // Admin-only resource management endpoints
  app.post("/api/admin/resources", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const resource = await storage.createResource(req.body);
      res.json(resource);
    } catch (error) {
      console.error("Create resource error:", error);
      res.status(500).json({ message: "Failed to create resource" });
    }
  });

  app.put("/api/admin/resources/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const resource = await storage.updateResource(req.params.id, req.body);
      res.json(resource);
    } catch (error) {
      console.error("Update resource error:", error);
      res.status(500).json({ message: "Failed to update resource" });
    }
  });

  app.delete("/api/admin/resources/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      await storage.deleteResource(req.params.id);
      res.json({ message: "Resource deleted successfully" });
    } catch (error) {
      console.error("Delete resource error:", error);
      res.status(500).json({ message: "Failed to delete resource" });
    }
  });

  // CSV Import endpoint
  app.post("/api/admin/resources/import", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const isDryRun = req.query.dryRun === '1';
      const result = await storage.importResourcesFromCSV(req, isDryRun);
      res.json(result);
    } catch (error) {
      console.error("CSV import error:", error);
      res.status(500).json({ message: "Failed to process CSV import" });
    }
  });

  // Analytics API endpoints for admin dashboard
  app.get("/api/admin/analytics", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const filters: any = {};
      
      if (req.query.startDate) {
        filters.startDate = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        filters.endDate = new Date(req.query.endDate as string);
      }
      if (req.query.eventType) {
        filters.eventType = req.query.eventType as string;
      }
      if (req.query.tab) {
        filters.tab = req.query.tab as string;
      }
      
      const analytics = await storage.getAnalyticsData(filters);
      res.json(analytics);
    } catch (error) {
      console.error("Analytics data error:", error);
      res.status(500).json({ message: "Failed to fetch analytics data" });
    }
  });

  app.get("/api/favorites", authenticate, requireMember, async (req: AuthRequest, res) => {
    try {
      const params = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : 24,
      };
      
      const result = await storage.listFavorites(req.user!.id, params);
      res.json(result);
    } catch (error) {
      console.error("List favorites error:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  // Analytics ingestion endpoint with rate limiting
  const analyticsRateLimit = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 events per minute per session
    keyGenerator: (req) => req.body?.[0]?.sessionId || req.ip,
    message: { message: "Analytics rate limit exceeded" },
    standardHeaders: false,
    legacyHeaders: false,
  });

  app.post("/api/analytics", analyticsRateLimit, async (req: AuthRequest, res) => {
    try {
      const events = req.body;
      
      if (!Array.isArray(events)) {
        return res.status(400).json({ message: "Events must be an array" });
      }
      
      if (events.length === 0) {
        return res.status(204).end();
      }
      
      if (events.length > 20) {
        return res.status(400).json({ message: "Too many events in batch" });
      }
      
      // Validate event schema
      const validEventTypes = ['tab_view', 'search_submit', 'filter_change', 'resource_open', 'outbound_click', 'template_download'];
      
      for (const event of events) {
        if (!event.eventType || !validEventTypes.includes(event.eventType)) {
          return res.status(400).json({ message: "Invalid event type" });
        }
        if (!event.sessionId || typeof event.sessionId !== 'string') {
          return res.status(400).json({ message: "Invalid session ID" });
        }
        if (!event.timestamp || typeof event.timestamp !== 'number') {
          return res.status(400).json({ message: "Invalid timestamp" });
        }
      }
      
      // Get user ID from auth (optional)
      const userId = req.user?.id || null;
      
      // Store events in database (batch insert)
      await storage.recordAnalyticsEvents(events, userId);
      
      // Fire-and-forget response
      res.status(204).end();
    } catch (error) {
      // Best effort - don't fail the request
      console.warn("Analytics ingestion error:", error);
      res.status(204).end();
    }
  });

  // Protected member routes
  app.put("/api/profile", authenticate, requireMember, async (req: AuthRequest, res) => {
    try {
      const profile = await storage.updateProfile(req.user!.id, req.body);
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Change password route
  app.put("/api/auth/change-password", authenticate, async (req: AuthRequest, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      // Validate input
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }
      
      // Validate new password strength
      if (newPassword.length < 12) {
        return res.status(400).json({ message: "New password must be at least 12 characters long" });
      }
      
      // Get current user
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Verify current password
      const isCurrentPasswordValid = await verifyPassword(currentPassword, user.passwordHash);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      // Hash new password
      const newPasswordHash = await hashPassword(newPassword);
      
      // Update password
      await storage.updateUser(req.user!.id, { passwordHash: newPasswordHash });
      
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // AI routes with rate limiting
  app.post("/api/ai/find-grower", aiRateLimit, authenticate, requireMember, async (req: AuthRequest, res) => {
    try {
      const { question } = req.body;
      
      if (!question) {
        return res.status(400).json({ message: "Question is required" });
      }
      
      // Get member directory for context
      const members = await storage.searchMembers();
      
      const response = await findGrowerAI(question, members);
      
      // Log the chat
      await storage.createChatLog({
        userId: req.user!.id,
        type: "FIND_GROWER",
        prompt: question,
        response: response,
      });

      res.json({ response });
    } catch (error) {
      console.error("Find grower AI error:", error);
      res.status(500).json({ message: "Find grower service is currently unavailable. Please try again later." });
    }
  });

  app.post("/api/ai/assessment", aiRateLimit, authenticate, requireMember, async (req: AuthRequest, res) => {
    try {
      const { input, sessionId } = req.body;
      
      if (!input) {
        return res.status(400).json({ message: "Input is required" });
      }
      
      // Set up Server-Sent Events
      res.writeHead(200, {
        "Content-Type": "text/plain",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
      });

      const response = await assessmentAI(input, sessionId);
      
      // Log the chat
      await storage.createChatLog({
        userId: req.user!.id,
        type: "ASSESSMENT",
        prompt: input,
        response: response,
      });

      res.write(`data: ${JSON.stringify({ response })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Assessment AI error:", error);
      res.status(500).json({ message: "Assessment service is currently unavailable. Please try again later." });
    }
  });

  // Farm Roadmap API endpoints
  app.post("/api/farm-roadmap/submit", authenticate, requireMember, async (req: AuthRequest, res) => {
    try {
      const { responses } = req.body;
      
      if (!responses || typeof responses !== 'object') {
        return res.status(400).json({ message: "Assessment responses are required" });
      }
      
      const userId = req.user!.id;
      
      // Create assessment record
      const assessment = await storage.createFarmAssessment({
        userId,
        responses,
      });
      
      // Calculate farm profile based on responses
      const profileData = calculateFarmProfile(responses);
      
      // Create farm profile
      const farmProfile = await storage.createFarmProfile({
        userId,
        assessmentId: assessment.id,
        profileData,
        strengths: profileData.strengths,
        improvementAreas: profileData.improvementAreas,
      });
      
      // Generate recommendations
      const recommendationData = generateRecommendations(profileData, responses);
      const recommendations = await storage.createFarmRecommendations(
        recommendationData.map(rec => ({
          ...rec,
          profileId: farmProfile.id,
        }))
      );
      
      res.status(201).json({
        assessment,
        profile: farmProfile,
        recommendations,
      });
    } catch (error) {
      console.error("Farm roadmap submission error:", error);
      res.status(500).json({ message: "Failed to submit farm roadmap assessment" });
    }
  });

  app.get("/api/farm-roadmap/profile", authenticate, requireMember, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      
      const profile = await storage.getFarmProfileByUser(userId);
      if (!profile) {
        return res.status(404).json({ message: "No farm profile found" });
      }
      
      const recommendations = await storage.getFarmRecommendationsByProfile(profile.id);
      
      res.json({
        profile,
        recommendations,
      });
    } catch (error) {
      console.error("Farm profile fetch error:", error);
      res.status(500).json({ message: "Failed to fetch farm profile" });
    }
  });

  app.get("/api/farm-roadmap/assessments", authenticate, requireMember, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const assessments = await storage.getFarmAssessmentsByUser(userId);
      res.json(assessments);
    } catch (error) {
      console.error("Farm assessments fetch error:", error);
      res.status(500).json({ message: "Failed to fetch farm assessments" });
    }
  });

  // Admin routes
  app.get("/api/admin/members", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { query, state, farmType } = req.query;
      const members = await storage.searchMembers(
        query as string,
        state as string,
        farmType as string
      );
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch members" });
    }
  });

  app.post("/api/admin/members", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { password, ...userData } = req.body;
      
      // Validate required fields
      if (!userData.username || !userData.email || !password) {
        return res.status(400).json({ message: "Username, email, and password are required" });
      }

      // Validate password strength
      if (password.length < 12) {
        return res.status(400).json({ message: "Password must be at least 12 characters long" });
      }

      // Check if user exists
      const existingUser = await storage.getUserByEmail(userData.email) || 
                          await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      // Create user
      const passwordHash = await hashPassword(password);
      const user = await storage.createUser({
        username: userData.username,
        email: userData.email,
        passwordHash,
        role: userData.role || Role.MEMBER,
      });

      // Create profile if profile data is provided
      if (userData.profile) {
        await storage.createProfile(user.id, userData.profile);
      }

      res.status(201).json({ message: "Member created successfully", userId: user.id });
    } catch (error) {
      console.error("Member creation error:", error);
      res.status(500).json({ message: "Failed to create member" });
    }
  });

  app.put("/api/admin/members/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { profile, ...userData } = req.body;

      // Update user data
      if (Object.keys(userData).length > 0) {
        await storage.updateUser(id, userData);
      }

      // Update profile data if provided
      if (profile) {
        const existingProfile = await storage.getProfile(id);
        if (existingProfile) {
          await storage.updateProfile(id, profile);
        } else {
          await storage.createProfile(id, profile);
        }
      }

      res.json({ message: "Member updated successfully" });
    } catch (error) {
      console.error("Member update error:", error);
      res.status(500).json({ message: "Failed to update member" });
    }
  });

  app.post("/api/admin/blog", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const post = await storage.createBlogPost(req.body);
      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to create blog post" });
    }
  });

  app.put("/api/admin/blog/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const post = await storage.updateBlogPost(req.params.id, req.body);
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to update blog post" });
    }
  });

  app.delete("/api/admin/blog/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      await storage.deleteBlogPost(req.params.id);
      res.json({ message: "Blog post deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });

  app.post("/api/admin/resources", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const resource = await storage.createResource(req.body);
      res.status(201).json(resource);
    } catch (error) {
      res.status(500).json({ message: "Failed to create resource" });
    }
  });

  app.put("/api/admin/resources/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const resource = await storage.updateResource(req.params.id, req.body);
      res.json(resource);
    } catch (error) {
      res.status(500).json({ message: "Failed to update resource" });
    }
  });

  app.delete("/api/admin/resources/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      await storage.deleteResource(req.params.id);
      res.json({ message: "Resource deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete resource" });
    }
  });

  // Grower challenge routes
  app.post("/api/challenges", authenticate, requireMember, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertGrowerChallengeSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      
      const challenge = await storage.createGrowerChallenge(validatedData);
      
      // Send notification to all admins
      const user = await storage.getUser(req.user!.id);
      const profile = await storage.getProfile(req.user!.id);
      
      const emailData = formatChallengeEmail({
        userName: profile?.name || user?.username || 'Unknown User',
        userEmail: user?.email || 'Unknown Email',
        category: validatedData.category || 'Not specified',
        farmSize: 'Not specified',
        description: validatedData.description,
        challengeId: challenge.id,
      });
      
      await notifyAllAdmins(emailData);
      
      res.status(201).json(challenge);
    } catch (error) {
      console.error("Create challenge error:", error);
      res.status(500).json({ message: "Failed to submit challenge" });
    }
  });

  // Admin grower challenge routes
  app.get("/api/admin/challenges", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const challenges = await storage.getAllGrowerChallenges();
      console.log("Fetched challenges:", challenges.length);
      res.json(challenges);
    } catch (error) {
      console.error("Get challenges error:", error);
      res.status(500).json({ message: "Failed to fetch challenges" });
    }
  });

  app.patch("/api/admin/challenges/:id/flag", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { adminFlag } = req.body;
      const challenge = await storage.updateGrowerChallengeFlag(req.params.id, adminFlag);
      res.json(challenge);
    } catch (error) {
      console.error("Update challenge flag error:", error);
      res.status(500).json({ message: "Failed to update challenge flag" });
    }
  });

  app.get("/api/admin/challenges/stats", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const stats = await storage.getGrowerChallengeStats();
      console.log("Fetched stats:", stats);
      res.json(stats);
    } catch (error) {
      console.error("Get challenge stats error:", error);
      res.status(500).json({ message: "Failed to fetch challenge statistics" });
    }
  });

  // Expert request routes
  app.post("/api/expert-requests", authenticate, requireMember, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertExpertRequestSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      
      const request = await storage.createExpertRequest(validatedData);
      
      // Send notification to all admins
      const user = await storage.getUser(req.user!.id);
      const profile = await storage.getProfile(req.user!.id);
      
      const emailData = formatExpertRequestEmail({
        userName: profile?.name || user?.username || 'Unknown User',
        userEmail: user?.email || 'Unknown Email',
        userPhone: profile?.phone || 'Not provided',
        topic: validatedData.subject,
        description: validatedData.message,
        preferredContactMethod: validatedData.preferredContactMethod,
        requestId: request.id,
      });
      
      await notifyAllAdmins(emailData);
      
      res.status(201).json(request);
    } catch (error) {
      console.error("Create expert request error:", error);
      res.status(500).json({ message: "Failed to submit expert request" });
    }
  });

  app.get("/api/expert-requests", authenticate, requireMember, async (req: AuthRequest, res) => {
    try {
      const requests = await storage.getUserExpertRequests(req.user!.id);
      res.json(requests);
    } catch (error) {
      console.error("Get expert requests error:", error);
      res.status(500).json({ message: "Failed to fetch expert requests" });
    }
  });

  // Admin expert request routes
  app.get("/api/admin/expert-requests", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const requests = await storage.getAllExpertRequests();
      res.json(requests);
    } catch (error) {
      console.error("Get all expert requests error:", error);
      res.status(500).json({ message: "Failed to fetch expert requests" });
    }
  });

  app.patch("/api/admin/expert-requests/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { status, adminNotes } = req.body;
      const request = await storage.updateExpertRequestStatus(req.params.id, status, adminNotes);
      res.json(request);
    } catch (error) {
      console.error("Update expert request error:", error);
      res.status(500).json({ message: "Failed to update expert request" });
    }
  });

  // Forum routes
  app.get("/api/forum/posts", authenticate, requireMember, async (req: AuthRequest, res) => {
    try {
      const { search, region, county, category } = req.query;
      const posts = await storage.getAllForumPosts({
        searchQuery: search as string,
        region: region as string,
        county: county as string,
        category: category as string,
      });
      res.json(posts);
    } catch (error) {
      console.error("Get forum posts error:", error);
      res.status(500).json({ message: "Failed to fetch forum posts" });
    }
  });

  app.post("/api/forum/posts", authenticate, requireMember, async (req: AuthRequest, res) => {
    try {
      const postData = {
        ...req.body,
        userId: req.user!.id,
      };
      const post = await storage.createForumPost(postData);
      res.status(201).json(post);
    } catch (error) {
      console.error("Create forum post error:", error);
      res.status(500).json({ message: "Failed to create forum post" });
    }
  });

  // Edit forum post
  app.put("/api/forum/posts/:id", authenticate, requireMember, async (req: AuthRequest, res) => {
    try {
      const postId = req.params.id;
      const updates = req.body;
      
      // Check if user owns the post
      const post = await storage.getForumPost(postId);
      if (!post || post.userId !== req.user!.id) {
        return res.status(403).json({ message: "You can only edit your own posts" });
      }
      
      const updatedPost = await storage.updateForumPost(postId, updates);
      res.json(updatedPost);
    } catch (error) {
      console.error("Edit forum post error:", error);
      res.status(500).json({ message: "Failed to edit post" });
    }
  });

  // Delete forum post
  app.delete("/api/forum/posts/:id", authenticate, requireMember, async (req: AuthRequest, res) => {
    try {
      const postId = req.params.id;
      
      // Check if user owns the post
      const post = await storage.getForumPost(postId);
      if (!post || post.userId !== req.user!.id) {
        return res.status(403).json({ message: "You can only delete your own posts" });
      }
      
      const deletedPost = await storage.softDeleteForumPost(postId);
      res.json(deletedPost);
    } catch (error) {
      console.error("Delete forum post error:", error);
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  app.post("/api/forum/posts/:postId/comments", authenticate, requireMember, async (req: AuthRequest, res) => {
    try {
      const commentData = {
        postId: req.params.postId,
        userId: req.user!.id,
        content: req.body.content,
        attachments: req.body.attachments || [],
      };
      const comment = await storage.createForumComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      console.error("Create forum comment error:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Edit forum comment
  app.put("/api/forum/posts/:postId/comments/:id", authenticate, requireMember, async (req: AuthRequest, res) => {
    try {
      const commentId = req.params.id;
      const updates = req.body;
      
      // Find the comment to check ownership
      const post = await storage.getForumPost(req.params.postId);
      const comment = post?.comments.find(c => c.id === commentId);
      
      if (!comment || comment.userId !== req.user!.id) {
        return res.status(403).json({ message: "You can only edit your own comments" });
      }
      
      const updatedComment = await storage.updateForumComment(commentId, updates);
      res.json(updatedComment);
    } catch (error) {
      console.error("Edit forum comment error:", error);
      res.status(500).json({ message: "Failed to edit comment" });
    }
  });

  // Delete forum comment
  app.delete("/api/forum/posts/:postId/comments/:id", authenticate, requireMember, async (req: AuthRequest, res) => {
    try {
      const commentId = req.params.id;
      
      // Find the comment to check ownership
      const post = await storage.getForumPost(req.params.postId);
      const comment = post?.comments.find(c => c.id === commentId);
      
      if (!comment || comment.userId !== req.user!.id) {
        return res.status(403).json({ message: "You can only delete your own comments" });
      }
      
      const deletedComment = await storage.softDeleteForumComment(commentId);
      res.json(deletedComment);
    } catch (error) {
      console.error("Delete forum comment error:", error);
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  // Forum voting routes
  
  // Vote on a post
  app.post("/api/forum/posts/:id/vote", authenticate, requireMember, async (req: AuthRequest, res) => {
    try {
      const postId = req.params.id;
      const { value } = req.body; // 1 for upvote, -1 for downvote
      
      if (value !== 1 && value !== -1) {
        return res.status(400).json({ message: "Vote value must be 1 or -1" });
      }
      
      const vote = await storage.createOrUpdateVote(req.user!.id, 'post', postId, value);
      const voteStats = await storage.getVotesForEntity('post', postId);
      
      res.json({ vote, ...voteStats });
    } catch (error) {
      console.error("Vote on post error:", error);
      res.status(500).json({ message: "Failed to vote on post" });
    }
  });

  // Remove vote from a post
  app.delete("/api/forum/posts/:id/vote", authenticate, requireMember, async (req: AuthRequest, res) => {
    try {
      const postId = req.params.id;
      
      await storage.removeVote(req.user!.id, 'post', postId);
      const voteStats = await storage.getVotesForEntity('post', postId);
      
      res.json(voteStats);
    } catch (error) {
      console.error("Remove vote from post error:", error);
      res.status(500).json({ message: "Failed to remove vote from post" });
    }
  });

  // Vote on a comment
  app.post("/api/forum/comments/:id/vote", authenticate, requireMember, async (req: AuthRequest, res) => {
    try {
      const commentId = req.params.id;
      const { value } = req.body; // 1 for upvote, -1 for downvote
      
      if (value !== 1 && value !== -1) {
        return res.status(400).json({ message: "Vote value must be 1 or -1" });
      }
      
      const vote = await storage.createOrUpdateVote(req.user!.id, 'comment', commentId, value);
      const voteStats = await storage.getVotesForEntity('comment', commentId);
      
      res.json({ vote, ...voteStats });
    } catch (error) {
      console.error("Vote on comment error:", error);
      res.status(500).json({ message: "Failed to vote on comment" });
    }
  });

  // Remove vote from a comment
  app.delete("/api/forum/comments/:id/vote", authenticate, requireMember, async (req: AuthRequest, res) => {
    try {
      const commentId = req.params.id;
      
      await storage.removeVote(req.user!.id, 'comment', commentId);
      const voteStats = await storage.getVotesForEntity('comment', commentId);
      
      res.json(voteStats);
    } catch (error) {
      console.error("Remove vote from comment error:", error);
      res.status(500).json({ message: "Failed to remove vote from comment" });
    }
  });

  // Get vote stats for a post
  app.get("/api/forum/posts/:id/votes", authenticate, requireMember, async (req: AuthRequest, res) => {
    try {
      const postId = req.params.id;
      const voteStats = await storage.getVotesForEntity('post', postId);
      const userVote = await storage.getUserVote(req.user!.id, 'post', postId);
      
      res.json({ ...voteStats, userVote: userVote?.value });
    } catch (error) {
      console.error("Get post votes error:", error);
      res.status(500).json({ message: "Failed to get post votes" });
    }
  });

  // Get vote stats for a comment
  app.get("/api/forum/comments/:id/votes", authenticate, requireMember, async (req: AuthRequest, res) => {
    try {
      const commentId = req.params.id;
      const voteStats = await storage.getVotesForEntity('comment', commentId);
      const userVote = await storage.getUserVote(req.user!.id, 'comment', commentId);
      
      res.json({ ...voteStats, userVote: userVote?.value });
    } catch (error) {
      console.error("Get comment votes error:", error);
      res.status(500).json({ message: "Failed to get comment votes" });
    }
  });

  // Forum post favorites
  app.post("/api/forum/posts/:postId/favorite", authenticate, requireMember, async (req: AuthRequest, res) => {
    try {
      const postId = req.params.postId;
      const userId = req.user!.id;
      
      const result = await storage.toggleForumPostFavorite(userId, postId);
      res.json(result);
    } catch (error) {
      console.error("Toggle forum post favorite error:", error);
      res.status(500).json({ message: "Failed to save post" });
    }
  });

  app.get("/api/forum/favorites", authenticate, requireMember, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const favoritePostIds = await storage.getUserForumPostFavorites(userId);
      res.json({ favorites: favoritePostIds });
    } catch (error) {
      console.error("Get forum favorites error:", error);
      res.status(500).json({ message: "Failed to get favorites" });
    }
  });

  app.get("/api/forum/posts/:postId/favorite-status", authenticate, requireMember, async (req: AuthRequest, res) => {
    try {
      const postId = req.params.postId;
      const userId = req.user!.id;
      
      const isFavorited = await storage.isForumPostFavorited(userId, postId);
      res.json({ isFavorited });
    } catch (error) {
      console.error("Check forum post favorite status error:", error);
      res.status(500).json({ message: "Failed to check favorite status" });
    }
  });

  // File upload endpoint
  app.post("/api/forum/upload", authenticate, requireMember, upload.single('file'), async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileExtension = path.extname(req.file.originalname);
      const newFileName = `${randomUUID()}${fileExtension}`;
      const newFilePath = path.join(uploadDir, newFileName);
      
      // Rename file to have unique name
      fs.renameSync(req.file.path, newFilePath);
      
      const fileUrl = `/uploads/${newFileName}`;
      res.json({ url: fileUrl });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // Resource image upload and serving routes
  app.post("/api/resource-images/upload", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getResourceImageUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Resource image upload URL error:", error);
      res.status(500).json({ message: "Failed to get upload URL" });
    }
  });

  app.get("/resource-images/:imagePath(*)", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const imagePath = `/resource-images/${req.params.imagePath}`;
      const imageFile = await objectStorageService.getResourceImageFile(imagePath);
      objectStorageService.downloadObject(imageFile, res);
    } catch (error) {
      console.error("Resource image serve error:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.status(404).json({ message: "Image not found" });
      }
      return res.status(500).json({ message: "Failed to serve image" });
    }
  });

  // Farm Roadmap Questions Management Routes
  // Public endpoint to get all active categories and questions
  app.get("/api/farm-roadmap/questions", async (req, res) => {
    try {
      const categories = await storage.getAllFarmRoadmapCategories();
      res.json(categories);
    } catch (error) {
      console.error("Get farm roadmap questions error:", error);
      res.status(500).json({ message: "Failed to fetch farm roadmap questions" });
    }
  });

  // Admin endpoints for managing categories
  app.get("/api/admin/farm-roadmap/categories", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const categories = await storage.getAllFarmRoadmapCategoriesAdmin();
      res.json(categories);
    } catch (error) {
      console.error("Get admin categories error:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/admin/farm-roadmap/categories", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const category = await storage.createFarmRoadmapCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      console.error("Create category error:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.put("/api/admin/farm-roadmap/categories/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const category = await storage.updateFarmRoadmapCategory(req.params.id, req.body);
      res.json(category);
    } catch (error) {
      console.error("Update category error:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/admin/farm-roadmap/categories/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      await storage.deleteFarmRoadmapCategory(req.params.id);
      res.json({ message: "Category deleted" });
    } catch (error) {
      console.error("Delete category error:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Admin endpoints for managing questions
  app.get("/api/admin/farm-roadmap/questions", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { categoryId } = req.query;
      const questions = await storage.getAllFarmRoadmapQuestionsAdmin(categoryId as string);
      res.json(questions);
    } catch (error) {
      console.error("Get admin questions error:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  app.post("/api/admin/farm-roadmap/questions", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const question = await storage.createFarmRoadmapQuestion(req.body);
      res.status(201).json(question);
    } catch (error) {
      console.error("Create question error:", error);
      res.status(500).json({ message: "Failed to create question" });
    }
  });

  app.put("/api/admin/farm-roadmap/questions/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const question = await storage.updateFarmRoadmapQuestion(req.params.id, req.body);
      res.json(question);
    } catch (error) {
      console.error("Update question error:", error);
      res.status(500).json({ message: "Failed to update question" });
    }
  });

  app.delete("/api/admin/farm-roadmap/questions/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      await storage.deleteFarmRoadmapQuestion(req.params.id);
      res.json({ message: "Question deleted" });
    } catch (error) {
      console.error("Delete question error:", error);
      res.status(500).json({ message: "Failed to delete question" });
    }
  });

  // Admin endpoints for managing AI Agent Configurations
  app.get("/api/admin/ai-agent-configs", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const configs = await storage.getAllAiAgentConfigs();
      res.json(configs);
    } catch (error) {
      console.error("Get AI agent configs error:", error);
      res.status(500).json({ message: "Failed to fetch AI agent configurations" });
    }
  });

  app.get("/api/admin/ai-agent-configs/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const config = await storage.getAiAgentConfigByType(req.params.id);
      if (!config) {
        return res.status(404).json({ message: "AI agent configuration not found" });
      }
      res.json(config);
    } catch (error) {
      console.error("Get AI agent config error:", error);
      res.status(500).json({ message: "Failed to fetch AI agent configuration" });
    }
  });

  app.post("/api/admin/ai-agent-configs", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const config = await storage.createAiAgentConfig({
        ...req.body,
        createdBy: req.user!.id,
      });
      res.status(201).json(config);
    } catch (error) {
      console.error("Create AI agent config error:", error);
      res.status(500).json({ message: "Failed to create AI agent configuration" });
    }
  });

  app.put("/api/admin/ai-agent-configs/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const config = await storage.updateAiAgentConfig(req.params.id, req.body);
      res.json(config);
    } catch (error) {
      console.error("Update AI agent config error:", error);
      res.status(500).json({ message: "Failed to update AI agent configuration" });
    }
  });

  app.delete("/api/admin/ai-agent-configs/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      await storage.deleteAiAgentConfig(req.params.id);
      res.json({ message: "AI agent configuration deleted" });
    } catch (error) {
      console.error("Delete AI agent config error:", error);
      res.status(500).json({ message: "Failed to delete AI agent configuration" });
    }
  });

  // Smart search endpoint with AI-powered query interpretation
  app.get("/api/search", authenticate, aiRateLimit, async (req: AuthRequest, res) => {
    try {
      const { q: query } = req.query;
      
      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        return res.status(400).json({ message: "Search query is required" });
      }

      const searchQuery = query.trim();
      
      // Use OpenAI to interpret the search query and extract keywords/intent
      const interpretationPrompt = `You are a search query analyzer for a greenhouse growers association platform. 
Analyze this search query and extract:
1. Primary keywords (comma-separated)
2. Content types the user might be looking for (one or more of: resources, blog, forum, products)
3. Specific resource categories if mentioned (universities, organizations, grants, tools, templates, learning, bulletins, industry_news)

Search query: "${searchQuery}"

Respond in JSON format:
{
  "keywords": ["keyword1", "keyword2"],
  "contentTypes": ["resources", "blog"],
  "resourceTypes": ["universities"]
}`;

      const interpretation = await findGrowerAI(interpretationPrompt, []);
      let searchIntent;
      
      try {
        searchIntent = JSON.parse(interpretation);
      } catch {
        // Fallback if AI response isn't valid JSON
        searchIntent = {
          keywords: [searchQuery],
          contentTypes: ["resources", "blog", "forum", "products"],
          resourceTypes: []
        };
      }

      const results: any = {
        query: searchQuery,
        results: {
          resources: [],
          blog: [],
          forum: []
        }
      };

      // Search resources if requested or by default
      if (!searchIntent.contentTypes || searchIntent.contentTypes.includes("resources")) {
        const resourceResults = await storage.searchResources(searchQuery, searchIntent.resourceTypes);
        results.results.resources = resourceResults.slice(0, 5); // Limit to top 5
      }

      // Search blog posts if requested or by default
      if (!searchIntent.contentTypes || searchIntent.contentTypes.includes("blog")) {
        const blogResults = await storage.searchBlogPosts(searchQuery);
        results.results.blog = blogResults.slice(0, 5);
      }

      // Search forum posts if requested or by default
      if (!searchIntent.contentTypes || searchIntent.contentTypes.includes("forum")) {
        const forumResults = await storage.searchForumPosts(searchQuery);
        results.results.forum = forumResults.slice(0, 5);
      }

      res.json(results);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ message: "Search failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
