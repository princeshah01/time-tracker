import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import { sql } from "drizzle-orm";
import express from "express";

import { db } from "@/lib/db";
import { invitesRouter } from "@/modules/invites/invites.routes";
import { profileRouter } from "@/modules/profile/profile.routes";
import { securityRouter } from "@/modules/security/security.routes";
import { errorHandler } from "@/shared/http/error-handler";
import { auth } from "./auth";
import { env } from "./env";
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

app.use("/api/profile", profileRouter);
app.use("/api/invites", invitesRouter);
app.use("/api/security", securityRouter);

app.use(errorHandler);

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
