// import 'dotenv/config'
// import { Pool, neonConfig } from '@neondatabase/serverless';
// import { drizzle } from 'drizzle-orm/neon-serverless';
// import ws from "ws";
// import * as schema from "@shared/schema";

// neonConfig.webSocketConstructor = ws;

// if (!process.env.DATABASE_URL) {
//   throw new Error(
//     "DATABASE_URL must be set. Did you forget to provision a database?",
//   );
// }

// export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// export const db = drizzle({ client: pool, schema });


// server/db.ts
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set in your .env");
}

// Instantiate a single, shared client
export const prisma = new PrismaClient({
  // Optional: if you need SSL or special flags, you can pass them here
  // datasources: { db: { url: process.env.DATABASE_URL } }
});

// (Optional) immediately test connectivity
(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log(" Prisma connected to database");
  } catch (e) {
    console.error("Prisma connection failed", e);
    process.exit(1);
  }
})();
