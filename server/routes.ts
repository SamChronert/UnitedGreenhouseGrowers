import type { Express } from "express";
import { createServer, type Server } from "http";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
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

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(cookieParser());

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { password, ...userData } = req.body;
      
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
        ...userData,
        passwordHash,
        role: Role.MEMBER,
      });

      // Create profile
      const { name, phone, state, employer, jobTitle, farmType } = req.body;
      await storage.createProfile(user.id, {
        name,
        phone,
        state,
        employer,
        jobTitle,
        farmType,
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
      
      const fromEmail = process.env.FROM_EMAIL || "info@greenhousegrowers.org";
      
      await sendEmail(process.env.SENDGRID_API_KEY!, {
        to: fromEmail,
        from: fromEmail,
        subject: `Contact Form: ${subject}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `,
      });

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
      const user = await storage.getUser(req.user!.id);
      const profile = await storage.getProfile(req.user!.id);
      
      const fromEmail = process.env.FROM_EMAIL || "info@greenhousegrowers.org";
      
      await sendEmail(process.env.SENDGRID_API_KEY!, {
        to: fromEmail,
        from: fromEmail,
        subject: `[UGGA ${type.toUpperCase()}] ${subject}`,
        html: `
          <h2>New ${type} from UGGA Member</h2>
          <p><strong>From:</strong> ${profile?.firstName} ${profile?.lastName} (${user?.email})</p>
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
      });

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
      const { state, farmType } = req.query;
      const resources = await storage.getFilteredResources(
        state as string, 
        farmType as string
      );
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resources" });
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

  // AI routes with rate limiting
  app.post("/api/ai/find-grower", aiRateLimit, authenticate, requireMember, async (req: AuthRequest, res) => {
    try {
      const { question } = req.body;
      
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
      res.status(500).json({ message: "AI service unavailable" });
    }
  });

  app.post("/api/ai/assessment", aiRateLimit, authenticate, requireMember, async (req: AuthRequest, res) => {
    try {
      const { input, sessionId } = req.body;
      
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
      res.status(500).json({ message: "AI service unavailable" });
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
      res.json(stats);
    } catch (error) {
      console.error("Get challenge stats error:", error);
      res.status(500).json({ message: "Failed to fetch challenge statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
