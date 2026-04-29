import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "@/env";

if (!env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is required to initialize the database connection"
  );
}

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export const db = drizzle({ client: pool });
