import express from "express";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import cors from "cors";
import { sql } from "drizzle-orm";

import { auth } from "./auth";
import { env } from "./env";
import { db } from "@/lib/db";
import { connectRedis } from "./lib/redis";
import { startQueueWorkers } from "./workers";

const app = express();

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use(express.json());

app.get("/api/me", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session?.user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const user = session.user as Record<string, unknown>;
  const permissions = Array.isArray(user.permissions)
    ? user.permissions.filter(
        (permission): permission is string => typeof permission === "string"
      )
    : [];

  return res.json({
    user,
    permissions,
  });
});

async function assertDatabaseConnection() {
  console.log("Checking database connection...");
  try {
    await db.execute(sql`select 1`);
    console.log("Database connected");
  } catch (error) {
    console.error("Database connection failed");
    console.error(error);
    process.exit(1);
  }
}

async function bootstrap() {
  console.log("Bootstrapping server...");

  await assertDatabaseConnection();

  await connectRedis();

  startQueueWorkers();

  app.listen(env.PORT, () => {
    console.log(`Server listening on port ${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Bootstrap failed");
  console.error(error);
  process.exit(1);
});
