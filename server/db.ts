import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set");
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

let pool: Pool;
let db: ReturnType<typeof drizzle>;

try {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
  
  // Test database connection
  pool.query('SELECT 1').catch(error => {
    console.error('Database connection failed:', error);
  });
} catch (error) {
  console.error('Failed to initialize database:', error);
  throw error;
}

export { pool, db };