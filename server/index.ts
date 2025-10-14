import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Enable gzip compression for better performance
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  threshold: 1024, // Only compress files larger than 1KB
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Log startup environment
console.log(`Starting UGGA Platform in ${process.env.NODE_ENV || 'development'} mode`);
console.log(`Environment check:`);
console.log(`- DATABASE_URL: ${process.env.DATABASE_URL ? 'configured' : 'missing'}`);
console.log(`- OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? 'configured' : 'missing'}`);
console.log(`- DREAMHOST_SMTP: ${process.env.DREAMHOST_SMTP_USER && process.env.DREAMHOST_SMTP_PASS ? 'configured' : 'missing'}`);
console.log(`- BREVO_SMTP: ${process.env.BREVO_SMTP_USER && process.env.BREVO_SMTP_PASS ? 'configured' : 'missing'}`);
console.log(`- JWT_SECRET: ${process.env.JWT_SECRET ? 'configured' : 'using default'}`);

// Set environment defaults for production
if (process.env.NODE_ENV === 'production') {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' 
      ? "Internal Server Error" 
      : err.message || "Internal Server Error";

    console.error('Server error:', err);
    res.status(status).json({ message });
    
    // Don't throw in production
    if (process.env.NODE_ENV !== 'production') {
      throw err;
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    console.log(`UGGA Platform is running on port ${port}`);
    console.log(`Health check available at: http://localhost:${port}/health`);
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
})();
