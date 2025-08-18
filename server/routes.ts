import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { 
  authenticate, 
  requireMember, 
  requireAdmin, 
  hashPassword, 
  verifyPassword, 
  generateToken, 
  setAuthCookie, 
  clearAuthCookie,
  type AuthRequest 
} from "./auth";
import { sendEmail } from "./sendgrid";
import { findGrowerAI, assessmentAI } from "./openai";
import { 
  insertUserSchema, 
  insertProfileSchema, 
  insertBlogPostSchema, 
  insertResourceSchema,
  insertGrowerChallengeSchema,
  Role 
} from "@shared/schema";
import { randomUUID } from "crypto";

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

      // Send verification email (simplified for MVP)
      const fromEmail = process.env.FROM_EMAIL || "info@greenhousegrowers.org";
      await sendEmail(process.env.SENDGRID_API_KEY!, {
        to: user.email,
        from: fromEmail,
        subject: "Welcome to UGGA - Email Verification",
        html: `
          <h1>Welcome to United Greenhouse Growers Association!</h1>
          <p>Thank you for joining our community. Your account has been created successfully.</p>
          <p>You can now log in and access all member features.</p>
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

  // Contact form
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const fromEmail = process.env.FROM_EMAIL || "sam@growbig.ag";
      const toEmail = "sam@growbig.ag";
      
      const emailSent = await sendEmail({
        to: toEmail,
        from: fromEmail,
        subject: `UGGA Contact Form: ${subject}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <hr>
          <p><em>This message was sent through the UGGA contact form. Reply directly to respond to the sender.</em></p>
        `,
        text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

This message was sent through the UGGA contact form. Reply directly to respond to the sender.
        `
      });

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
      
      const fromEmail = process.env.FROM_EMAIL || "sam@growbig.ag";
      const toEmail = "sam@growbig.ag";
      
      const emailSent = await sendEmail({
        to: toEmail,
        from: fromEmail,
        subject: `[UGGA ${type.toUpperCase()}] ${subject}`,
        html: `
          <h2>New ${type} from UGGA Member</h2>
          <p><strong>From:</strong> ${profile?.name || user?.username} (${user?.email})</p>
          <p><strong>Member Since:</strong> ${user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</p>
          <p><strong>Organization:</strong> ${profile?.employer || 'Not specified'}</p>
          <p><strong>State:</strong> ${profile?.state || 'Not specified'}</p>
          <p><strong>Type:</strong> ${type}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <hr>
          <p><em>This message was sent through the UGGA member dashboard. Reply directly to respond to the member.</em></p>
        `,
        text: `
New ${type} from UGGA Member

From: ${profile?.name || user?.username} (${user?.email})
Member Since: ${user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
Organization: ${profile?.employer || 'Not specified'}
State: ${profile?.state || 'Not specified'}
Type: ${type}
Subject: ${subject}

Message:
${message}

This message was sent through the UGGA member dashboard. Reply directly to respond to the member.
        `
      });

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

  // Resources routes
  app.get("/api/resources", async (req, res) => {
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
            tags.push(...values);
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

  // Analytics route (best-effort)
  app.post("/api/analytics", async (req, res) => {
    try {
      const { name, payload } = req.body;
      const userId = req.headers.authorization ? undefined : null; // Could extract from token if needed
      
      await storage.recordAnalytics({
        user_id: userId,
        name,
        payload: payload || {}
      });
      
      res.json({ message: "Analytics recorded" });
    } catch (error) {
      // Best effort - don't fail the request
      console.warn("Analytics error:", error);
      res.json({ message: "Analytics recorded" });
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

  // Forum routes
  app.get("/api/forum/posts", authenticate, requireMember, async (req: AuthRequest, res) => {
    try {
      const { search, state, county, category } = req.query;
      const posts = await storage.getAllForumPosts({
        searchQuery: search as string,
        state: state as string,
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

  // Assessment training data routes
  app.get("/api/admin/assessment-training", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const trainingData = await storage.getAllAssessmentTrainingData();
      res.json(trainingData);
    } catch (error) {
      console.error("Get assessment training data error:", error);
      res.status(500).json({ message: "Failed to fetch training data" });
    }
  });

  app.post("/api/admin/assessment-training", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const trainingData = await storage.createAssessmentTrainingData(req.body);
      res.status(201).json(trainingData);
    } catch (error) {
      console.error("Create assessment training data error:", error);
      res.status(500).json({ message: "Failed to create training data" });
    }
  });

  app.put("/api/admin/assessment-training/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const trainingData = await storage.updateAssessmentTrainingData(req.params.id, req.body);
      res.json(trainingData);
    } catch (error) {
      console.error("Update assessment training data error:", error);
      res.status(500).json({ message: "Failed to update training data" });
    }
  });

  app.delete("/api/admin/assessment-training/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      await storage.deleteAssessmentTrainingData(req.params.id);
      res.json({ message: "Training data deleted" });
    } catch (error) {
      console.error("Delete assessment training data error:", error);
      res.status(500).json({ message: "Failed to delete training data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
